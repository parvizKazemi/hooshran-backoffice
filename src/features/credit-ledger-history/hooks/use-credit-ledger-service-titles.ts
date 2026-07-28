import { fetchServiceRequestByUuid } from "../api/service";
import type { CreditLedgerEntry } from "../types";
import {
  extractServiceRequestUuid,
  isRequestUsageEntry,
} from "../utils/credit-ledger.helpers";
import { useManageServices } from "@/features/manage-services/hooks/use-manage-services";
import type { ManageService } from "@/features/manage-services/types";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

function normalizeEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/^\/+|\/+$/g, "");
}

function buildServiceNameMaps(services: ManageService[]) {
  const serviceNameByUuid = new Map<string, string>();
  const serviceNameByEndpoint = new Map<string, string>();

  for (const service of services) {
    if (service.uuid && service.name) {
      serviceNameByUuid.set(service.uuid, service.name);
    }
    if (service.endpoint) {
      const normalized = normalizeEndpoint(service.endpoint);
      if (normalized) serviceNameByEndpoint.set(normalized, service.name);
    }

    for (const sub of service.submodels ?? []) {
      if (sub.uuid && sub.name) {
        serviceNameByUuid.set(sub.uuid, sub.name);
      }
      if (sub.endpoint) {
        const normalized = normalizeEndpoint(sub.endpoint);
        if (normalized) serviceNameByEndpoint.set(normalized, sub.name);
      }
    }
  }

  return { serviceNameByUuid, serviceNameByEndpoint };
}

/**
 * Loads catalog services + resolves usage request UUIDs → service display names.
 */
export function useCreditLedgerServiceTitles(
  entries: CreditLedgerEntry[],
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const servicesQuery = useManageServices({ enabled });

  const { serviceNameByUuid, serviceNameByEndpoint } = useMemo(
    () => buildServiceNameMaps(servicesQuery.data ?? []),
    [servicesQuery.data]
  );

  const requestUuids = useMemo(() => {
    if (!enabled) return [] as string[];
    const uuids = new Set<string>();
    for (const entry of entries) {
      if (!isRequestUsageEntry(entry)) continue;
      const requestUuid = extractServiceRequestUuid(entry);
      if (requestUuid) uuids.add(requestUuid);
    }
    return Array.from(uuids);
  }, [enabled, entries]);

  const requestQueries = useQueries({
    queries: requestUuids.map((uuid) => ({
      queryKey: ["credit-ledger-service-request", uuid] as const,
      queryFn: () => fetchServiceRequestByUuid(uuid),
      enabled,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });

  const serviceTitleByRequestUuid = useMemo(() => {
    const map = new Map<string, string>();

    requestQueries.forEach((query, index) => {
      const requestUuid = requestUuids[index];
      const request = query.data;
      if (!requestUuid || !request) return;

      const apiServiceUuid = request.apiServiceUuid || request.apiService?.uuid;
      const fromCatalog =
        apiServiceUuid && serviceNameByUuid.get(apiServiceUuid);
      const fromRequest = request.apiService?.name?.trim();

      const title = fromCatalog || fromRequest;
      if (title) map.set(requestUuid, title);
    });

    return map;
  }, [requestQueries, requestUuids, serviceNameByUuid]);

  return {
    serviceNameByUuid,
    serviceNameByEndpoint,
    serviceTitleByRequestUuid,
    isLoadingServices: servicesQuery.isLoading,
  };
}

/** Resolve request→title map for export rows (uses catalog + request fetches). */
export async function buildServiceTitleByRequestUuid(
  entries: CreditLedgerEntry[],
  serviceNameByUuid: Map<string, string>
): Promise<Map<string, string>> {
  const uuids = new Set<string>();
  for (const entry of entries) {
    if (!isRequestUsageEntry(entry)) continue;
    const requestUuid = extractServiceRequestUuid(entry);
    if (requestUuid) uuids.add(requestUuid);
  }

  const map = new Map<string, string>();
  const uniqueUuids = Array.from(uuids);

  const results = await Promise.allSettled(
    uniqueUuids.map((uuid) => fetchServiceRequestByUuid(uuid))
  );

  results.forEach((result, index) => {
    const requestUuid = uniqueUuids[index];
    if (!requestUuid || result.status !== "fulfilled") return;

    const request = result.value;
    const apiServiceUuid = request.apiServiceUuid || request.apiService?.uuid;
    const fromCatalog = apiServiceUuid && serviceNameByUuid.get(apiServiceUuid);
    const fromRequest = request.apiService?.name?.trim();
    const title = fromCatalog || fromRequest;
    if (title) map.set(requestUuid, title);
  });

  return map;
}
