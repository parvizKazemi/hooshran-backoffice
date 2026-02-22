import { ApiError, apiGet, apiPatch } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mockUtmEvents } from "../mock-data";
import {
  PaginatedResponse,
  PresentTokenConfig,
  UpdateUtmContentRewardRulesInput,
  UtmContentRewardRule,
  UtmAnalyticsQueryParams,
  UtmEvent,
} from "../types";

export const useUtmAnalytics = (params: UtmAnalyticsQueryParams = {}) => {
  return useQuery({
    queryKey: ["utm-analytics", params],
    queryFn: async (): Promise<PaginatedResponse<UtmEvent>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockUtmEvents];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (event) =>
              event.user_name?.toLowerCase().includes(query) ||
              event.user_phone?.toLowerCase().includes(query) ||
              event.source?.toLowerCase().includes(query) ||
              event.campaign?.toLowerCase().includes(query)
          );
        }
        if (params.event_type && params.event_type !== "all") {
          filtered = filtered.filter(
            (event) => event.event_type === params.event_type
          );
        }
        if (params.source) {
          filtered = filtered.filter((event) => event.source === params.source);
        }
        if (params.medium) {
          filtered = filtered.filter((event) => event.medium === params.medium);
        }
        if (params.campaign) {
          filtered = filtered.filter(
            (event) => event.campaign === params.campaign
          );
        }
        const page = params.page || 1;
        const take = params.take || 10;
        const start = (page - 1) * take;
        const end = start + take;
        return {
          data: filtered.slice(start, end),
          total: filtered.length,
          page,
          take,
          totalPages: Math.ceil(filtered.length / take),
        };
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePresentTokenConfig = () => {
  return useQuery({
    queryKey: ["present-token-config"],
    queryFn: async (): Promise<PresentTokenConfig> => {
      try {
        const response = await apiGet<PresentTokenConfig>(
          "/admin/present-token/config"
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUpdatePresentTokenConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      isEnabled,
    }: {
      isEnabled: boolean;
    }): Promise<PresentTokenConfig> => {
      try {
        const response = await apiPatch<PresentTokenConfig>(
          "/admin/present-token/config",
          {
            isEnabled,
          }
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(["present-token-config"], updatedConfig);
      toast.success("تنظیمات تخصیص اعتبار با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی تنظیمات تخصیص اعتبار");
      }
    },
  });
};

export const useUtmContentRewardRules = () => {
  return useQuery({
    queryKey: ["utm-content-reward-rules"],
    queryFn: async (): Promise<UtmContentRewardRule[]> => {
      try {
        const response = await apiGet<UtmContentRewardRule[]>(
          "/admin/utm-content-reward-rules"
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateUtmContentRewardRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateUtmContentRewardRulesInput
    ): Promise<UtmContentRewardRule[]> => {
      try {
        const response = await apiPatch<UtmContentRewardRule[]>(
          "/admin/utm-content-reward-rules",
          data
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: (rules) => {
      queryClient.setQueryData(["utm-content-reward-rules"], rules);
      toast.success("قوانین پاداش UTM با موفقیت ذخیره شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ذخیره قوانین پاداش UTM");
      }
    },
  });
};
