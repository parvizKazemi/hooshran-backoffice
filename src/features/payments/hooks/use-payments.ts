import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Payment, PaymentsQueryParams, PaginatedResponse } from "../types";
import { ApiError } from "@/services/api";
import { mockPayments } from "../mock-data";

export const usePayments = (params: PaymentsQueryParams = {}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async (): Promise<PaginatedResponse<Payment>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockPayments];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (payment) =>
              payment.user_name?.toLowerCase().includes(query) ||
              payment.user_phone?.toLowerCase().includes(query) ||
              payment.id.toLowerCase().includes(query)
          );
        }
        if (params.user_id) {
          filtered = filtered.filter(
            (payment) => payment.user_id === params.user_id
          );
        }
        if (params.status && params.status !== "all") {
          filtered = filtered.filter(
            (payment) => payment.status === params.status
          );
        }
        if (params.type && params.type !== "all") {
          filtered = filtered.filter((payment) => payment.type === params.type);
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
