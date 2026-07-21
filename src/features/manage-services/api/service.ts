import { apiGet, apiPatch, apiPost } from "@/services/api";
import type {
  CatalogServiceOption,
  ManageService,
  ManageServicePayload,
  ServiceSubmodel,
} from "../types";
import {
  endpointToSlug,
  normalizeAcceptHint,
} from "../utils/accept-hint.helpers";
import { normalizeServicesResponse } from "../utils/service.helpers";
import { MANAGE_SERVICES_ENDPOINTS } from "./endpoints";

type PlatformServiceDetail = {
  slug?: string;
  endpoint?: string;
  inputs?: {
    service?: {
      frontend?: {
        accept_hint?: unknown;
      };
    };
  };
};

export async function fetchManageServices(): Promise<ManageService[]> {
  const response = await apiGet<ManageService[] | { data: ManageService[] }>(
    MANAGE_SERVICES_ENDPOINTS.list
  );
  return normalizeServicesResponse(response);
}

export async function saveManageServices(
  payload: ManageServicePayload[],
  options?: { useCreate?: boolean }
): Promise<ManageService[]> {
  const useCreate = options?.useCreate ?? false;
  const response = useCreate
    ? await apiPost<ManageService[] | { data: ManageService[] }>(
        MANAGE_SERVICES_ENDPOINTS.create,
        payload
      )
    : await apiPatch<ManageService[] | { data: ManageService[] }>(
        MANAGE_SERVICES_ENDPOINTS.save,
        payload
      );

  return normalizeServicesResponse(response);
}

/** Resolve parent children the same way as front ParentServiceGrid. */
export async function fetchParentSubmodelsFromAcceptHint(
  parentSlug: string,
  catalog: CatalogServiceOption[]
): Promise<ServiceSubmodel[]> {
  const detail = await apiGet<PlatformServiceDetail>(
    MANAGE_SERVICES_ENDPOINTS.platformDetail(parentSlug)
  );

  const options = normalizeAcceptHint(
    detail?.inputs?.service?.frontend?.accept_hint
  );
  if (options.length === 0) return [];

  const bySlug = new Map(catalog.map((item) => [item.slug, item]));
  const result: ServiceSubmodel[] = [];
  const seen = new Set<string>();

  for (const option of options) {
    const slug = endpointToSlug(option.endpoint);
    const matched =
      bySlug.get(slug) ||
      bySlug.get(option.endpoint) ||
      catalog.find(
        (item) =>
          item.slug === slug ||
          item.slug === option.endpoint ||
          option.endpoint.endsWith(item.slug)
      );

    if (!matched || seen.has(matched.uuid)) continue;
    seen.add(matched.uuid);

    result.push({
      uuid: matched.uuid,
      name: matched.name || option.name,
      description: matched.description || option.introduction || "",
      slug: matched.slug,
      imageUrl: matched.imageUrl || option.image || "",
      creditHint: matched.creditHint || option.cost || "",
      badge: matched.badge ?? null,
      isActive: matched.isActive ?? option.active ?? true,
      inactiveReason: matched.inactiveReason ?? "",
      isLocal: false,
    });
  }

  return result;
}
