import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fetchManageServiceDetail,
  fetchManageServices,
  syncManageServicesChildrens,
  syncManageServicesUpdateData,
  updateManageServiceCustomData,
} from "../api/service";
import { MANAGE_SERVICES_QUERY_KEY } from "../constants";
import type { ManageService } from "../types";

export function manageServicesQueryKey(category?: string | null) {
  return [...MANAGE_SERVICES_QUERY_KEY, category ?? "all"] as const;
}

/**
 * @param category - category slug/name/uuid for `GET /admin/api-services?category=`
 */
export function useManageServices(options?: {
  category?: string | null;
  enabled?: boolean;
}) {
  const { t } = useTranslation("common");
  const category = options?.category ?? null;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: manageServicesQueryKey(category),
    enabled,
    queryFn: async () => {
      try {
        return await fetchManageServices(category);
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
};

/** Persist draft via PUT `/admin/services/{uuid}/custom-data` (not update-data). */
export function useSaveManageServices() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({ items }: SaveManageServicesInput) =>
      syncManageServicesUpdateData(items),
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

export function useSyncManageServicesChildrens() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: () => syncManageServicesChildrens(),
    onSuccess: async ({ updatedParents, scannedParents, emptyParents }) => {
      await queryClient.invalidateQueries({
        queryKey: MANAGE_SERVICES_QUERY_KEY,
      });
      if (updatedParents === 0) {
        toast.info(
          t("manageServices.toasts.childrensSyncNoChanges", {
            empty: emptyParents,
            total: scannedParents,
          }),
          { id: "manage-services-childrens-sync" }
        );
        return;
      }

      toast.success(
        t("manageServices.toasts.childrensSynced", {
          updated: updatedParents,
          empty: emptyParents,
          total: scannedParents,
        }),
        { id: "manage-services-childrens-sync" }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("manageServices.toasts.childrensSyncFailed")
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
export function useUpsertServiceCustomData(category?: string | null) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      service,
      patch,
    }: {
      service: ManageService;
      patch?: Partial<
        Pick<
          ManageService,
          | "isActive"
          | "searchable"
          | "display"
          | "name"
          | "description"
          | "badge"
        >
      >;
    }) => updateManageServiceCustomData(service, patch),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<ManageService[]>(
        manageServicesQueryKey(category),
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
export function useToggleManageServiceActive(category?: string | null) {
  return useUpsertServiceCustomData(category);
}
