import { apiGet, apiPut } from "@/services/api";
import type {
  CatalogServiceOption,
  ManageService,
  ServiceSubmodel,
} from "../types";
import {
  endpointToSlug,
  normalizeAcceptHint,
} from "@/features/manage-services/utils/accept-hint.helpers";
import { mapAdminApiServiceToManageService } from "@/features/manage-services/utils/map-admin-api-service";
import {
  mapManageServiceToCustomData,
  normalizeServicesResponse,
  type ServiceCustomDataPayload,
} from "@/features/manage-services/utils/service.helpers";
import { PLATFORM_SERVICES_LIMIT } from "../constants";
import { MANAGE_SERVICES_ENDPOINTS } from "./endpoints";

type PlatformServiceDetail = {
  uuid?: string;
  slug?: string;
  endpoint?: string;
  inputs?: {
    service?: {
      frontend?: {
        accept_hint?: unknown;
      };
    };
  };
  [key: string]: unknown;
};

function normalizePlatformListResponse(response: unknown): ManageService[] {
  const list = Array.isArray(response)
    ? response
    : response && typeof response === "object"
      ? ((response as { data?: unknown[]; services?: unknown[] }).data ??
        (response as { services?: unknown[] }).services ??
        [])
      : [];

  return normalizeServicesResponse(
    list.map((item) => mapAdminApiServiceToManageService(item))
  );
}

/**
 * - no category → `GET /admin/api-services?type=all`
 * - with category slug/name/uuid → `GET /admin/api-services?category={value}`
 */
export async function fetchManageServices(
  category?: string | null
): Promise<ManageService[]> {
  const path = category
    ? MANAGE_SERVICES_ENDPOINTS.platformListByCategory(
        category,
        PLATFORM_SERVICES_LIMIT
      )
    : MANAGE_SERVICES_ENDPOINTS.platformListAll(PLATFORM_SERVICES_LIMIT);

  const response = await apiGet<unknown>(path);
  return normalizePlatformListResponse(response);
}

/** Full service detail for edit dialog. */
export async function fetchManageServiceDetail(
  uuid: string,
  fallback?: Partial<ManageService>
): Promise<ManageService> {
  const response = await apiGet<unknown>(
    MANAGE_SERVICES_ENDPOINTS.platformDetail(uuid)
  );
  return mapAdminApiServiceToManageService(response, fallback);
}

/**
 * Table / form edit → PUT `/admin/services/{uuid}/custom-data`
 */
export async function upsertServiceCustomData(
  uuid: string,
  payload: ServiceCustomDataPayload,
  fallback?: Partial<ManageService>
): Promise<ManageService> {
  await apiPut<unknown>(MANAGE_SERVICES_ENDPOINTS.customData(uuid), payload);
  return mapAdminApiServiceToManageService(
    { ...payload, uuid },
    {
      uuid,
      ...fallback,
      name: payload.name ?? fallback?.name,
      description: payload.description ?? fallback?.description,
      badge:
        payload.badge === undefined
          ? fallback?.badge
          : ((payload.badge as ManageService["badge"]) ?? null),
      isActive: payload.isActive ?? fallback?.isActive,
    }
  );
}

/** Convenience: map ManageService → custom-data and upsert. */
export async function updateManageServiceCustomData(
  service: ManageService,
  patch?: Partial<
    Pick<
      ManageService,
      | "isActive"
      | "name"
      | "description"
      | "badge"
      | "slug"
      | "categoryUuids"
      | "categoryOrders"
      | "order"
      | "inactiveReason"
      | "creditHint"
      | "imageUrl"
      | "isAutoCredit"
    >
  >
): Promise<ManageService> {
  const merged: ManageService = { ...service, ...patch };
  const payload = mapManageServiceToCustomData(merged, patch);
  return upsertServiceCustomData(service.uuid, payload, merged);
}

/**
 * Save catalog draft changes.
 *
 * Uses `PUT /admin/services/:uuid/custom-data` (correct admin override path).
 * Does NOT call `POST /admin/api-service/update-data` — that endpoint is only for
 * external `/api/v1/models` sync and fails / mutates base params incorrectly.
 *
 * Backend `upsertCustomData` also applies `metadata.ui.category_orders` →
 * `category_services.service_index` (reorder).
 */
export async function syncManageServicesUpdateData(
  items: ManageService[]
): Promise<ManageService[]> {
  const persisted = items.filter((item) => !item.isLocal);

  const results = await Promise.all(
    persisted.map((item) =>
      upsertServiceCustomData(
        item.uuid,
        mapManageServiceToCustomData(item),
        item
      )
    )
  );

  return results.map((item) => ({ ...item, isLocal: false }));
}

/** Resolve parent children the same way as front ParentServiceGrid. */
export async function fetchParentSubmodelsFromAcceptHint(
  parentUuid: string,
  catalog: CatalogServiceOption[]
): Promise<ServiceSubmodel[]> {
  const detail = await apiGet<PlatformServiceDetail>(
    MANAGE_SERVICES_ENDPOINTS.platformDetail(parentUuid)
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
