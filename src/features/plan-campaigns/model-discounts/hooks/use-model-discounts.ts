import { ApiError } from "@/services/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCampaignPlatformServices } from "../../hooks/use-plan-campaigns";
import { MODEL_DISCOUNTS_QUERY_KEY } from "../constants";
import {
  createModelDiscount,
  deleteModelDiscount,
  fetchModelDiscounts,
  updateModelDiscount,
} from "../api/service";
import type {
  CreateModelDiscountInput,
  ModelDiscountsQueryParams,
  UpdateModelDiscountInput,
} from "../types";

export function useModelDiscounts(params: ModelDiscountsQueryParams = {}) {
  return useQuery({
    queryKey: [
      MODEL_DISCOUNTS_QUERY_KEY,
      params.page ?? 1,
      params.limit ?? 200,
      params.status ?? "all",
      params.serviceUuid ?? "",
      params.search ?? "",
    ],
    queryFn: () => fetchModelDiscounts(params),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useModelDiscountServices() {
  return useCampaignPlatformServices();
}

export function useCreateModelDiscount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: CreateModelDiscountInput) =>
      createModelDiscount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODEL_DISCOUNTS_QUERY_KEY] });
      toast.success(t("modelDiscounts.toast.created"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modelDiscounts.toast.createFailed");
      toast.error(message);
    },
  });
}

export function useUpdateModelDiscount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: UpdateModelDiscountInput;
    }) => updateModelDiscount(uuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODEL_DISCOUNTS_QUERY_KEY] });
      toast.success(t("modelDiscounts.toast.updated"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modelDiscounts.toast.updateFailed");
      toast.error(message);
    },
  });
}

export function useDeleteModelDiscount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (uuid: string) => deleteModelDiscount(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MODEL_DISCOUNTS_QUERY_KEY] });
      toast.success(t("modelDiscounts.toast.deleted"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t("modelDiscounts.toast.deleteFailed");
      toast.error(message);
    },
  });
}
