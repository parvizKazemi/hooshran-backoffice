import { ApiError } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { removeUserByPhoneNumber } from "../api/service";
import type { ClearUserMutationInput } from "../types";

export function useClearUserData() {
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({ phoneNumber, options }: ClearUserMutationInput) =>
      removeUserByPhoneNumber(phoneNumber, options),
    onSuccess: (_data, { phoneNumber, options }) => {
      toast.success(
        options.deleteUser
          ? t("clearUserData.toasts.success", { phone: phoneNumber })
          : t("clearUserData.toasts.partialSuccess", { phone: phoneNumber })
      );
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 403) {
        toast.error(t("clearUserData.toasts.testModeDisabled"));
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : t("clearUserData.toasts.failed")
      );
    },
  });
}
