import { PARENT_SERVICE_TEMPLATE_NAME } from "../constants";
import type { ManageService, ServiceBadge, ServiceModelType } from "../types";

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
  if (typeof raw.creditHint === "string" && raw.creditHint.trim()) {
    return raw.creditHint.trim();
  }
  const information = asRecord(raw.information);
  const fromInfo = asString(information?.cost_hint).trim();
  if (fromInfo) return fromInfo;
  const metadata = asRecord(raw.metadata);
  const ui = asRecord(metadata?.ui);
  return asString(ui?.cost_hint).trim();
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

  const submodelsRaw = Array.isArray(raw.submodels) ? raw.submodels : [];
  const submodels =
    submodelsRaw.length > 0
      ? submodelsRaw.map((item) => {
          const sub = asRecord(item) ?? {};
          return {
            uuid: asString(sub.uuid),
            name: asString(sub.name),
            description: asString(sub.description),
            slug: asString(sub.slug),
            imageUrl: asString(sub.imageUrl),
            creditHint: asString(sub.creditHint),
            badge: normalizeBadge(sub.badge),
            isActive: asBoolean(sub.isActive, true),
            inactiveReason: asString(sub.inactiveReason),
            isLocal: false,
          };
        })
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
