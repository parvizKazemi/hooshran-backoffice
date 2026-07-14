import { apiGet } from "@/services/api";
import type { ServiceRequest } from "@/features/service-requests/types";
import { CREDIT_LEDGER_ENDPOINTS } from "./endpoints";
import type {
  CreditLedgerApiResponse,
  CreditLedgerQueryParams,
} from "../types";

const buildQueryString = (params: CreditLedgerQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.phoneNumber) {
    searchParams.set("phoneNumber", params.phoneNumber);
  }
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.type && params.type !== "all") {
    searchParams.set("type", params.type);
  }
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params.from) {
    searchParams.set("from", params.from);
  }
  if (params.to) {
    searchParams.set("to", params.to);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function fetchCreditLedgerByPhone(
  params: CreditLedgerQueryParams
): Promise<CreditLedgerApiResponse> {
  return apiGet<CreditLedgerApiResponse>(
    `${CREDIT_LEDGER_ENDPOINTS.byPhone}${buildQueryString(params)}`
  );
}

export async function fetchAllCreditLedgerByPhone(
  params: Omit<CreditLedgerQueryParams, "page" | "limit">
): Promise<CreditLedgerApiResponse> {
  return fetchCreditLedgerByPhone({
    ...params,
    page: 1,
    limit: -1,
  });
}

export async function fetchServiceRequestByUuid(
  uuid: string
): Promise<ServiceRequest> {
  return apiGet<ServiceRequest>(`/service-request/${uuid}`);
}
