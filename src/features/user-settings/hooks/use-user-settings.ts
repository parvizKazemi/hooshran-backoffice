import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getPaymentGateConfig,
  getUserSettings,
  updatePaymentGateConfig,
  updateFreezeEndSettings,
  updateFreezeStartSettings,
  updatePurchasePaymentSettings,
  updateRegistrationSettings,
} from "../api/service";
import type {
  FreezeEndSettings,
  FreezeStartSettings,
  PurchasePaymentSettings,
  RegistrationSettings,
  UserSettingsState,
} from "../types";

const USER_SETTINGS_QUERY_KEY = ["user-settings"] as const;
const PAYMENT_GATE_CONFIG_QUERY_KEY = ["payment-gate-config"] as const;

const withErrorToast = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }
  toast.error(fallbackMessage);
};

export function useUserSettings() {
  return useQuery({
    queryKey: USER_SETTINGS_QUERY_KEY,
    queryFn: getUserSettings,
  });
}

export function useUpdateFreezeStartSettings() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FreezeStartSettings) =>
      updateFreezeStartSettings(payload),
    onSuccess: (updatedData: UserSettingsState) => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, updatedData);
      toast.success(t("userSettings.toasts.freezeSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.freezeSaveFailed")),
  });
}

export function useUpdateFreezeEndSettings() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FreezeEndSettings) =>
      updateFreezeEndSettings(payload),
    onSuccess: (updatedData: UserSettingsState) => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, updatedData);
      toast.success(t("userSettings.toasts.unfreezeSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.unfreezeSaveFailed")),
  });
}

export function useUpdatePurchasePaymentSettings() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchasePaymentSettings) =>
      updatePurchasePaymentSettings(payload),
    onSuccess: (updatedData: UserSettingsState) => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, updatedData);
      toast.success(t("userSettings.toasts.purchaseSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.purchaseSaveFailed")),
  });
}

export function useUpdateRegistrationSettings() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegistrationSettings) =>
      updateRegistrationSettings(payload),
    onSuccess: (updatedData: UserSettingsState) => {
      queryClient.setQueryData(USER_SETTINGS_QUERY_KEY, updatedData);
      toast.success(t("userSettings.toasts.registrationSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.registrationSaveFailed")),
  });
}

export function usePaymentGateConfig() {
  return useQuery({
    queryKey: PAYMENT_GATE_CONFIG_QUERY_KEY,
    queryFn: getPaymentGateConfig,
  });
}

export function useUpdatePaymentGateConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchasePaymentSettings) =>
      updatePaymentGateConfig(payload),
    onSuccess: (updatedData: PurchasePaymentSettings) => {
      queryClient.setQueryData(PAYMENT_GATE_CONFIG_QUERY_KEY, updatedData);
      toast.success(t("userSettings.toasts.purchaseSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.purchaseSaveFailed")),
  });
}
