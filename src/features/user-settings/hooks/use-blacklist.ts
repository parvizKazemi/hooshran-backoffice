import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  banUserByPhone,
  getBannedUsers,
  unbanUser,
  updateBannedUser,
} from "../api/blacklist-service";
import type {
  BanUserPayload,
  BannedUsersQueryParams,
  UpdateBanPayload,
} from "../types";

export const BLACKLIST_QUERY_KEY = ["user-blacklist"] as const;

export function useBannedUsers(params: BannedUsersQueryParams = {}) {
  return useQuery({
    queryKey: [...BLACKLIST_QUERY_KEY, params],
    queryFn: () => getBannedUsers(params),
  });
}

export function useBanUser() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BanUserPayload) => banUserByPhone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
      toast.success(t("userSettings.blacklistPage.toasts.banSuccess"));
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        toast.error(t("userSettings.blacklistPage.toasts.userNotFound"));
        return;
      }
      toast.error(t("userSettings.blacklistPage.toasts.banFailed"));
    },
  });
}

export function useUpdateBannedUser() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBanPayload) => updateBannedUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
      toast.success(t("userSettings.blacklistPage.toasts.updateSuccess"));
    },
    onError: () => {
      toast.error(t("userSettings.blacklistPage.toasts.updateFailed"));
    },
  });
}

export function useUnbanUser() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => unbanUser(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLACKLIST_QUERY_KEY });
      toast.success(t("userSettings.blacklistPage.toasts.unbanSuccess"));
    },
    onError: () => {
      toast.error(t("userSettings.blacklistPage.toasts.unbanFailed"));
    },
  });
}
