import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getPlatformServices,
  getUtmContentRewardRules,
  updatePresentTokenEnabled,
  updateUtmContentRewardRules,
} from "../api/service";
import type { UpdateUtmContentRewardRulesInput } from "../types";

const UTM_CONTENT_REWARD_RULES_QUERY_KEY = [
  "utm-content-reward-rules",
] as const;
const PLATFORM_SERVICES_QUERY_KEY = ["platform-services"] as const;

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

type SaveWelcomePackagesPayload = {
  rules: UpdateUtmContentRewardRulesInput;
  registrationGiftEnabled: boolean;
};

export function useSaveWelcomePackagesSettings() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rules,
      registrationGiftEnabled,
    }: SaveWelcomePackagesPayload) => {
      await updatePresentTokenEnabled(registrationGiftEnabled);
      return updateUtmContentRewardRules(rules);
    },
    onSuccess: (rules) => {
      queryClient.setQueryData(UTM_CONTENT_REWARD_RULES_QUERY_KEY, rules);
      queryClient.invalidateQueries({ queryKey: ["present-token-config"] });
      toast.success(t("welcomePackages.toasts.saved"));
    },
    onError: () => {
      toast.error(t("welcomePackages.toasts.saveFailed"));
    },
  });
}
