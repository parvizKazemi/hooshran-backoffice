import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { MODEL_DISCOUNT_ENDPOINTS } from "./endpoints";
import type {
  CreateModelDiscountInput,
  ModelDiscount,
  ModelDiscountsQueryParams,
  PaginatedModelDiscountsResponse,
  UpdateModelDiscountInput,
} from "../types";

const buildListQuery = (params: ModelDiscountsQueryParams = {}): string => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params.serviceUuid?.trim()) {
    searchParams.set("serviceUuid", params.serviceUuid.trim());
  }
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function fetchModelDiscounts(
  params: ModelDiscountsQueryParams = {}
): Promise<PaginatedModelDiscountsResponse> {
  return apiGet<PaginatedModelDiscountsResponse>(
    `${MODEL_DISCOUNT_ENDPOINTS.list}${buildListQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      status: params.status ?? "all",
      serviceUuid: params.serviceUuid,
      search: params.search,
    })}`
  );
}

export async function createModelDiscount(
  payload: CreateModelDiscountInput
): Promise<ModelDiscount> {
  return apiPost<ModelDiscount>(MODEL_DISCOUNT_ENDPOINTS.list, payload);
}

export async function updateModelDiscount(
  uuid: string,
  payload: UpdateModelDiscountInput
): Promise<ModelDiscount> {
  return apiPut<ModelDiscount>(MODEL_DISCOUNT_ENDPOINTS.detail(uuid), payload);
}

export async function deleteModelDiscount(uuid: string): Promise<boolean> {
  return apiDelete<boolean>(MODEL_DISCOUNT_ENDPOINTS.detail(uuid));
}
