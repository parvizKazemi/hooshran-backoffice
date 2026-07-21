import { MULTI_MODEL_SLUG_PREFIX } from "../constants";
import type {
  ManageService,
  ManageServicePayload,
  ServiceSubmodel,
  ServiceSubmodelPayload,
} from "../types";

export function sortServicesByOrder(items: ManageService[]): ManageService[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function getCategoryOrder(
  item: ManageService,
  categoryUuid: string
): number {
  const fromCategory = item.categoryOrders?.[categoryUuid];
  if (typeof fromCategory === "number") {
    return fromCategory;
  }
  return item.order > 0 ? item.order : 0;
}

export function sortServicesByCategoryOrder(
  items: ManageService[],
  categoryUuid: string
): ManageService[] {
  return [...items].sort(
    (a, b) =>
      getCategoryOrder(a, categoryUuid) - getCategoryOrder(b, categoryUuid)
  );
}

export function applyServiceOrders(items: ManageService[]): ManageService[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

export function cloneServices(items: ManageService[]): ManageService[] {
  return items.map((item) => ({
    ...item,
    categoryUuids: [...item.categoryUuids],
    categoryOrders: item.categoryOrders
      ? { ...item.categoryOrders }
      : undefined,
    submodels: item.submodels.map((sub) => ({ ...sub })),
  }));
}

export function slugifyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Full multi-model slug from a name or free suffix. Prefix is always `models-`. */
export function buildMultiModelSlug(nameOrSuffix: string): string {
  return buildMultiModelSlugFromSuffix(nameOrSuffix);
}

/** Editable part after the locked `models-` prefix. */
export function getMultiModelSlugSuffix(slug: string): string {
  const trimmed = slug.trim();
  if (trimmed.startsWith(MULTI_MODEL_SLUG_PREFIX)) {
    return trimmed.slice(MULTI_MODEL_SLUG_PREFIX.length);
  }
  return slugifyName(trimmed);
}

/** Build `models-{suffix}`; strips accidental nested `models-` from suffix. */
export function buildMultiModelSlugFromSuffix(suffix: string): string {
  let clean = slugifyName(suffix) || "service";
  while (clean.startsWith(MULTI_MODEL_SLUG_PREFIX)) {
    clean = clean.slice(MULTI_MODEL_SLUG_PREFIX.length) || "service";
  }
  return `${MULTI_MODEL_SLUG_PREFIX}${clean}`;
}

export function createLocalUuid(prefix = "local"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createLocalService(
  values: Omit<ManageService, "uuid" | "isLocal" | "submodels"> & {
    submodels?: ServiceSubmodel[];
  }
): ManageService {
  return {
    ...values,
    uuid: createLocalUuid("svc"),
    submodels: values.submodels ?? [],
    isLocal: true,
  };
}

export function createLocalSubmodel(
  values: Omit<ServiceSubmodel, "uuid" | "isLocal">
): ServiceSubmodel {
  return {
    ...values,
    uuid: createLocalUuid("sub"),
    isLocal: true,
  };
}

export function areServicesEqual(
  current: ManageService[],
  original: ManageService[]
): boolean {
  return (
    JSON.stringify(toComparable(current)) ===
    JSON.stringify(toComparable(original))
  );
}

function toComparable(items: ManageService[]) {
  return sortServicesByOrder(items).map((item) => ({
    uuid: item.uuid,
    name: item.name,
    description: item.description,
    slug: item.slug,
    modelType: item.modelType,
    badge: item.badge,
    imageUrl: item.imageUrl,
    order: item.order,
    isActive: item.isActive,
    inactiveReason: item.inactiveReason,
    categoryUuids: [...item.categoryUuids].sort(),
    parentUuid: item.parentUuid,
    isAutoCredit: item.isAutoCredit,
    creditHint: item.creditHint,
    isLocal: Boolean(item.isLocal),
    submodels: item.submodels.map((sub) => ({
      uuid: sub.uuid,
      name: sub.name,
      description: sub.description,
      slug: sub.slug,
      imageUrl: sub.imageUrl,
      creditHint: sub.creditHint,
      badge: sub.badge,
      isActive: sub.isActive,
      inactiveReason: sub.inactiveReason,
      isLocal: Boolean(sub.isLocal),
    })),
  }));
}

function toSubmodelPayload(sub: ServiceSubmodel): ServiceSubmodelPayload {
  return {
    ...(sub.isLocal ? {} : { uuid: sub.uuid }),
    name: sub.name,
    description: sub.description,
    slug: sub.slug,
    imageUrl: sub.imageUrl,
    creditHint: sub.creditHint,
    badge: sub.badge,
    isActive: sub.isActive,
    inactiveReason: sub.inactiveReason,
  };
}

export function toServicePayload(item: ManageService): ManageServicePayload {
  return {
    ...(item.isLocal ? {} : { uuid: item.uuid }),
    name: item.name,
    description: item.description,
    slug: item.slug,
    modelType: item.modelType,
    badge: item.badge,
    imageUrl: item.imageUrl,
    order: item.order,
    isActive: item.isActive,
    inactiveReason: item.inactiveReason,
    categoryUuids: [...item.categoryUuids],
    parentUuid: item.parentUuid,
    isAutoCredit: item.isAutoCredit,
    creditHint: item.creditHint,
    submodels: item.submodels.map(toSubmodelPayload),
  };
}

export function toServicePayloadList(
  items: ManageService[]
): ManageServicePayload[] {
  return sortServicesByOrder(items).map(toServicePayload);
}

export function normalizeServicesResponse(
  response: ManageService[] | { data: ManageService[] }
): ManageService[] {
  const list = Array.isArray(response) ? response : response.data;
  return sortServicesByOrder(
    list.map((item) => {
      const raw = item as ManageService & { introduction?: string };
      const description =
        raw.description?.trim() || raw.introduction?.trim() || "";

      return {
        ...item,
        description,
        introduction: raw.introduction?.trim() || undefined,
        order: item.order > 0 ? item.order : 1,
        categoryUuids: item.categoryUuids ?? [],
        categoryOrders: item.categoryOrders ?? {},
        parentUuid: item.parentUuid ?? null,
        inactiveReason: item.inactiveReason ?? "",
        creditHint: item.creditHint ?? "",
        imageUrl: item.imageUrl ?? "",
        isLocal: false,
        submodels: (item.submodels ?? []).map((sub) => ({
          ...sub,
          isLocal: false,
        })),
      };
    })
  );
}

export function filterServicesByCategory(
  items: ManageService[],
  categoryUuid: string | "all"
): ManageService[] {
  if (categoryUuid === "all") return sortServicesByOrder(items);
  return sortServicesByCategoryOrder(
    items.filter((item) => item.categoryUuids.includes(categoryUuid)),
    categoryUuid
  );
}

export function removeServiceFromCategory(
  items: ManageService[],
  serviceUuid: string,
  categoryUuid: string
): ManageService[] {
  return items.map((item) => {
    if (item.uuid !== serviceUuid) return item;
    return {
      ...item,
      categoryUuids: item.categoryUuids.filter((id) => id !== categoryUuid),
    };
  });
}
