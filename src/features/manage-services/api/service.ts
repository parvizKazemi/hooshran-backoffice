import { apiGet, apiPost, apiPut } from "@/services/api";
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
  buildModelsUpdatePayload,
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
 * Always from `/admin/api-services`:
 * - no slug → `?type=all`
 * - with category slug → `?type={slug}`
 */
export async function fetchManageServices(
  categorySlug?: string | null
): Promise<ManageService[]> {
  const path = categorySlug
    ? MANAGE_SERVICES_ENDPOINTS.platformListByCategorySlug(
        categorySlug,
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
    Pick<ManageService, "isActive" | "name" | "description" | "badge">
  >
): Promise<ManageService> {
  const merged: ManageService = { ...service, ...patch };
  const payload = mapManageServiceToCustomData(merged, patch);
  return upsertServiceCustomData(service.uuid, payload, merged);
}

/**
 * Overall base sync → POST `/admin/api-service/update-data`
 * Builds /api/v1/models-shaped payload (preserves inputs from detail when possible).
 */
export async function syncManageServicesUpdateData(
  items: ManageService[],
  options?: {
    categorySlugByUuid?: Record<string, string>;
    categoryNameByUuid?: Record<string, string>;
  }
): Promise<ManageService[]> {
  const details = await Promise.all(
    items
      .filter((item) => !item.isLocal)
      .map(async (item) => {
        try {
          const detail = await apiGet<PlatformServiceDetail>(
            MANAGE_SERVICES_ENDPOINTS.platformDetail(item.uuid)
          );
          return [item.uuid, detail] as const;
        } catch {
          return [item.uuid, null] as const;
        }
      })
  );

  const detailByUuid = Object.fromEntries(details) as Record<
    string,
    PlatformServiceDetail | null
  >;

  const payload = buildModelsUpdatePayload(items, {
    detailByUuid,
    categorySlugByUuid: options?.categorySlugByUuid,
    categoryNameByUuid: options?.categoryNameByUuid,
  });

  await apiPost(MANAGE_SERVICES_ENDPOINTS.updateData, payload);

  // Persist admin overrides so the next external sync won't wipe them.
  const persisted = items.filter((item) => !item.isLocal);
  await Promise.all(
    persisted.map((item) =>
      upsertServiceCustomData(
        item.uuid,
        mapManageServiceToCustomData(item),
        item
      )
    )
  );

  return persisted.map((item) => ({ ...item, isLocal: false }));
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
