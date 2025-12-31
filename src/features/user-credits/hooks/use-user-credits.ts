import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserCredit,
  UserCreditLog,
  UserCreditsQueryParams,
  UserCreditLogsQueryParams,
  PaginatedResponse,
  LegacyPaginatedResponse,
} from "../types";
import { ApiError, apiGet } from "@/services/api";
import { mockUserCreditLogs } from "../mock-data";

// Build query string from params
const buildQueryString = (
  params: Omit<UserCreditsQueryParams, "phoneNumber">
): string => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params.take !== undefined) {
    searchParams.append("take", params.take.toString());
  }
  if (params.packageType) {
    searchParams.append("packageType", params.packageType);
  }
  if (params.type) {
    searchParams.append("type", params.type);
  }
  if (params.status) {
    searchParams.append("status", params.status);
  }

  return searchParams.toString();
};

export const useUserCredits = (params: UserCreditsQueryParams = {}) => {
  return useQuery({
    queryKey: ["user-credits", params],
    queryFn: async (): Promise<PaginatedResponse<UserCredit>> => {
      try {
        // Phone number is required
        if (!params.phoneNumber) {
          return {
            data: [],
            meta: {
              page: 1,
              take: 10,
              itemCount: 0,
              pageCount: 0,
              hasPreviousPage: false,
              hasNextPage: false,
            },
          };
        }

        const { phoneNumber, ...queryParams } = params;
        const queryString = buildQueryString(queryParams);
        const endpoint = `/admin/subscriptions/credits${queryString ? `?phoneNumber=${encodeURIComponent(phoneNumber)}&${queryString}` : `?phoneNumber=${encodeURIComponent(phoneNumber)}`}`;

        const response = await apiGet<PaginatedResponse<UserCredit>>(endpoint);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!params.phoneNumber, // Only fetch when phoneNumber is provided
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUserCreditLogs = (params: UserCreditLogsQueryParams = {}) => {
  return useQuery({
    queryKey: ["user-credit-logs", params],
    queryFn: async (): Promise<LegacyPaginatedResponse<UserCreditLog>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockUserCreditLogs];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (log) =>
              log.user_name?.toLowerCase().includes(query) ||
              log.user_id.toLowerCase().includes(query) ||
              log.description?.toLowerCase().includes(query)
          );
        }
        if (params.user_id) {
          filtered = filtered.filter((log) => log.user_id === params.user_id);
        }
        if (params.type && params.type !== "all") {
          filtered = filtered.filter((log) => log.type === params.type);
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
