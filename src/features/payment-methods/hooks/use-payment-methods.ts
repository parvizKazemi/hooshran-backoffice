import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getPaymentMethodsConfig,
  updatePaymentMethodsConfig,
} from "../api/service";
import { PAYMENT_METHODS_QUERY_KEY } from "../constants";
import type { UpdatePaymentMethodsConfigPayload } from "../types";

function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function usePaymentMethodsConfig() {
  return useQuery({
    queryKey: PAYMENT_METHODS_QUERY_KEY,
    queryFn: getPaymentMethodsConfig,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePaymentMethodsConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePaymentMethodsConfigPayload) =>
      updatePaymentMethodsConfig(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(PAYMENT_METHODS_QUERY_KEY, data);
      toast.success(t("paymentMethods.toasts.saved"));
    },
    onError: (error) => {
      toast.error(
        getBackendErrorMessage(error, t("paymentMethods.toasts.saveFailed"))
      );
    },
  });
}
