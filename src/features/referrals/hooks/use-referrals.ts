import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ReferralReward,
  ReferralsQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError } from "@/services/api";
import { mockReferralRewards } from "../mock-data";

export const useReferrals = (params: ReferralsQueryParams = {}) => {
  return useQuery({
    queryKey: ["referrals", params],
    queryFn: async (): Promise<PaginatedResponse<ReferralReward>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockReferralRewards];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (reward) =>
              reward.referrer_name?.toLowerCase().includes(query) ||
              reward.referred_name?.toLowerCase().includes(query) ||
              reward.referrer_phone?.toLowerCase().includes(query) ||
              reward.referred_phone?.toLowerCase().includes(query)
          );
        }
        if (params.referrer_id) {
          filtered = filtered.filter(
            (reward) => reward.referrer_id === params.referrer_id
          );
        }
        if (params.referred_id) {
          filtered = filtered.filter(
            (reward) => reward.referred_id === params.referred_id
          );
        }
        if (params.reward_type && params.reward_type !== "all") {
          filtered = filtered.filter(
            (reward) => reward.reward_type === params.reward_type
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
