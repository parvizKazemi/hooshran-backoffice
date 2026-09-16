import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getVpnDetectionConfig,
  updateVpnDetectionConfig,
} from "../api/service";
import { VPN_DETECTION_CONFIG_QUERY_KEY } from "../constants";
import type { UpdateVpnDetectionConfigPayload } from "../types";

function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function useVpnDetectionConfig() {
  return useQuery({
    queryKey: VPN_DETECTION_CONFIG_QUERY_KEY,
    queryFn: getVpnDetectionConfig,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateVpnDetectionConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVpnDetectionConfigPayload) =>
      updateVpnDetectionConfig(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(VPN_DETECTION_CONFIG_QUERY_KEY, data);
      toast.success(
        data.isEnabled
          ? t("vpnDetection.toasts.enabled")
          : t("vpnDetection.toasts.disabled")
      );
    },
    onError: (error) => {
      toast.error(
        getBackendErrorMessage(error, t("vpnDetection.toasts.updateFailed"))
      );
    },
  });
}
