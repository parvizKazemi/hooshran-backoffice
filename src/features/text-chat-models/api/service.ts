import { apiGet, apiPatch, apiPost } from "@/services/api";
import type {
  CreateTextChatModelPayload,
  TextChatModel,
  UpdateTextChatModelPayload,
} from "../types";
import { TEXT_CHAT_MODEL_ENDPOINTS } from "./endpoints";

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
