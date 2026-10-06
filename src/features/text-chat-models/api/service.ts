import { apiGet, apiPatch, apiPost } from "@/services/api";
import type {
  CreateTextChatModelPayload,
  TextChatAvailabilityConfig,
  TextChatModel,
  UpdateTextChatModelPayload,
} from "../types";
import { TEXT_CHAT_AVAILABILITY_ENDPOINT, TEXT_CHAT_MODEL_ENDPOINTS } from "./endpoints";

function normalizeTextChatAvailability(
  data: Partial<TextChatAvailabilityConfig> | null | undefined,
  fallback?: TextChatAvailabilityConfig,
): TextChatAvailabilityConfig {
  return {
    isActive: typeof data?.isActive === "boolean" ? data.isActive : (fallback?.isActive ?? true),
    message: typeof data?.message === "string" ? data.message : (fallback?.message ?? ""),
  };
}

export async function getTextChatModels(): Promise<TextChatModel[]> {
  const data = await apiGet<TextChatModel[] | { data?: TextChatModel[] }>(
    TEXT_CHAT_MODEL_ENDPOINTS.models
  );
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

export async function createTextChatModel(
  payload: CreateTextChatModelPayload
): Promise<TextChatModel> {
  return apiPost<TextChatModel>(TEXT_CHAT_MODEL_ENDPOINTS.models, payload);
}

export async function patchTextChatModel(
  code: string,
  payload: UpdateTextChatModelPayload
): Promise<TextChatModel> {
  return apiPatch<TextChatModel>(TEXT_CHAT_MODEL_ENDPOINTS.model(code), payload);
}

export async function getTextChatAvailability(): Promise<TextChatAvailabilityConfig> {
  const data = await apiGet<Partial<TextChatAvailabilityConfig>>(TEXT_CHAT_AVAILABILITY_ENDPOINT);
  return normalizeTextChatAvailability(data);
}

export async function updateTextChatAvailability(
  payload: TextChatAvailabilityConfig,
): Promise<TextChatAvailabilityConfig> {
  const data = await apiPatch<Partial<TextChatAvailabilityConfig>>(
    TEXT_CHAT_AVAILABILITY_ENDPOINT,
    payload,
  );
  return normalizeTextChatAvailability(data, payload);
}
