import { PARENT_SERVICE_TEMPLATE_NAME } from "../constants";
import type {
  ManageService,
  ServiceBadge,
  ServiceModelType,
  ServiceSubmodel,
} from "../types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toTrimmedString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function normalizeCostValue(value: unknown): string | undefined {
  const normalized = toTrimmedString(value);
  if (!normalized) return undefined;
  if (/^0+(?:\.0+)?$/.test(normalized)) return undefined;
  return normalized;
}

function endpointToSlug(endpoint: string): string {
  return endpoint
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\//g, "-");
}

function normalizeBadge(value: unknown): ServiceBadge {
  if (value === "popular" || value === "most_used" || value === "newest") {
    return value;
  }
  return null;
}

function resolveModelType(raw: Record<string, unknown>): ServiceModelType {
  if (raw.modelType === "multi" || raw.modelType === "single") {
    return raw.modelType;
  }
  const templateName = asString(raw.templateName);
  const slug = asString(raw.slug);
  if (
    templateName === PARENT_SERVICE_TEMPLATE_NAME ||
    slug.startsWith("models-")
  ) {
    return "multi";
  }
  return "single";
}

function resolveImageUrl(raw: Record<string, unknown>): string {
  if (typeof raw.imageUrl === "string" && raw.imageUrl) return raw.imageUrl;
  const information = asRecord(raw.information);
  if (typeof information?.image === "string" && information.image) {
    return information.image;
  }
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  if (typeof ui?.image === "string" && ui.image) return ui.image;
  const media = asRecord(raw.media);
  if (typeof media?.url === "string" && media.url) return media.url;
  return "";
}

function resolveEndpoint(raw: Record<string, unknown>): string {
  const direct = asString(raw.endpoint).trim();
  if (direct) return direct;
  const information = asRecord(raw.information);
  const fromInfo = asString(information?.endpoint).trim();
  if (fromInfo) return fromInfo;
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  return asString(ui?.endpoint).trim();
}

function resolveDescription(raw: Record<string, unknown>): string {
  const direct = asString(raw.description).trim();
  if (direct) return direct;
  const introduction = asString(raw.introduction).trim();
  if (introduction) return introduction;
  const information = asRecord(raw.information);
  const infoDesc = asString(information?.description).trim();
  if (infoDesc) return infoDesc;
  const infoIntro = asString(information?.introduction).trim();
  if (infoIntro) return infoIntro;
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  return (
    asString(ui?.description).trim() || asString(ui?.introduction).trim() || ""
  );
}

function resolveCategoryUuidsFromOrders(
  orders: Record<string, number>
): string[] {
  return Object.keys(orders);
}

function resolveCategoryUuidsLegacy(raw: Record<string, unknown>): string[] {
  if (Array.isArray(raw.categoryUuids)) {
    return raw.categoryUuids.filter(
      (item): item is string => typeof item === "string"
    );
  }
  const category = asRecord(raw.category);
  const uuid = asString(category?.uuid);
  return uuid ? [uuid] : [];
}

/**
 * Membership source of truth: keys of category_orders.
 * Fallback: API categoryUuids / primary category.
 */
function resolveCategoryUuids(
  raw: Record<string, unknown>,
  orders: Record<string, number>
): string[] {
  const fromOrders = resolveCategoryUuidsFromOrders(orders);
  if (fromOrders.length > 0) return fromOrders;
  return resolveCategoryUuidsLegacy(raw);
}

function parseCategoryOrders(
  value: Record<string, unknown> | null
): Record<string, number> {
  if (!value) return {};
  const result: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "number" && Number.isFinite(entry)) {
      result[key] = entry;
    }
  }
  return result;
}

function resolveCategoryOrders(
  raw: Record<string, unknown>
): Record<string, number> {
  const topLevel = parseCategoryOrders(asRecord(raw.categoryOrders));
  if (Object.keys(topLevel).length > 0) return topLevel;

  const information = asRecord(raw.information);
  const fromInfo = parseCategoryOrders(asRecord(information?.category_orders));
  if (Object.keys(fromInfo).length > 0) return fromInfo;

  const ui = asRecord(asRecord(raw.metadata)?.ui);
  return parseCategoryOrders(asRecord(ui?.category_orders));
}

function resolveCreditHint(raw: Record<string, unknown>): string {
  const fromRaw = normalizeCostValue(raw.creditHint);
  if (fromRaw) return fromRaw;
  const information = asRecord(raw.information);
  const fromInfo = normalizeCostValue(information?.cost_hint);
  if (fromInfo) return fromInfo;
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  return normalizeCostValue(ui?.cost_hint) ?? "";
}

function resolveCost(raw: Record<string, unknown>): unknown {
  if (raw.cost !== undefined) return raw.cost;
  const metadata = asRecord(raw.metadata);
  if (metadata?.cost !== undefined) return metadata.cost;
  return undefined;
}

function resolveInactiveReason(raw: Record<string, unknown>): string {
  if (typeof raw.inactiveReason === "string") return raw.inactiveReason;
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  return asString(ui?.inactiveReason);
}

/** Prefer information, then metadata.ui — missing → searchable (opt-out). */
function resolveSearchable(
  raw: Record<string, unknown>,
  fallback?: boolean
): boolean {
  const information = asRecord(raw.information);
  if (typeof information?.searchable === "boolean")
    return information.searchable;
  const ui = asRecord(asRecord(raw.metadata)?.ui);
  if (typeof ui?.searchable === "boolean") return ui.searchable;
  if (typeof raw.searchable === "boolean") return raw.searchable;
  return fallback ?? true;
}

/** Prefer information, then metadata.ui — missing → hidden (opt-in). */
function resolveDisplay(
  raw: Record<string, unknown>,
  fallback?: boolean
): boolean {
  const information = asRecord(raw.information);
  if (typeof information?.display === "boolean") return information.display;
  const ui = asRecord(asRecord(raw.metadata)?.ui);
  if (typeof ui?.display === "boolean") return ui.display;
  if (typeof raw.display === "boolean") return raw.display;
  return fallback ?? false;
}

function mapRawSubmodel(record: Record<string, unknown>): ServiceSubmodel {
  const order = asNumber(record.order, 0);
  const endpoint = asString(record.endpoint).trim();
  const slug =
    asString(record.slug).trim() || (endpoint ? endpointToSlug(endpoint) : "");
  const introduction = asString(record.introduction).trim();
  const description = asString(record.description).trim();
  const cost =
    normalizeCostValue(record.cost) ?? normalizeCostValue(record.creditHint);
  const creditHint = normalizeCostValue(record.creditHint) ?? cost ?? "";
  const isActiveCandidate = record.isActive ?? record.active;

  return {
    uuid: asString(record.uuid),
    name: asString(record.name),
    description: description || introduction,
    slug,
    endpoint: endpoint || undefined,
    imageUrl: asString(record.imageUrl) || asString(record.image),
    creditHint,
    cost: cost || undefined,
    badge: normalizeBadge(record.badge),
    isActive: asBoolean(isActiveCandidate, true),
    inactiveReason: asString(record.inactiveReason),
    order: order > 0 ? order : undefined,
    isLocal: false,
  };
}

function resolveChildrensSubmodels(
  raw: Record<string, unknown>
): ServiceSubmodel[] {
  const information = asRecord(raw.information);
  const ui = asRecord(asRecord(raw.metadata)?.ui);
  const candidates = [information?.childrens, ui?.childrens, raw.childrens];

  for (const value of candidates) {
    if (!Array.isArray(value) || value.length === 0) continue;
    const parsed = value
      .map((item) => {
        const record = asRecord(item);
        if (!record) return null;
        const mapped = mapRawSubmodel(record);
        return mapped.uuid ? mapped : null;
      })
      .filter((item): item is ServiceSubmodel => item !== null);

    if (parsed.length === 0) continue;
    if (parsed.some((item) => item.order !== undefined)) {
      return [...parsed].sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return parsed;
  }

  return [];
}

function resolveOrder(raw: Record<string, unknown>): number {
  const order = asNumber(raw.order, 0);
  if (order > 0) return order;
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  const serviceOrder = asNumber(ui?.service_order, 0);
  return serviceOrder > 0 ? serviceOrder : 1;
}

/**
 * Map GET /admin/api-service/:uuid (or list item) into ManageService form model.
 */
export function mapAdminApiServiceToManageService(
  rawInput: unknown,
  fallback?: Partial<ManageService>
): ManageService {
  const raw = asRecord(rawInput) ?? {};
  const uuid = asString(raw.uuid, fallback?.uuid ?? "");
  const name = asString(raw.name, fallback?.name ?? "");
  const slug = asString(raw.slug, fallback?.slug ?? "");
  const modelType = resolveModelType(raw);
  const description = resolveDescription(raw) || fallback?.description || "";
  const introduction =
    asString(raw.introduction).trim() ||
    asString(asRecord(raw.information)?.introduction).trim() ||
    asString(asRecord(asRecord(raw.metadata)?.ui)?.introduction).trim() ||
    fallback?.introduction;

  const childrensSubmodels = resolveChildrensSubmodels(raw);
  const submodelsRaw = Array.isArray(raw.submodels) ? raw.submodels : [];
  const legacySubmodels = submodelsRaw
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const mapped = mapRawSubmodel(record);
      return mapped.uuid ? mapped : null;
    })
    .filter((item): item is ServiceSubmodel => item !== null);
  const submodels =
    childrensSubmodels.length > 0
      ? childrensSubmodels
      : legacySubmodels.length > 0
        ? legacySubmodels
        : (fallback?.submodels ?? []);

  const resolvedOrders = resolveCategoryOrders(raw);
  const categoryOrders = {
    ...(fallback?.categoryOrders ?? {}),
    ...resolvedOrders,
  };
  const resolvedUuids = resolveCategoryUuids(raw, resolvedOrders);
  const categoryUuids =
    resolvedUuids.length > 0 ? resolvedUuids : (fallback?.categoryUuids ?? []);

  return {
    uuid,
    name,
    description,
    introduction: introduction || undefined,
    slug,
    endpoint: resolveEndpoint(raw) || fallback?.endpoint,
    modelType,
    badge: normalizeBadge(raw.badge) ?? fallback?.badge ?? null,
    imageUrl: resolveImageUrl(raw) || fallback?.imageUrl || "",
    order: resolveOrder(raw) || fallback?.order || 1,
    isActive: asBoolean(raw.isActive, fallback?.isActive ?? true),
    inactiveReason:
      resolveInactiveReason(raw) || fallback?.inactiveReason || "",
    searchable: resolveSearchable(raw, fallback?.searchable),
    display: resolveDisplay(raw, fallback?.display),
    categoryUuids,
    categoryOrders,
    parentUuid:
      raw.parentUuid === null
        ? null
        : asString(raw.parentUuid) || fallback?.parentUuid || null,
    isAutoCredit: asBoolean(
      raw.isAutoCredit,
      !(resolveCreditHint(raw) || fallback?.creditHint || "").trim()
    ),
    creditHint: resolveCreditHint(raw) || fallback?.creditHint || "",
    submodels,
    cost: resolveCost(raw) ?? fallback?.cost,
    isLocal: false,
  };
}
