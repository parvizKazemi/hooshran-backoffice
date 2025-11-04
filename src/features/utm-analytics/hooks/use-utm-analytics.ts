import { ApiError } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { mockUtmEvents } from "../mock-data";
import { PaginatedResponse, UtmAnalyticsQueryParams, UtmEvent } from "../types";

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
