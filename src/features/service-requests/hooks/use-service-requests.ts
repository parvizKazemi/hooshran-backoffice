import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ServiceRequest,
  ServiceRequestsQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError } from "@/services/api";
import { mockServiceRequests } from "../mock-data";

// Fetch service requests from API
export const useServiceRequests = (params: ServiceRequestsQueryParams = {}) => {
  return useQuery({
    queryKey: ["service-requests", params],
    queryFn: async (): Promise<PaginatedResponse<ServiceRequest>> => {
      try {
        // TODO: Replace with actual API call when endpoint is available
        // const response = await apiGet<PaginatedResponse<ServiceRequest>>(endpoint);
        // return response;

        // Temporary mock implementation
        let filtered = [...mockServiceRequests];

        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (req) =>
              req.user_name?.toLowerCase().includes(query) ||
              req.user_phone?.toLowerCase().includes(query) ||
              req.api_service_name?.toLowerCase().includes(query) ||
              req.id.toLowerCase().includes(query)
          );
        }

        if (params.user_id) {
          filtered = filtered.filter((req) => req.user_id === params.user_id);
        }

        if (params.api_service_id) {
          filtered = filtered.filter(
            (req) => req.api_service_id === params.api_service_id
          );
        }

        if (params.status && params.status !== "all") {
          filtered = filtered.filter((req) => req.status === params.status);
        }

        if (params.start_date || params.end_date) {
          filtered = filtered.filter((req) => {
            const date = new Date(req.createdAt);
            if (params.start_date) {
              const start = new Date(params.start_date);
              if (date < start) return false;
            }
            if (params.end_date) {
              const end = new Date(params.end_date);
              end.setHours(23, 59, 59, 999);
              if (date > end) return false;
            }
            return true;
          });
        }

        const page = params.page || 1;
        const take = params.take || 10;
        const start = (page - 1) * take;
        const end = start + take;
        const paginated = filtered.slice(start, end);

        return {
          data: paginated,
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
