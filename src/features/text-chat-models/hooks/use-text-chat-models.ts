import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  createTextChatModel,
  getTextChatModels,
  patchTextChatModel,
} from "../api/service";
import { TEXT_CHAT_MODELS_QUERY_KEY } from "../constants";
import type {
  CreateTextChatModelPayload,
  UpdateTextChatModelPayload,
} from "../types";

function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useTextChatModels() {
  return useQuery({
    queryKey: TEXT_CHAT_MODELS_QUERY_KEY,
    queryFn: getTextChatModels,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTextChatModel() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTextChatModelPayload) => createTextChatModel(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TEXT_CHAT_MODELS_QUERY_KEY });
      toast.success(t("textChatModels.toasts.created"));
    },
    onError: (error) => {
      toast.error(getBackendErrorMessage(error, t("textChatModels.toasts.failed")));
    },
  });
}

export function usePatchTextChatModel() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: UpdateTextChatModelPayload;
      toastKey?: "updated" | "activated" | "deactivated";
    }) => patchTextChatModel(code, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: TEXT_CHAT_MODELS_QUERY_KEY });
      const toastKey = variables.toastKey ?? "updated";
      toast.success(t(`textChatModels.toasts.${toastKey}`));
    },
    onError: (error) => {
      toast.error(getBackendErrorMessage(error, t("textChatModels.toasts.failed")));
    },
  });
}
