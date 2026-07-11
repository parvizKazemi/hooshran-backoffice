import { apiGet, apiPatch, apiPost } from "@/services/api";
import type { SmsConfigResponse, UpdateSmsConfigPayload } from "../types";
import { SMS_CONFIG_ENDPOINTS } from "./endpoints";

export async function getSmsConfig(): Promise<SmsConfigResponse> {
  return apiGet<SmsConfigResponse>(SMS_CONFIG_ENDPOINTS.config);
}

export async function updateSmsConfig(
  payload: UpdateSmsConfigPayload
): Promise<SmsConfigResponse> {
  return apiPatch<SmsConfigResponse>(SMS_CONFIG_ENDPOINTS.config, payload);
}

export async function resetSmsConfig(): Promise<SmsConfigResponse> {
  return apiPost<SmsConfigResponse>(SMS_CONFIG_ENDPOINTS.reset);
}
