import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  addMasterFilter,
  deleteMasterFilter,
  fetchMasterFilters,
  fetchServiceFilters,
  replaceMasterFilters,
  updateServiceFilters,
} from "../api/service";
import { hasFilterName, normalizeFilterList } from "../utils";

const EMPTY_FILTERS: string[] = [];

export const masterFiltersQueryKey = ["master-filters"] as const;
export const serviceFiltersQueryKey = (uuid: string) =>
  ["service-filters", uuid] as const;

export function useMasterFilters(enabled = true) {
  return useQuery({
    queryKey: masterFiltersQueryKey,
    queryFn: fetchMasterFilters,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useServiceFilters(uuid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: serviceFiltersQueryKey(uuid ?? "unknown"),
    queryFn: () => fetchServiceFilters(uuid ?? ""),
    enabled: Boolean(uuid) && enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useAddMasterFilter() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filter: string) => addMasterFilter(filter),
    onSuccess: async (filters) => {
      queryClient.setQueryData(masterFiltersQueryKey, filters);
      toast.success(t("serviceFilters.toasts.created"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("serviceFilters.toasts.createFailed"));
    },
  });
}

export function useRenameMasterFilter() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      currentName,
      nextName,
    }: {
      currentName: string;
      nextName: string;
    }) => {
      const current = queryClient.getQueryData<string[]>(masterFiltersQueryKey);
      const list = current ?? (await fetchMasterFilters());
      const trimmed = nextName.trim();

      if (!trimmed) {
        throw new Error(t("serviceFilters.validation.required"));
      }

      if (
        trimmed.toLowerCase() !== currentName.trim().toLowerCase() &&
        hasFilterName(list, trimmed)
      ) {
        throw new Error(t("serviceFilters.validation.duplicate"));
      }

      const next = list.map((item) =>
        item.toLowerCase() === currentName.trim().toLowerCase() ? trimmed : item
      );

      return replaceMasterFilters(normalizeFilterList(next));
    },
    onSuccess: async (filters) => {
      queryClient.setQueryData(masterFiltersQueryKey, filters);
      toast.success(t("serviceFilters.toasts.updated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("serviceFilters.toasts.updateFailed"));
    },
  });
}

export function useDeleteMasterFilter() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filter: string) => deleteMasterFilter(filter),
    onSuccess: async (filters) => {
      queryClient.setQueryData(masterFiltersQueryKey, filters);
      toast.success(t("serviceFilters.toasts.deleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("serviceFilters.toasts.deleteFailed"));
    },
  });
}

export function useUpdateServiceFilters() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, filters }: { uuid: string; filters: string[] }) =>
      updateServiceFilters(uuid, filters),
    onSuccess: async (filters, variables) => {
      queryClient.setQueryData(serviceFiltersQueryKey(variables.uuid), filters);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("serviceFilters.toasts.serviceUpdateFailed")
      );
    },
  });
}

export { EMPTY_FILTERS };
