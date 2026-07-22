import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fetchManageServiceDetail,
  fetchManageServices,
  syncManageServicesUpdateData,
  updateManageServiceCustomData,
} from "../api/service";
import { MANAGE_SERVICES_QUERY_KEY } from "../constants";
import type { ManageService } from "../types";

export function manageServicesQueryKey(categorySlug?: string | null) {
  return [...MANAGE_SERVICES_QUERY_KEY, categorySlug ?? "all"] as const;
}

/**
 * @param categorySlug - category slug for `GET /admin/api-services?type={slug}`.
 */
export function useManageServices(options?: {
  categorySlug?: string | null;
  enabled?: boolean;
}) {
  const { t } = useTranslation("common");
  const categorySlug = options?.categorySlug ?? null;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: manageServicesQueryKey(categorySlug),
    enabled,
    queryFn: async () => {
      try {
        return await fetchManageServices(categorySlug);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error(t("manageServices.toasts.loadFailed"));
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

type SaveManageServicesInput = {
  items: ManageService[];
  categorySlugByUuid?: Record<string, string>;
  categoryNameByUuid?: Record<string, string>;
};

/** Overall sync → POST `/admin/api-service/update-data` (+ custom-data overrides). */
export function useSaveManageServices() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      items,
      categorySlugByUuid,
      categoryNameByUuid,
    }: SaveManageServicesInput) =>
      syncManageServicesUpdateData(items, {
        categorySlugByUuid,
        categoryNameByUuid,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: MANAGE_SERVICES_QUERY_KEY,
      });
      toast.success(t("manageServices.toasts.saved"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("manageServices.toasts.saveFailed")
      );
    },
  });
}

export function useManageServiceDetail() {
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      uuid,
      fallback,
    }: {
      uuid: string;
      fallback?: Partial<ManageService>;
    }) => fetchManageServiceDetail(uuid, fallback),
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("manageServices.toasts.detailFailed")
      );
    },
  });
}

/** Table edit → PUT `/admin/services/{uuid}/custom-data` */
export function useUpsertServiceCustomData(categorySlug?: string | null) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      service,
      patch,
    }: {
      service: ManageService;
      patch?: Partial<
        Pick<ManageService, "isActive" | "name" | "description" | "badge">
      >;
    }) => updateManageServiceCustomData(service, patch),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<ManageService[]>(
        manageServicesQueryKey(categorySlug),
        (current) =>
          (current ?? []).map((item) =>
            item.uuid === updated.uuid ? { ...item, ...updated } : item
          )
      );

      if (
        variables.patch &&
        Object.keys(variables.patch).length === 1 &&
        "isActive" in variables.patch
      ) {
        toast.success(
          updated.isActive
            ? t("manageServices.toasts.activated")
            : t("manageServices.toasts.deactivated")
        );
      } else {
        toast.success(t("manageServices.toasts.customSaved"));
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("manageServices.toasts.toggleFailed")
      );
    },
  });
}

/** @deprecated use useUpsertServiceCustomData */
export function useToggleManageServiceActive(categorySlug?: string | null) {
  return useUpsertServiceCustomData(categorySlug);
}
