import { apiGet, apiPut } from "@/services/api";
import type {
  CatalogServiceOption,
  ManageService,
  ServiceSubmodel,
} from "../types";
import { mapAdminApiServiceToManageService } from "@/features/manage-services/utils/map-admin-api-service";
import {
  getCreditDisplay,
  mapManageServiceToCustomData,
  normalizeServicesResponse,
  resolveParentSubmodelsFromCatalog,
  type ServiceCustomDataPayload,
} from "@/features/manage-services/utils/service.helpers";
import { PLATFORM_SERVICES_LIMIT } from "../constants";
import { MANAGE_SERVICES_ENDPOINTS } from "./endpoints";

type RawService = Record<string, unknown>;

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
  information?: {
    childrens?: unknown;
    inputs?: {
      service?: {
        frontend?: {
          accept_hint?: unknown;
        };
      };
    };
  };
  metadata?: {
    ui?: {
      childrens?: unknown;
    };
  };
  childrens?: unknown;
  [key: string]: unknown;
};

type AcceptHintOption = {
  uuid?: string;
  slug?: string;
  order?: number;
  name?: string;
  endpoint?: string;
  image?: string | null;
  introduction?: string | null;
  cost?: string;
  active?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeCostValue(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? String(value) : undefined;
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^0+(?:\.0+)?$/.test(trimmed)) return undefined;
  return trimmed;
}

function endpointToSlug(endpoint: string): string {
  return endpoint.replace(/\//g, "-");
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/^\/+|\/+$/g, "");
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
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

function normalizeAcceptHint(hint: unknown): AcceptHintOption[] {
  if (!hint) return [];

  const options: AcceptHintOption[] = [];

  if (Array.isArray(hint)) {
    for (const entry of hint) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const endpoint = record.endpoint;
      const name = record.name;
      const slug = record.slug;
      const uuid = record.uuid;
      const order = record.order;
      if (
        typeof endpoint !== "string" &&
        typeof slug !== "string" &&
        typeof uuid !== "string"
      ) {
        continue;
      }

      options.push({
        uuid: typeof uuid === "string" ? uuid : undefined,
        slug: typeof slug === "string" ? slug : undefined,
        order: typeof order === "number" ? order : undefined,
        endpoint: typeof endpoint === "string" ? endpoint : undefined,
        name: typeof name === "string" ? name : undefined,
        image: typeof record.image === "string" ? record.image : undefined,
        introduction:
          typeof record.introduction === "string"
            ? record.introduction
            : undefined,
        cost: record.cost != null ? String(record.cost) : undefined,
        active: typeof record.active === "boolean" ? record.active : undefined,
      });
    }
    return options;
  }

  if (typeof hint === "object") {
    for (const [endpoint, value] of Object.entries(
      hint as Record<string, unknown>
    )) {
      const name =
        typeof value === "string"
          ? value
          : typeof value === "object" && value !== null
            ? ((value as Record<string, unknown>).name as string | undefined)
            : undefined;
      if (!endpoint) continue;
      const record =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)
          : null;
      const slug = record?.slug;
      const uuid = record?.uuid;
      const order = record?.order;

      options.push({
        uuid: typeof uuid === "string" ? uuid : undefined,
        slug: typeof slug === "string" ? slug : undefined,
        order: typeof order === "number" ? order : undefined,
        endpoint,
        name,
        image: typeof record?.image === "string" ? record.image : undefined,
        introduction:
          typeof record?.introduction === "string"
            ? record.introduction
            : undefined,
        cost: record?.cost != null ? String(record.cost) : undefined,
        active: typeof record?.active === "boolean" ? record.active : undefined,
      });
    }
  }

  return options;
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
  const direct = raw.childrens;
  const candidate = information?.childrens ?? ui?.childrens ?? direct;
  return Array.isArray(candidate) ? candidate : [];
}

function hasChildrens(raw: Record<string, unknown>): boolean {
  return readChildrens(raw).length > 0;
}

function resolveSubmodelsFromAcceptHint(
  options: AcceptHintOption[],
  catalog: CatalogServiceOption[],
  parentUuid?: string
): ServiceSubmodel[] {
  if (options.length === 0) return [];

  const byUuid = new Map<string, CatalogServiceOption>();
  const bySlug = new Map<string, CatalogServiceOption>();
  const byEndpoint = new Map<string, CatalogServiceOption>();
  const byName = new Map<string, CatalogServiceOption>();

  const candidateCatalog = catalog.filter((item) => {
    return Boolean(item.uuid) && item.uuid !== parentUuid;
  });

  for (const item of catalog) {
    byUuid.set(item.uuid, item);

    const slug = item.slug.trim();
    if (slug) {
      bySlug.set(slug, item);
      const slugStripped = stripModelsPrefix(slug);
      if (slugStripped) bySlug.set(slugStripped, item);
    }

    const endpoint =
      typeof item.endpoint === "string" ? normalizeEndpoint(item.endpoint) : "";
    if (endpoint) {
      byEndpoint.set(endpoint, item);
      const endpointStripped = stripModelsPrefix(endpoint);
      if (endpointStripped) byEndpoint.set(endpointStripped, item);
    }

    const normalizedName = normalizeName(item.name);
    if (normalizedName) byName.set(normalizedName, item);
  }

  const seen = new Set<string>();
  const resolved: ServiceSubmodel[] = [];
  const isAllowedForParent = (item: CatalogServiceOption) =>
    !parentUuid || !item.parentUuid || item.parentUuid === parentUuid;
  const isChildCandidate = (item: CatalogServiceOption) =>
    item.uuid !== parentUuid;

  for (const [index, option] of options.entries()) {
    const normalizedEndpoint = normalizeEndpoint(option.endpoint ?? "");
    const optionSlug = normalizeEndpoint((option.slug ?? "").trim());
    const optionSlugStripped = stripModelsPrefix(optionSlug);
    const optionEndpointStripped = stripModelsPrefix(normalizedEndpoint);
    const slug = endpointToSlug(normalizedEndpoint);
    const strippedSlug = endpointToSlug(optionEndpointStripped);

    const matchedBySlug =
      (optionSlug ? bySlug.get(optionSlug) : undefined) ||
      (optionSlugStripped ? bySlug.get(optionSlugStripped) : undefined) ||
      bySlug.get(slug) ||
      bySlug.get(strippedSlug) ||
      (normalizedEndpoint ? bySlug.get(normalizedEndpoint) : undefined) ||
      (optionEndpointStripped
        ? bySlug.get(optionEndpointStripped)
        : undefined) ||
      candidateCatalog.find((item) => {
        const itemSlug = normalizeEndpoint(item.slug);
        const itemSlugStripped = stripModelsPrefix(itemSlug);
        return (
          (optionSlug &&
            (itemSlug === optionSlug || itemSlugStripped === optionSlug)) ||
          (optionSlugStripped &&
            (itemSlug === optionSlugStripped ||
              itemSlugStripped === optionSlugStripped)) ||
          itemSlug === slug ||
          itemSlugStripped === slug ||
          itemSlug === strippedSlug ||
          itemSlugStripped === strippedSlug
        );
      });

    const matchedByEndpoint =
      (normalizedEndpoint ? byEndpoint.get(normalizedEndpoint) : undefined) ||
      (optionEndpointStripped
        ? byEndpoint.get(optionEndpointStripped)
        : undefined) ||
      candidateCatalog.find((item) =>
        isEndpointEquivalent(normalizedEndpoint, item.endpoint ?? "")
      );

    const matchedByUuid =
      typeof option.uuid === "string" && option.uuid !== parentUuid
        ? byUuid.get(option.uuid)
        : undefined;

    const matchedByName =
      option.name && normalizeName(option.name)
        ? byName.get(normalizeName(option.name))
        : undefined;

    const matched = [
      matchedBySlug,
      matchedByEndpoint,
      matchedByUuid,
      matchedByName,
    ].find(
      (item) => item && isAllowedForParent(item) && isChildCandidate(item)
    );

    const matchedSlug = (matched?.slug ?? "").trim();
    const fallbackSlug =
      optionSlug ||
      optionSlugStripped ||
      endpointToSlug(optionEndpointStripped || normalizedEndpoint);
    const resolvedSlug = matchedSlug || fallbackSlug;
    if (
      !matched ||
      !resolvedSlug ||
      !isAllowedForParent(matched) ||
      !isChildCandidate(matched) ||
      seen.has(matched.uuid)
    ) {
      continue;
    }
    seen.add(matched.uuid);

    resolved.push({
      uuid: matched.uuid,
      name: matched.name || option.name || "",
      description: matched.description || option.introduction || "",
      slug: resolvedSlug,
      endpoint: matched.endpoint || option.endpoint,
      imageUrl: matched.imageUrl || option.image || "",
      creditHint:
        normalizeCostValue(matched.creditHint) ||
        normalizeCostValue(matched.cost) ||
        normalizeCostValue(option.cost) ||
        "",
      cost:
        normalizeCostValue(matched.cost) ||
        normalizeCostValue(matched.creditHint) ||
        normalizeCostValue(option.cost),
      badge: matched.badge ?? null,
      isActive: matched.isActive ?? option.active ?? true,
      inactiveReason: matched.inactiveReason ?? "",
      order: option.order ?? index + 1,
      isLocal: false,
    });
  }

  return resolved;
}

function readAcceptHint(detail: Record<string, unknown>): unknown {
  const direct = asRecord(
    asRecord(asRecord(detail.inputs)?.service)?.frontend
  )?.accept_hint;
  if (direct != null) return direct;
  return asRecord(
    asRecord(asRecord(asRecord(detail.information)?.inputs)?.service)?.frontend
  )?.accept_hint;
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

function areSubmodelListsEqual(
  current: ServiceSubmodel[],
  expected: ServiceSubmodel[]
): boolean {
  if (current.length !== expected.length) return false;
  for (let index = 0; index < current.length; index += 1) {
    const a = current[index];
    const b = expected[index];
    if (!a || !b) return false;
    if (a.uuid !== b.uuid) return false;
    if ((a.order ?? index + 1) !== (b.order ?? index + 1)) return false;
    if ((a.slug || "").trim() !== (b.slug || "").trim()) return false;
    if ((a.endpoint || "").trim() !== (b.endpoint || "").trim()) return false;
    if (normalizeCostValue(a.cost) !== normalizeCostValue(b.cost)) return false;
    if (a.isActive !== b.isActive) return false;
  }
  return true;
}

function normalizePlatformListResponse(response: unknown): ManageService[] {
  return normalizeServicesResponse(
    extractRawServices(response).map((item) =>
      mapAdminApiServiceToManageService(item)
    )
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

export async function fetchManageServicesBatch(): Promise<RawService[]> {
  const response = await apiGet<unknown>(MANAGE_SERVICES_ENDPOINTS.batchList);
  return extractRawServices(response);
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
  const mapped = mapAdminApiServiceToManageService(response, safeFallback);

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

type SyncChildrensResult = {
  scannedParents: number;
  emptyParents: number;
  updatedParents: number;
};

function resolveCatalogCost(item: ManageService): string | undefined {
  const fromHint = normalizeCostValue(item.creditHint);
  if (fromHint) return fromHint;

  const displayCost = getCreditDisplay(item.cost);
  if (displayCost !== "-") return displayCost;

  return normalizeCostValue(item.cost);
}

function toCatalogOptions(
  items: ManageService[],
  options?: { endpointByUuid?: Map<string, string> }
): CatalogServiceOption[] {
  return items.map((item) => ({
    uuid: item.uuid,
    name: item.name,
    slug: item.slug,
    endpoint: options?.endpointByUuid?.get(item.uuid) ?? item.endpoint,
    modelType: item.modelType,
    description: item.description,
    imageUrl: item.imageUrl,
    creditHint: item.creditHint,
    cost: resolveCatalogCost(item),
    badge: item.badge,
    isActive: item.isActive,
    inactiveReason: item.inactiveReason,
    order: item.order,
    parentUuid: item.parentUuid,
  }));
}

/**
 * Legacy fallback:
 * reads `inputs.service.frontend.accept_hint` and resolves children by catalog.
 */
export async function fetchParentSubmodelsFromAcceptHint(
  parentUuid: string,
  catalog: CatalogServiceOption[]
): Promise<ServiceSubmodel[]> {
  const detailResponse = await apiGet<PlatformServiceDetail>(
    MANAGE_SERVICES_ENDPOINTS.platformDetail(parentUuid)
  );
  const detail = unwrapServiceDetail(detailResponse);
  const options = normalizeAcceptHint(readAcceptHint(detail));
  const fromAcceptHint = resolveSubmodelsFromAcceptHint(
    options,
    catalog,
    parentUuid
  );
  if (fromAcceptHint.length > 0) return fromAcceptHint;
  return resolveParentSubmodelsFromCatalog(parentUuid, catalog);
}

/** Backfill `metadata.ui.childrens` for multi-model services once. */
export async function syncManageServicesChildrens(): Promise<SyncChildrensResult> {
  const listResponse = await apiGet<unknown>(
    MANAGE_SERVICES_ENDPOINTS.batchList
  );
  const rawList = extractRawServices(listResponse);
  const adminListResponse = await apiGet<unknown>(
    MANAGE_SERVICES_ENDPOINTS.platformListAll(PLATFORM_SERVICES_LIMIT)
  );
  const rawAdminList = extractRawServices(adminListResponse);
  const adminServiceByUuid = new Map(
    rawAdminList.flatMap((item) => {
      const uuid = asString(item.uuid).trim();
      return uuid
        ? ([[uuid, mapAdminApiServiceToManageService(item)]] as const)
        : [];
    })
  );
  const endpointByUuid = new Map(
    [...rawList, ...rawAdminList].flatMap((item) => {
      const uuid = String(item.uuid ?? "");
      const endpoint =
        typeof item.endpoint === "string"
          ? normalizeEndpoint(item.endpoint)
          : "";
      return uuid && endpoint ? ([[uuid, endpoint]] as const) : [];
    })
  );
  const catalog = normalizeServicesResponse(
    rawList.map((item) => {
      const uuid = asString(item.uuid).trim();
      return mapAdminApiServiceToManageService(
        item,
        uuid ? adminServiceByUuid.get(uuid) : undefined
      );
    })
  );
  const catalogOptions = toCatalogOptions(catalog, { endpointByUuid });
  const parents = catalog.filter(
    (item) => item.modelType === "multi" && !item.isLocal
  );
  const detailByUuid = new Map<string, Promise<ManageService>>();
  const loadCatalogDetail = (uuid: string): Promise<ManageService> => {
    const cached = detailByUuid.get(uuid);
    if (cached) return cached;

    const fallback = catalog.find((item) => item.uuid === uuid);
    const request = apiGet<PlatformServiceDetail>(
      MANAGE_SERVICES_ENDPOINTS.platformDetail(uuid)
    ).then((response) =>
      mapAdminApiServiceToManageService(unwrapServiceDetail(response), fallback)
    );
    detailByUuid.set(uuid, request);
    return request;
  };

  const hydrateSubmodels = async (
    submodels: ServiceSubmodel[]
  ): Promise<ServiceSubmodel[]> =>
    Promise.all(
      submodels.map(async (submodel) => {
        try {
          const detail = await loadCatalogDetail(submodel.uuid);
          const cost = resolveCatalogCost(detail);
          return {
            ...submodel,
            name: detail.name || submodel.name,
            description: detail.description || submodel.description,
            slug: detail.slug || submodel.slug,
            endpoint: detail.endpoint || submodel.endpoint,
            imageUrl: detail.imageUrl || submodel.imageUrl,
            creditHint:
              normalizeCostValue(detail.creditHint) ??
              cost ??
              submodel.creditHint,
            cost: cost ?? normalizeCostValue(submodel.cost),
            badge: detail.badge,
            isActive: detail.isActive,
            inactiveReason: detail.inactiveReason,
          };
        } catch {
          return submodel;
        }
      })
    );

  let updatedParents = 0;
  let emptyParents = 0;

  for (const parent of parents) {
    const detailResponse = await apiGet<PlatformServiceDetail>(
      MANAGE_SERVICES_ENDPOINTS.platformDetail(parent.uuid)
    );
    const rawDetail = unwrapServiceDetail(detailResponse);
    if (!hasChildrens(rawDetail)) emptyParents += 1;

    const acceptHintOptions = normalizeAcceptHint(readAcceptHint(rawDetail));

    const expectedSubmodelsFromAcceptHint = resolveSubmodelsFromAcceptHint(
      acceptHintOptions,
      catalogOptions,
      parent.uuid
    );

    const expectedSubmodelsFromCatalog = resolveParentSubmodelsFromCatalog(
      parent.uuid,
      catalogOptions
    );

    const resolvedSubmodels =
      expectedSubmodelsFromAcceptHint.length > 0
        ? expectedSubmodelsFromAcceptHint
        : expectedSubmodelsFromCatalog;
    const expectedSubmodels = await hydrateSubmodels(resolvedSubmodels);
    if (expectedSubmodels.length === 0) continue;

    const currentSubmodels = mapAdminApiServiceToManageService(
      rawDetail,
      parent
    ).submodels;
    if (areSubmodelListsEqual(currentSubmodels, expectedSubmodels)) continue;

    await updateManageServiceCustomData(parent, {
      submodels: expectedSubmodels,
    });
    updatedParents += 1;
  }

  return {
    scannedParents: parents.length,
    emptyParents,
    updatedParents,
  };
}
