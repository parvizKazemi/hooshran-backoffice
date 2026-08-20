import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/services/api";
import {
  approveAffiliatePayout,
  fetchAffiliateAdminDashboard,
  rejectAffiliatePayout,
  saveAffiliateProgramRules,
  toggleAffiliatePartnerStatus,
} from "../api/service";
import { AFFILIATE_ADMIN_QUERY_KEY } from "../constants";
import type {
  ApproveAffiliatePayoutPayload,
  RejectAffiliatePayoutPayload,
  AffiliateProgramRules,
  ToggleAffiliatePartnerPayload,
} from "../types";

export function useAffiliateAdminDashboard() {
  return useQuery({
    queryKey: [AFFILIATE_ADMIN_QUERY_KEY],
    queryFn: fetchAffiliateAdminDashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

function useAffiliateAdminMutation<TPayload>(
  mutationFn: (
    payload: TPayload
  ) => Promise<Awaited<ReturnType<typeof fetchAffiliateAdminDashboard>>>,
  successMessageKey: string
) {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TPayload) => {
      try {
        return await mutationFn(payload);
      } catch (error) {
        if (error instanceof ApiError) toast.error(error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData([AFFILIATE_ADMIN_QUERY_KEY], data);
      toast.success(t(successMessageKey));
    },
  });
}

export function useApproveAffiliatePayout() {
  return useAffiliateAdminMutation<ApproveAffiliatePayoutPayload>(
    approveAffiliatePayout,
    "affiliate.toasts.approveSuccess"
  );
}

export function useRejectAffiliatePayout() {
  return useAffiliateAdminMutation<RejectAffiliatePayoutPayload>(
    rejectAffiliatePayout,
    "affiliate.toasts.rejectSuccess"
  );
}

export function useToggleAffiliatePartnerStatus() {
  return useAffiliateAdminMutation<ToggleAffiliatePartnerPayload>(
    toggleAffiliatePartnerStatus,
    "affiliate.toasts.partnerStatusUpdated"
  );
}

export function useSaveAffiliateProgramRules() {
  return useAffiliateAdminMutation<AffiliateProgramRules>(
    saveAffiliateProgramRules,
    "affiliate.toasts.rulesSaved"
  );
}
