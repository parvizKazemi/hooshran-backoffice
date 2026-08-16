import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import {
  extractServiceFilters,
  normalizeFilterList,
  unwrapFilterList,
} from "../utils";
import { FILTERS_ENDPOINTS } from "./endpoints";

export async function fetchMasterFilters(): Promise<string[]> {
  const response = await apiGet<unknown>(FILTERS_ENDPOINTS.list);
  return unwrapFilterList(response);
}

export async function addMasterFilter(filter: string): Promise<string[]> {
  const response = await apiPost<unknown>(FILTERS_ENDPOINTS.list, { filter });
  return unwrapFilterList(response);
}

export async function replaceMasterFilters(
  filters: string[]
): Promise<string[]> {
  const response = await apiPut<unknown>(FILTERS_ENDPOINTS.list, {
    filters: normalizeFilterList(filters),
  });
  return unwrapFilterList(response);
}

export async function deleteMasterFilter(filter: string): Promise<string[]> {
  const response = await apiDelete<unknown>(FILTERS_ENDPOINTS.item(filter));
  return unwrapFilterList(response);
}

export async function fetchServiceFilters(uuid: string): Promise<string[]> {
  const response = await apiGet<unknown>(FILTERS_ENDPOINTS.serviceDetail(uuid));
  return extractServiceFilters(response);
}

export async function updateServiceFilters(
  uuid: string,
  filters: string[]
): Promise<string[]> {
  const payload = { filters: normalizeFilterList(filters) };
  const response = await apiPut<unknown>(
    FILTERS_ENDPOINTS.serviceCustomData(uuid),
    payload
  );
  const updated = extractServiceFilters(response);
  return updated.length > 0 || payload.filters.length === 0
    ? updated
    : payload.filters;
}
