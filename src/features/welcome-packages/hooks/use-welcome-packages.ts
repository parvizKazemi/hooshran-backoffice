import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getPlatformServices,
  getPresentTokenConfig,
  getUtmContentRewardRules,
  updatePresentTokenConfig,
  updateUtmContentRewardRules,
} from "../api/service";
import type {
  PresentTokenConfig,
  UpdateUtmContentRewardRulesInput,
} from "../types";

const UTM_CONTENT_REWARD_RULES_QUERY_KEY = [
  "utm-content-reward-rules",
] as const;
const PLATFORM_SERVICES_QUERY_KEY = ["platform-services"] as const;
const PRESENT_TOKEN_CONFIG_QUERY_KEY = ["present-token-config"] as const;

export function useUtmContentRewardRules() {
  return useQuery({
    queryKey: UTM_CONTENT_REWARD_RULES_QUERY_KEY,
    queryFn: getUtmContentRewardRules,
    refetchOnWindowFocus: false,
  });
}

export function usePlatformServices() {
  return useQuery({
    queryKey: PLATFORM_SERVICES_QUERY_KEY,
    queryFn: getPlatformServices,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePresentTokenConfig() {
  return useQuery({
    queryKey: PRESENT_TOKEN_CONFIG_QUERY_KEY,
    queryFn: getPresentTokenConfig,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePresentTokenConfig() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PresentTokenConfig) =>
      updatePresentTokenConfig(payload),
    onSuccess: (config) => {
      queryClient.setQueryData(PRESENT_TOKEN_CONFIG_QUERY_KEY, config);
      toast.success(t("welcomePackages.presentToken.toasts.updated"));
    },
    onError: () => {
      toast.error(t("welcomePackages.presentToken.toasts.updateFailed"));
    },
  });
}

export function useSaveWelcomePackagesSettings() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rules: UpdateUtmContentRewardRulesInput) =>
      updateUtmContentRewardRules(rules),
    onSuccess: (rules) => {
      queryClient.setQueryData(UTM_CONTENT_REWARD_RULES_QUERY_KEY, rules);
      toast.success(t("welcomePackages.toasts.saved"));
    },
    onError: () => {
      toast.error(t("welcomePackages.toasts.saveFailed"));
    },
  });
}
