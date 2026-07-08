import { apiGet, apiPost, apiPut } from "@/services/api";
import { DISCOUNT_CODE_ENDPOINTS } from "./endpoints";
import type {
  CreateDiscountCodeInput,
  UpdateDiscountCodeInput,
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
  if (params.isActive === true || params.isActive === false) {
    searchParams.set("isActive", String(params.isActive));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const sortDiscountCodes = (codes: DiscountCode[]) =>
  [...codes].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

const mergeDiscountCodePages = (
  responses: PaginatedDiscountCodesResponse[]
): PaginatedDiscountCodesResponse => {
  const byUuid = new Map<string, DiscountCode>();

  for (const response of responses) {
    for (const code of response.data) {
      byUuid.set(code.uuid, code);
    }
  }

  const data = sortDiscountCodes(Array.from(byUuid.values()));
  const itemCount = responses.reduce(
    (total, response) => total + response.meta.itemCount,
    0
  );
  const take = responses[0]?.meta.take ?? data.length;

  return {
    data,
    meta: {
      page: 1,
      take,
      itemCount,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
};

export async function fetchDiscountCodes(
  params: DiscountCodesQueryParams = {}
): Promise<PaginatedDiscountCodesResponse> {
  const listParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.isActive === true || params.isActive === false) {
    return apiGet<PaginatedDiscountCodesResponse>(
      `${DISCOUNT_CODE_ENDPOINTS.list}${buildListQuery({
        ...params,
        ...listParams,
        isActive: params.isActive,
      })}`
    );
  }

  const [activeResponse, inactiveResponse] = await Promise.all([
    apiGet<PaginatedDiscountCodesResponse>(
      `${DISCOUNT_CODE_ENDPOINTS.list}${buildListQuery({
        ...listParams,
        isActive: true,
      })}`
    ),
    apiGet<PaginatedDiscountCodesResponse>(
      `${DISCOUNT_CODE_ENDPOINTS.list}${buildListQuery({
        ...listParams,
        isActive: false,
      })}`
    ),
  ]);

  return mergeDiscountCodePages([activeResponse, inactiveResponse]);
}

export async function createDiscountCode(
  payload: CreateDiscountCodeInput
): Promise<DiscountCode> {
  return apiPost<DiscountCode>(DISCOUNT_CODE_ENDPOINTS.create, payload);
}

export async function updateDiscountCode(
  uuid: string,
  payload: UpdateDiscountCodeInput
): Promise<DiscountCode> {
  return apiPut<DiscountCode>(DISCOUNT_CODE_ENDPOINTS.update(uuid), payload);
}

export async function fetchDiscountCodeOverallReport(): Promise<DiscountCodeOverallReport> {
  return apiGet<DiscountCodeOverallReport>(
    DISCOUNT_CODE_ENDPOINTS.overallReport
  );
}

export async function fetchDiscountCodeSingleReport(
  uuid: string
): Promise<DiscountCodeSingleReport> {
  return apiGet<DiscountCodeSingleReport>(
    DISCOUNT_CODE_ENDPOINTS.singleReport(uuid)
  );
}
