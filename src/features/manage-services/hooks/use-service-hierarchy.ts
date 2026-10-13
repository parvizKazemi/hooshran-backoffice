import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  fetchHierarchyServices,
  saveServiceHierarchyParents,
} from "../api/service";
import {
  MANAGE_SERVICES_QUERY_KEY,
  MANAGE_SERVICES_STALE_TIME,
  resolveServiceTemplateName,
} from "../constants";
import type { ManageService } from "../types";
import type { HierarchySnapshot } from "../utils/hierarchy.helpers";
import { affectedParentUuids, childrenOf } from "../utils/hierarchy.helpers";
import { toServiceSubmodelFromCatalog } from "../utils/service.helpers";

export const SERVICE_HIERARCHY_QUERY_KEY = [
  ...MANAGE_SERVICES_QUERY_KEY,
  "hierarchy",
] as const;

export function useServiceHierarchyCatalog() {
  const { t } = useTranslation("common");

  return useQuery({
    queryKey: SERVICE_HIERARCHY_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchHierarchyServices();
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : t("manageServices.toasts.loadFailed")
        );
        throw error;
      }
    },
    staleTime: MANAGE_SERVICES_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useSaveServiceHierarchy() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: async ({
      services,
      baseline,
      current,
    }: {
      services: ManageService[];
      baseline: HierarchySnapshot;
      current: HierarchySnapshot;
    }) => {
      const byUuid = new Map(services.map((item) => [item.uuid, item]));
      const parentUuids = affectedParentUuids(baseline, current);

      const parents = parentUuids.flatMap((parentUuid) => {
        const parent = byUuid.get(parentUuid);
        if (!parent) return [];
        const children = childrenOf(parentUuid, current).flatMap((childUuid) => {
          const child = byUuid.get(childUuid);
          return child ? [child] : [];
        });
        return [{ parent, children }];
      });

      await saveServiceHierarchyParents(parents);
    },
    onSuccess: async (_data, variables) => {
      const { services, current } = variables;
      const byUuid = new Map(services.map((item) => [item.uuid, item]));

      const updatedServices = services.map((service) => {
        const nextParentUuid = current.parentByUuid[service.uuid] ?? null;
        const childUuids = current.childrenByUuid[service.uuid] ?? [];
        const nextSubmodels = childUuids.flatMap((childUuid, index) => {
          const child = byUuid.get(childUuid);
          return child
            ? [toServiceSubmodelFromCatalog(child, index + 1)]
            : [];
        });

        const templateName = resolveServiceTemplateName(nextSubmodels.length);

        return {
          ...service,
          parentUuid: nextParentUuid,
          submodels: nextSubmodels,
          templateName,
          modelType: nextSubmodels.length > 0 ? "multi" : service.modelType,
        };
      });

      queryClient.setQueryData(SERVICE_HIERARCHY_QUERY_KEY, updatedServices);

      await queryClient.invalidateQueries({
        queryKey: MANAGE_SERVICES_QUERY_KEY,
      });
      toast.success(t("manageServices.hierarchy.toasts.saved"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("manageServices.hierarchy.toasts.saveFailed")
      );
    },
  });
}
