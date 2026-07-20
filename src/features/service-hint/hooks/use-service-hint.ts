import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getPlatformServices,
  getServiceHintConfig,
  updateServiceHintConfig,
} from "../api/service";
import type { ServiceHintConfig } from "../types";

const PLATFORM_SERVICES_QUERY_KEY = [
  "service-hint-platform-services",
  "with-template",
] as const;

export const serviceHintQueryKey = (serviceUuid: string) =>
  ["service-hint-guide", serviceUuid] as const;

export function useServiceHintPlatformServices() {
  return useQuery({
    queryKey: PLATFORM_SERVICES_QUERY_KEY,
    queryFn: getPlatformServices,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useServiceHintConfig(serviceUuid: string | undefined) {
  return useQuery({
    queryKey: serviceHintQueryKey(serviceUuid ?? "unknown"),
    queryFn: () => getServiceHintConfig(serviceUuid ?? ""),
    enabled: Boolean(serviceUuid),
    refetchOnWindowFocus: false,
  });
}

export function useSaveServiceHintConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceUuid,
      sections,
    }: {
      serviceUuid: string;
      sections: ServiceHintConfig;
    }) => updateServiceHintConfig(serviceUuid, sections),
    onSuccess: (sections, variables) => {
      queryClient.setQueryData(
        serviceHintQueryKey(variables.serviceUuid),
        sections
      );
      toast.success(t("serviceHint.toasts.saved"));
    },
    onError: () => {
      toast.error(t("serviceHint.toasts.saveFailed"));
    },
  });
}
