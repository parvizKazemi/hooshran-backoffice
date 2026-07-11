import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  createSmsProvider,
  getSmsConfig,
  resetSmsConfig,
  updateSmsConfig,
} from "../api/service";
import { SMS_CONFIG_QUERY_KEY } from "../constants";
import type {
  CreateSmsProviderPayload,
  UpdateSmsConfigPayload,
} from "../types";

function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function useSmsConfig() {
  return useQuery({
    queryKey: SMS_CONFIG_QUERY_KEY,
    queryFn: getSmsConfig,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateSmsConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSmsConfigPayload) => updateSmsConfig(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(SMS_CONFIG_QUERY_KEY, data);
      toast.success(t("smsConfig.toasts.saved"));
    },
    onError: (error) => {
      toast.error(
        getBackendErrorMessage(error, t("smsConfig.toasts.saveFailed"))
      );
    },
  });
}

export function useResetSmsConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetSmsConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(SMS_CONFIG_QUERY_KEY, data);
      toast.success(t("smsConfig.toasts.reset"));
    },
    onError: (error) => {
      toast.error(
        getBackendErrorMessage(error, t("smsConfig.toasts.resetFailed"))
      );
    },
  });
}

export function useCreateSmsProvider() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSmsProviderPayload) =>
      createSmsProvider(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(SMS_CONFIG_QUERY_KEY, data);
      toast.success(t("smsConfig.toasts.providerAdded"));
    },
    onError: (error) => {
      toast.error(
        getBackendErrorMessage(error, t("smsConfig.toasts.addFailed"))
      );
    },
  });
}
