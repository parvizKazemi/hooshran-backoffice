import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ServiceRequest,
  ServiceRequestsQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError, apiGet } from "@/services/api";

// Build query string from params
const buildQueryString = (
  params: Omit<ServiceRequestsQueryParams, "phoneNumber">
): string => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params.take !== undefined) {
    searchParams.append("take", params.take.toString());
  }
  if (params.status && params.status !== "all") {
    searchParams.append("status", params.status);
  }
  if (params.dateFrom) {
    searchParams.append("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    searchParams.append("dateTo", params.dateTo);
  }

  return searchParams.toString();
};

// Fetch service requests from API
export const useServiceRequests = (params: ServiceRequestsQueryParams = {}) => {
  return useQuery({
    queryKey: ["service-requests", params],
    queryFn: async (): Promise<PaginatedResponse<ServiceRequest>> => {
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
        const endpoint = `/admin/service-requests/user/${phoneNumber}${queryString ? `?${queryString}` : ""}`;

        const response =
          await apiGet<PaginatedResponse<ServiceRequest>>(endpoint);
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
