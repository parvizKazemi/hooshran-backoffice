import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getRequestToolsGateConfig,
  getSubscriptionFreezeConfig,
  getPaymentGateConfig,
  getUserSettings,
  startSubscriptionFreeze,
  updateRequestToolsGateConfig,
  updatePaymentGateConfig,
  updateSubscriptionFreezeConfig,
  updatePurchasePaymentSettings,
  updateRegistrationSettings,
} from "../api/service";
import type {
  PurchasePaymentSettings,
  RequestToolsGateSettings,
  RegistrationSettings,
  SubscriptionFreezeConfig,
  SubscriptionFreezeStartPayload,
  UserSettingsState,
} from "../types";

const USER_SETTINGS_QUERY_KEY = ["user-settings"] as const;
const PAYMENT_GATE_CONFIG_QUERY_KEY = ["payment-gate-config"] as const;
const SUBSCRIPTION_FREEZE_CONFIG_QUERY_KEY = [
  "subscription-freeze-config",
] as const;
const REQUEST_TOOLS_GATE_CONFIG_QUERY_KEY = [
  "request-tools-gate-config",
] as const;

const normalizeErrorMessage = (message: string): string =>
  message.toLowerCase().replace(/\s+/g, " ").trim();

const resolveUserFriendlySettingsError = (
  message: string,
  t: (key: string) => string
): string => {
  const normalizedMessage = normalizeErrorMessage(message);
  const hasTitleRequired = normalizedMessage.includes(
    t("userSettings.errors.titleRequiredBackend").toLowerCase()
  );
  const hasMessageRequired = normalizedMessage.includes(
    t("userSettings.errors.messageRequiredBackend").toLowerCase()
  );

  if (hasTitleRequired && hasMessageRequired) {
    return t("userSettings.errors.titleAndMessageRequired");
  }
  if (hasTitleRequired) {
    return t("userSettings.errors.titleRequired");
  }
  if (hasMessageRequired) {
    return t("userSettings.errors.messageRequired");
  }

  return message;
};

const withErrorToast = (
  error: unknown,
  fallbackMessage: string,
  t: (key: string) => string
) => {
  if (error instanceof Error && error.message) {
    toast.error(resolveUserFriendlySettingsError(error.message, t));
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

export function useSubscriptionFreezeConfig() {
  return useQuery({
    queryKey: SUBSCRIPTION_FREEZE_CONFIG_QUERY_KEY,
    queryFn: getSubscriptionFreezeConfig,
  });
}

export function useUpdateSubscriptionFreezeConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionFreezeConfig) =>
      updateSubscriptionFreezeConfig(payload),
    onSuccess: (updatedData: SubscriptionFreezeConfig) => {
      queryClient.setQueryData(
        SUBSCRIPTION_FREEZE_CONFIG_QUERY_KEY,
        updatedData
      );
      toast.success(t("userSettings.toasts.freezeSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.freezeSaveFailed"), t),
  });
}

export function useRequestToolsGateConfig() {
  return useQuery({
    queryKey: REQUEST_TOOLS_GATE_CONFIG_QUERY_KEY,
    queryFn: getRequestToolsGateConfig,
  });
}

export function useUpdateRequestToolsGateConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestToolsGateSettings) =>
      updateRequestToolsGateConfig(payload),
    onSuccess: (updatedData: RequestToolsGateSettings) => {
      queryClient.setQueryData(
        REQUEST_TOOLS_GATE_CONFIG_QUERY_KEY,
        updatedData
      );
      toast.success(t("userSettings.toasts.requestGateSaved"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.requestGateSaveFailed"), t),
  });
}

export function useStartSubscriptionFreeze() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionFreezeStartPayload) =>
      startSubscriptionFreeze(payload),
    onSuccess: (updatedData: SubscriptionFreezeConfig) => {
      queryClient.setQueryData(
        SUBSCRIPTION_FREEZE_CONFIG_QUERY_KEY,
        updatedData
      );
      toast.success(t("userSettings.toasts.freezeStarted"));
    },
    onError: (error) =>
      withErrorToast(error, t("userSettings.toasts.freezeStartFailed"), t),
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
      withErrorToast(error, t("userSettings.toasts.purchaseSaveFailed"), t),
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
      withErrorToast(error, t("userSettings.toasts.registrationSaveFailed"), t),
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
      withErrorToast(error, t("userSettings.toasts.purchaseSaveFailed"), t),
  });
}
