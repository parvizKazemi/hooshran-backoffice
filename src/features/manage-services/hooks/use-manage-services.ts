import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { fetchManageServices, saveManageServices } from "../api/service";
import { MANAGE_SERVICES_QUERY_KEY } from "../constants";
import type { ManageServicePayload } from "../types";

export function useManageServices() {
  const { t } = useTranslation("common");

  return useQuery({
    queryKey: MANAGE_SERVICES_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchManageServices();
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
  payload: ManageServicePayload[];
  useCreate?: boolean;
};

export function useSaveManageServices() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({ payload, useCreate }: SaveManageServicesInput) =>
      saveManageServices(payload, { useCreate }),
    onSuccess: (data) => {
      queryClient.setQueryData(MANAGE_SERVICES_QUERY_KEY, data);
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
