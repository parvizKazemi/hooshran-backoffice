import { ApiError } from "@/services/api";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  createDiscountCode,
  updateDiscountCode,
  fetchDiscountCodeOverallReport,
  fetchDiscountCodeSingleReport,
  fetchDiscountCodes,
} from "../api/service";
import {
  DISCOUNT_CODE_QUERY_KEY,
  DISCOUNT_CODE_REPORTS_QUERY_KEY,
} from "../constants";
import { hasInvalidPhoneNumbersError } from "../utils/parse-discount-code-error";
import type {
  CreateDiscountCodeInput,
  DiscountCodesQueryParams,
  UpdateDiscountCodeInput,
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

export function useDiscountCodeSingleReport(uuid?: string) {
  return useQuery({
    queryKey: [DISCOUNT_CODE_REPORTS_QUERY_KEY, "single", uuid],
    queryFn: () => fetchDiscountCodeSingleReport(uuid!),
    enabled: Boolean(uuid),
  });
}

export function useDiscountCodeUsageCounts(uuids: string[]) {
  const uniqueUuids = useMemo(
    () => Array.from(new Set(uuids.filter(Boolean))),
    [uuids]
  );

  const queries = useQueries({
    queries: uniqueUuids.map((uuid) => ({
      queryKey: [DISCOUNT_CODE_REPORTS_QUERY_KEY, "single", uuid],
      queryFn: () => fetchDiscountCodeSingleReport(uuid),
      staleTime: DISCOUNT_CODES_STALE_TIME_MS,
      refetchOnWindowFocus: false,
    })),
  });

  const usageMap = useMemo(() => {
    const map = new Map<string, number>();

    uniqueUuids.forEach((uuid, index) => {
      const usagesCount = queries[index]?.data?.usagesCount;
      if (usagesCount !== undefined) {
        map.set(uuid, usagesCount);
      }
    });

    return map;
  }, [queries, uniqueUuids]);

  const isLoading = queries.some((query) => query.isLoading);

  return { usageMap, isLoading };
}

function invalidateDiscountCodeQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: [DISCOUNT_CODE_QUERY_KEY] });
  queryClient.invalidateQueries({
    queryKey: [DISCOUNT_CODE_REPORTS_QUERY_KEY],
  });
}

export function useCreateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDiscountCodeInput) =>
      createDiscountCode(payload),
    onSuccess: () => {
      invalidateDiscountCodeQueries(queryClient);
    },
    onError: (error) => {
      if (hasInvalidPhoneNumbersError(error)) {
        return;
      }

      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ثبت کد تخفیف");
      }
    },
  });
}

export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: UpdateDiscountCodeInput;
    }) => updateDiscountCode(uuid, payload),
    onSuccess: () => {
      invalidateDiscountCodeQueries(queryClient);
    },
    onError: (error) => {
      if (hasInvalidPhoneNumbersError(error)) {
        return;
      }

      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی کد تخفیف");
      }
    },
  });
}
