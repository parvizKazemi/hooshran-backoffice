import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDiscountCode,
  fetchDiscountCodeOverallReport,
  fetchDiscountCodeSingleReport,
  fetchDiscountCodes,
} from "../api/service";
import {
  DISCOUNT_CODE_QUERY_KEY,
  DISCOUNT_CODE_REPORTS_QUERY_KEY,
} from "../constants";
import type {
  CreateDiscountCodeInput,
  DiscountCodesQueryParams,
} from "../types";

const DISCOUNT_CODES_STALE_TIME_MS = 60_000;

export function useDiscountCodes(params: DiscountCodesQueryParams = {}) {
  return useQuery({
    queryKey: [
      DISCOUNT_CODE_QUERY_KEY,
      params.page ?? 1,
      params.limit ?? 100,
      params.search ?? "",
      params.type ?? "all",
    ],
    queryFn: () => fetchDiscountCodes(params),
    staleTime: DISCOUNT_CODES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
}

export function useDiscountCodeOverallReport() {
  return useQuery({
    queryKey: [DISCOUNT_CODE_REPORTS_QUERY_KEY, "overall"],
    queryFn: fetchDiscountCodeOverallReport,
    staleTime: DISCOUNT_CODES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });
}

export function useDiscountCodeSingleReport(id?: number) {
  return useQuery({
    queryKey: [DISCOUNT_CODE_REPORTS_QUERY_KEY, "single", id],
    queryFn: () => fetchDiscountCodeSingleReport(id!),
    enabled: Boolean(id),
  });
}

export function useCreateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDiscountCodeInput) =>
      createDiscountCode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISCOUNT_CODE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_CODE_REPORTS_QUERY_KEY],
      });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ثبت کد تخفیف");
      }
    },
  });
}
