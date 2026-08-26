import { apiGet, apiPatch } from "@/services/api";
import { PAYMENT_METHODS_ENDPOINTS } from "../constants";
import type {
  PaymentMethodsConfig,
  UpdatePaymentMethodsConfigPayload,
} from "../types";

export async function getPaymentMethodsConfig(): Promise<PaymentMethodsConfig> {
  return apiGet<PaymentMethodsConfig>(PAYMENT_METHODS_ENDPOINTS.config);
}

export async function updatePaymentMethodsConfig(
  payload: UpdatePaymentMethodsConfigPayload
): Promise<PaymentMethodsConfig> {
  return apiPatch<PaymentMethodsConfig>(
    PAYMENT_METHODS_ENDPOINTS.config,
    payload
  );
}
