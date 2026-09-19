import { ApiError } from "@/services/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  createCampaign,
  deleteCampaign,
  fetchCampaignPlatformServices,
  fetchCampaigns,
  updateCampaign,
} from "../api/service";
import {
  CAMPAIGN_PLATFORM_SERVICES_QUERY_KEY,
  CAMPAIGNS_STALE_TIME_MS,
  PLAN_CAMPAIGNS_QUERY_KEY,
} from "../constants";
import type {
  CampaignsQueryParams,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../types";

export function usePlanCampaigns(params: CampaignsQueryParams = {}) {
  return useQuery({
    queryKey: [
      PLAN_CAMPAIGNS_QUERY_KEY,
      params.page ?? 1,
      params.limit ?? 100,
      params.isActive ?? "all",
    ],
    queryFn: () => fetchCampaigns(params),
    staleTime: CAMPAIGNS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
}

export function useCampaignPlatformServices() {
  return useQuery({
    queryKey: [CAMPAIGN_PLATFORM_SERVICES_QUERY_KEY],
    queryFn: fetchCampaignPlatformServices,
    staleTime: CAMPAIGNS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePlanCampaign() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: CreateCampaignInput) => createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAN_CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGN_PLATFORM_SERVICES_QUERY_KEY],
      });
      toast.success(t("planCampaigns.toast.created"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("planCampaigns.toast.createFailed");
      toast.error(message);
    },
  });
}

export function useUpdatePlanCampaign() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: UpdateCampaignInput;
    }) => updateCampaign(uuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAN_CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGN_PLATFORM_SERVICES_QUERY_KEY],
      });
      toast.success(t("planCampaigns.toast.updated"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("planCampaigns.toast.updateFailed");
      toast.error(message);
    },
  });
}

export function useDeletePlanCampaign() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (uuid: string) => deleteCampaign(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAN_CAMPAIGNS_QUERY_KEY] });
      toast.success(t("planCampaigns.toast.deleted"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("planCampaigns.toast.deleteFailed");
      toast.error(message);
    },
  });
}
