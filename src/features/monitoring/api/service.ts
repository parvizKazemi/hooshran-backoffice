import { apiGet } from "@/services/api";
import { MONITORING_ENDPOINTS } from "./endpoints";
import type {
  MonitoringErrorLog,
  MonitoringErrorsQueryParams,
  MonitoringErrorsResponse,
} from "../types";

const buildQueryString = (params: MonitoringErrorsQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);
  if (params.type && params.type !== "all")
    searchParams.set("type", params.type);
  if (params.severity && params.severity !== "all") {
    searchParams.set("severity", params.severity);
  }
  if (params.source && params.source !== "all") {
    searchParams.set("source", params.source);
  }
  if (params.location?.trim())
    searchParams.set("location", params.location.trim());
  if (params.userId !== undefined)
    searchParams.set("userId", String(params.userId));
  if (params.isNotifSent !== undefined && params.isNotifSent !== "all") {
    searchParams.set("isNotifSent", String(params.isNotifSent));
  }
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.take !== undefined) searchParams.set("take", String(params.take));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function fetchMonitoringErrors(
  params: MonitoringErrorsQueryParams = {}
): Promise<MonitoringErrorsResponse> {
  return apiGet<MonitoringErrorsResponse>(
    `${MONITORING_ENDPOINTS.list}${buildQueryString(params)}`
  );
}

export async function fetchMonitoringErrorByUuid(
  uuid: string
): Promise<MonitoringErrorLog> {
  return apiGet<MonitoringErrorLog>(MONITORING_ENDPOINTS.detail(uuid));
}
