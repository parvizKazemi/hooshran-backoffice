import { apiGet, apiPost } from "@/services/api";
import { DISCOUNT_CODE_ENDPOINTS } from "./endpoints";
import type {
  CreateDiscountCodeInput,
  DiscountCode,
  DiscountCodeOverallReport,
  DiscountCodeSingleReport,
  DiscountCodesQueryParams,
  PaginatedDiscountCodesResponse,
} from "../types";

const buildListQuery = (params: DiscountCodesQueryParams = {}): string => {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function fetchDiscountCodes(
  params: DiscountCodesQueryParams = {}
): Promise<PaginatedDiscountCodesResponse> {
  return apiGet<PaginatedDiscountCodesResponse>(
    `${DISCOUNT_CODE_ENDPOINTS.list}${buildListQuery(params)}`
  );
}

export async function createDiscountCode(
  payload: CreateDiscountCodeInput
): Promise<DiscountCode> {
  return apiPost<DiscountCode>(DISCOUNT_CODE_ENDPOINTS.create, payload);
}

export async function fetchDiscountCodeOverallReport(): Promise<DiscountCodeOverallReport> {
  return apiGet<DiscountCodeOverallReport>(
    DISCOUNT_CODE_ENDPOINTS.overallReport
  );
}

export async function fetchDiscountCodeSingleReport(
  id: number
): Promise<DiscountCodeSingleReport> {
  return apiGet<DiscountCodeSingleReport>(
    DISCOUNT_CODE_ENDPOINTS.singleReport(id)
  );
}
