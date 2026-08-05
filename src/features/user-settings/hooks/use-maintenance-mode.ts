import { useAuth } from "@/contexts/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  disableMaintenanceMode,
  enableMaintenanceMode,
  loadMaintenanceModeSnapshot,
} from "../maintenance-mode/service";
import { readMaintenanceModeState } from "../maintenance-mode/storage";
import type { MaintenanceModeFormState } from "../maintenance-mode/types";

const MAINTENANCE_MODE_QUERY_KEY = ["maintenance-mode"] as const;
const PAYMENT_GATE_CONFIG_QUERY_KEY = ["payment-gate-config"] as const;
const REQUEST_TOOLS_GATE_CONFIG_QUERY_KEY = [
  "request-tools-gate-config",
] as const;

export function useMaintenanceModeState() {
  return useQuery({
    queryKey: MAINTENANCE_MODE_QUERY_KEY,
    queryFn: () => readMaintenanceModeState(),
    staleTime: Infinity,
  });
}

export function useApplyMaintenanceMode() {
  const { t } = useTranslation("common");
  const { authData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: MaintenanceModeFormState) => {
      const persistedState = readMaintenanceModeState();

      if (form.isEnabled) {
        const snapshot = await loadMaintenanceModeSnapshot();
        return enableMaintenanceMode({
          form,
          snapshot,
          outageTitle: t("userSettings.maintenancePage.defaults.outageTitle"),
          adminUserId: authData?.user.uuid,
        });
      }

      if (!persistedState?.notificationId) {
        throw new Error(
          t("userSettings.maintenancePage.errors.missingNotification")
        );
      }

      await disableMaintenanceMode({
        snapshot: {
          previousPaymentGate: persistedState.previousPaymentGate,
          previousRequestToolsGate: persistedState.previousRequestToolsGate,
        },
        notificationId: persistedState.notificationId,
        currentForm: form,
        outageTitle: t("userSettings.maintenancePage.defaults.outageTitle"),
      });

      return null;
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData(MAINTENANCE_MODE_QUERY_KEY, result);
      queryClient.invalidateQueries({
        queryKey: PAYMENT_GATE_CONFIG_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: REQUEST_TOOLS_GATE_CONFIG_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.success(
        variables.isEnabled
          ? t("userSettings.maintenancePage.toasts.enabled")
          : t("userSettings.maintenancePage.toasts.disabled")
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : t("userSettings.maintenancePage.toasts.failed");
      toast.error(message);
    },
  });
}
