import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getTextChatAvailability, updateTextChatAvailability } from "../api/service";
import { TEXT_CHAT_AVAILABILITY_QUERY_KEY } from "../constants";
import type { TextChatAvailabilityConfig } from "../types";

function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useTextChatAvailability() {
  return useQuery({
    queryKey: TEXT_CHAT_AVAILABILITY_QUERY_KEY,
    queryFn: getTextChatAvailability,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useUpdateTextChatAvailability() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TextChatAvailabilityConfig) => updateTextChatAvailability(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(TEXT_CHAT_AVAILABILITY_QUERY_KEY, data);
      toast.success(
        data.isActive
          ? t("textChatModels.availability.toasts.activated")
          : t("textChatModels.availability.toasts.deactivated"),
      );
    },
    onError: (error) => {
      toast.error(
        getBackendErrorMessage(error, t("textChatModels.availability.toasts.failed")),
      );
    },
  });
}
