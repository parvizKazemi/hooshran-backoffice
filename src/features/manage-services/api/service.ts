import { apiGet, apiPatch, apiPost, apiPut } from "@/services/api";
import type { ManageService } from "../types";
import { mapAdminApiServiceToManageService } from "@/features/manage-services/utils/map-admin-api-service";
import {
  buildCustomDataUiMetadata,
  mapManageServiceToCustomData,
  normalizeServicesResponse,
  toHierarchyChildrensPayload,
  toServiceSubmodelFromCatalog,
  type ServiceCustomDataPayload,
} from "@/features/manage-services/utils/service.helpers";
import {
  PLATFORM_SERVICES_LIMIT,
  resolveServiceTemplateName,
} from "../constants";
import { MANAGE_SERVICES_ENDPOINTS } from "./endpoints";

type RawService = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function endpointToSlug(endpoint: string): string {
  return endpoint.replace(/\//g, "-");
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/^\/+|\/+$/g, "");
}

function stripModelsPrefix(value: string): string {
  if (value.startsWith("models/")) return value.slice("models/".length);
  if (value.startsWith("models-")) return value.slice("models-".length);
  return value;
}

function isEndpointEquivalent(left: string, right: string): boolean {
  const a = normalizeEndpoint(left);
  const b = normalizeEndpoint(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const aStripped = stripModelsPrefix(a);
  const bStripped = stripModelsPrefix(b);
  if (aStripped === bStripped) return true;

  return (
    a.endsWith(`/${b}`) ||
    b.endsWith(`/${a}`) ||
    aStripped.endsWith(`/${bStripped}`) ||
    bStripped.endsWith(`/${aStripped}`)
  );
}

function extractRawServices(response: unknown): RawService[] {
  const list = Array.isArray(response)
    ? response
    : response && typeof response === "object"
      ? ((response as { data?: unknown[]; services?: unknown[] }).data ??
        (response as { services?: unknown[] }).services ??
        [])
      : [];
  return list.map((item) => asRecord(item) ?? {});
}

function unwrapServiceDetail(detail: unknown): RawService {
  const record = asRecord(detail);
  if (!record) return {};
  const nestedData = asRecord(record.data);
  return nestedData ?? record;
}

function readChildrens(raw: Record<string, unknown>): unknown[] {
  const information = asRecord(raw.information);
  const ui = asRecord(asRecord(raw.metadata)?.ui);
  const candidates = [
    raw.children,
    information?.children,
    information?.childrens,
    raw.childrens,
    ui?.children,
    ui?.childrens,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function readParentUuid(
  raw: Record<string, unknown>
): string | null | undefined {
  const direct = raw.parentUuid;
  if (direct === null) return null;
  if (typeof direct === "string") {
    const trimmed = direct.trim();
    return trimmed || null;
  }

  const information = asRecord(raw.information);
  const infoParent = information?.parentUuid ?? information?.parent_uuid;
  if (infoParent === null) return null;
  if (typeof infoParent === "string") {
    const trimmed = infoParent.trim();
    return trimmed || null;
  }

  const ui = asRecord(asRecord(raw.metadata)?.ui);
  const uiParent = ui?.parentUuid ?? ui?.parent_uuid;
  if (uiParent === null) return null;
  if (typeof uiParent === "string") {
    const trimmed = uiParent.trim();
    return trimmed || null;
  }

  return undefined;
}

function isChildMatch(
  child: Record<string, unknown>,
  target: { uuid: string; slug: string; endpoint: string }
): boolean {
  const childUuid = asString(child.uuid).trim();
  if (target.uuid && childUuid && childUuid === target.uuid) return true;

  const targetSlug = normalizeEndpoint(target.slug);
  const childSlug = normalizeEndpoint(asString(child.slug));
  if (targetSlug && childSlug) {
    const a = stripModelsPrefix(targetSlug);
    const b = stripModelsPrefix(childSlug);
    if (a === b) return true;
  }

  const targetEndpoint = normalizeEndpoint(target.endpoint);
  const childEndpoint = normalizeEndpoint(asString(child.endpoint));
  if (
    targetEndpoint &&
    childEndpoint &&
    isEndpointEquivalent(targetEndpoint, childEndpoint)
  ) {
    return true;
  }

  if (targetSlug && childEndpoint) {
    const childEndpointSlug = endpointToSlug(childEndpoint);
    if (
      stripModelsPrefix(targetSlug) === stripModelsPrefix(childEndpointSlug)
    ) {
      return true;
    }
  }

  if (targetEndpoint && childSlug) {
    const targetEndpointSlug = endpointToSlug(targetEndpoint);
    if (
      stripModelsPrefix(targetEndpointSlug) === stripModelsPrefix(childSlug)
    ) {
      return true;
    }
  }

  return false;
}

function resolveParentUuidFromChildrens(
  targetService: Record<string, unknown>,
  manageRows: Record<string, unknown>[]
): string | undefined {
  const target = {
    uuid: asString(targetService.uuid).trim(),
    slug: asString(targetService.slug).trim(),
    endpoint: asString(targetService.endpoint).trim(),
  };

  if (!target.uuid && !target.slug && !target.endpoint) return undefined;

  for (const row of manageRows) {
    const parentUuid = asString(row.uuid).trim();
    if (!parentUuid || (target.uuid && parentUuid === target.uuid)) continue;

    const children = readChildrens(row);
    if (children.length === 0) continue;

    const hasMatch = children.some((entry) => {
      const child = asRecord(entry);
      return child ? isChildMatch(child, target) : false;
    });

    if (hasMatch) return parentUuid;
  }

  return undefined;
}

function normalizePlatformListResponse(
  response: unknown,
  manageRows: RawService[] = []
): ManageService[] {
  const fallbackByUuid = new Map(
    manageRows.flatMap((item) => {
      const uuid = asString(item.uuid).trim();
      return uuid
        ? ([[uuid, mapAdminApiServiceToManageService(item)]] as const)
        : [];
    })
  );

  return normalizeServicesResponse(
    extractRawServices(response).map((item) => {
      const uuid = asString(item.uuid).trim();
      return mapAdminApiServiceToManageService(
        item,
        uuid ? fallbackByUuid.get(uuid) : undefined
      );
    })
  );
}

/**
 * - no category → `GET /admin/api-services?type=all`
 * - with category slug/name/uuid → `GET /admin/api-services?category={value}`
 */
export async function fetchManageServices(
  category?: string | null,
  cachedManageRows?: RawService[]
): Promise<ManageService[]> {
  const path = category
    ? MANAGE_SERVICES_ENDPOINTS.platformListByCategory(
        category,
        PLATFORM_SERVICES_LIMIT
      )
    : MANAGE_SERVICES_ENDPOINTS.platformListAll(PLATFORM_SERVICES_LIMIT);

  const [response, manageRows] = await Promise.all([
    apiGet<unknown>(path),
    cachedManageRows
      ? Promise.resolve(cachedManageRows)
      : fetchManageServicesBatch(),
  ]);
  return normalizePlatformListResponse(response, manageRows);
}

export async function fetchManageServicesBatch(): Promise<RawService[]> {
  const response = await apiGet<unknown>(MANAGE_SERVICES_ENDPOINTS.batchList);
  return extractRawServices(response);
}

export async function fetchHierarchyServices(): Promise<ManageService[]> {
  const rows = await fetchManageServicesBatch();
  return normalizeServicesResponse(
    rows.map((item) => mapAdminApiServiceToManageService(item))
  );
}

/** Full service detail for edit dialog. */
export async function fetchManageServiceDetail(
  uuid: string,
  fallback?: Partial<ManageService>,
  cachedManageRows?: RawService[]
): Promise<ManageService> {
  const [response, manageRows] = await Promise.all([
    apiGet<unknown>(MANAGE_SERVICES_ENDPOINTS.platformDetail(uuid)),
    cachedManageRows
      ? Promise.resolve(cachedManageRows)
      : fetchManageServicesBatch(),
  ]);

  const detailRecord = unwrapServiceDetail(response);
  const detailParentUuid = readParentUuid(detailRecord);
  const manageRow = manageRows.find((item) => asString(item.uuid) === uuid);
  const manageParentUuid = manageRow ? readParentUuid(manageRow) : undefined;
  const inferredParentUuid = resolveParentUuidFromChildrens(
    {
      ...detailRecord,
      ...manageRow,
      uuid,
    },
    manageRows
  );
  const resolvedParentUuid =
    manageParentUuid ?? detailParentUuid ?? inferredParentUuid;

  const safeFallback = fallback ? { ...fallback, parentUuid: null } : fallback;
  const mapped = mapAdminApiServiceToManageService(detailRecord, safeFallback);

  if (resolvedParentUuid !== undefined) {
    return { ...mapped, parentUuid: resolvedParentUuid };
  }
  return mapped;
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

/**
 * Directly patch base API service fields (like `templateName`) on `api_services` table.
 * Backend `PUT /admin/services/:uuid/custom-data` only updates `services_custom_data`
 * and does not update `api_services.template_name`.
 * `PATCH /api-services/:uuid` is the backend endpoint that updates `api_services.template_name`.
 */
export async function patchApiServiceTemplateName(
  uuid: string,
  templateName: string
): Promise<void> {
  await apiPatch(MANAGE_SERVICES_ENDPOINTS.patchBaseService(uuid), {
    templateName,
  });
}

/** Convenience: map ManageService → custom-data and upsert. */
export async function updateManageServiceCustomData(
  service: ManageService,
  patch?: Partial<
    Pick<
      ManageService,
      | "isActive"
      | "searchable"
      | "display"
      | "submodels"
      | "name"
      | "description"
      | "badge"
      | "slug"
      | "categoryUuids"
      | "categoryOrders"
      | "order"
      | "inactiveReason"
      | "creditHint"
      | "minRequiredCredit"
      | "imageUrl"
      | "isAutoCredit"
    >
  >
): Promise<ManageService> {
  const merged: ManageService = { ...service, ...patch };
  const payload = mapManageServiceToCustomData(merged, patch);
  const result = await upsertServiceCustomData(service.uuid, payload, merged);

  if (patch?.submodels !== undefined) {
    const templateName = resolveServiceTemplateName(merged.submodels.length);
    await patchApiServiceTemplateName(service.uuid, templateName).catch(
      (err) => {
        console.warn(
          `[updateManageServiceCustomData] Failed to patch templateName for ${service.uuid}:`,
          err
        );
      }
    );
  }

  return result;
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
    persisted.map(async (item) => {
      const templateName = resolveServiceTemplateName(item.submodels.length);
      const res = await upsertServiceCustomData(
        item.uuid,
        mapManageServiceToCustomData(item),
        item
      );
      await patchApiServiceTemplateName(item.uuid, templateName).catch(
        (err) => {
          console.warn(
            `[syncManageServicesUpdateData] Failed to patch templateName for ${item.uuid}:`,
            err
          );
        }
      );
      return res;
    })
  );

  return results.map((item) => ({ ...item, isLocal: false }));
}

/**
 * Persist parent/child links.
 * Sends both top-level `childrens` and `metadata.ui.childrens` so backend
 * hierarchy synchronization, api_services metadata, and service_custom_data
 * custom overrides remain fully synchronized.
 * Also synchronizes base table `api_services.template_name` via PATCH /api-services/:uuid.
 */
export async function saveServiceHierarchyParents(
  parents: Array<{ parent: ManageService; children: ManageService[] }>
): Promise<void> {
  await Promise.all(
    parents.map(async ({ parent, children }) => {
      const hierarchyChildren = toHierarchyChildrensPayload(children);
      const existingUi = buildCustomDataUiMetadata(parent);
      const templateName = resolveServiceTemplateName(children.length);
      const updatedUi = {
        ...existingUi,
        childrens: hierarchyChildren,
        template_name: templateName,
      };

      await upsertServiceCustomData(
        parent.uuid,
        {
          childrens: hierarchyChildren,
          metadata: {
            ui: updatedUi,
          },
          templateName,
        },
        {
          ...parent,
          templateName,
          modelType: children.length > 0 ? "multi" : parent.modelType,
          submodels: children.map((c, i) =>
            toServiceSubmodelFromCatalog(c, i + 1)
          ),
        }
      );

      // Backend PUT /admin/services/:uuid/custom-data only affects services_custom_data.
      // Base table api_services.template_name is updated via PATCH /api-services/:uuid.
      await patchApiServiceTemplateName(parent.uuid, templateName).catch(
        (err) => {
          console.warn(
            `[saveServiceHierarchyParents] Failed to patch templateName on base service ${parent.uuid}:`,
            err
          );
        }
      );
    })
  );
}

export type ReindexSearchResult = {
  success?: boolean;
  indexedCount?: number;
};

export async function reindexManageServicesSearch(): Promise<ReindexSearchResult> {
  return apiPost<ReindexSearchResult>(MANAGE_SERVICES_ENDPOINTS.reindexSearch);
}
