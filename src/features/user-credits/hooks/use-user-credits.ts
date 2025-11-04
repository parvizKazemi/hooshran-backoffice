import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserCredit,
  UserCreditLog,
  UserCreditsQueryParams,
  UserCreditLogsQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError } from "@/services/api";
import { mockUserCredits, mockUserCreditLogs } from "../mock-data";

export const useUserCredits = (params: UserCreditsQueryParams = {}) => {
  return useQuery({
    queryKey: ["user-credits", params],
    queryFn: async (): Promise<PaginatedResponse<UserCredit>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockUserCredits];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (credit) =>
              credit.user_name?.toLowerCase().includes(query) ||
              credit.user_phone?.toLowerCase().includes(query) ||
              credit.user_id.toLowerCase().includes(query)
          );
        }
        if (params.user_id) {
          filtered = filtered.filter(
            (credit) => credit.user_id === params.user_id
          );
        }
        if (params.source && params.source !== "all") {
          filtered = filtered.filter(
            (credit) => credit.source === params.source
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

export const useUserCreditLogs = (params: UserCreditLogsQueryParams = {}) => {
  return useQuery({
    queryKey: ["user-credit-logs", params],
    queryFn: async (): Promise<PaginatedResponse<UserCreditLog>> => {
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
