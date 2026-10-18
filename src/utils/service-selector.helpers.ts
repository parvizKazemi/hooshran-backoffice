import { apiGet } from "@/services/api";

export type SelectableService = {
  uuid: string;
  name: string;
  slug?: string;
};

/**
 * Normalizes text for search:
 * - Lowercases and trims
 * - Removes Persian/Arabic diacritics (Harakat / Tashkeel / Kasreh / Tanwin / Sukun / etc.)
 * - Strips zero-width characters (ZWNJ \u200c, ZWJ \u200d, ZWSP \u200b, BOM \ufeff)
 * - Normalizes Arabic Yeh/Kaf to Persian Ye/Ke
 * - Normalizes Alef variants (آ, أ, إ, ٱ) to standard Alef (ا)
 * - Normalizes Teh Marbuta (ة) to He (ه)
 * - Converts Persian (۰-۹) and Arabic (٠-٩) digits to ASCII (0-9)
 */
export const normalizeSearchText = (text?: string | null): string => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u064A\u0649]/g, "ی")
    .replace(/\u0643/g, "ک")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "ا")
    .replace(/\u0629/g, "ه")
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .trim();
};

export const stripSearchSeparators = (text: string): string => {
  return text.replace(/[\s\-_()/.\\]+/g, "");
};

export const isServiceMatchingQuery = (
  name: string,
  slug: string | undefined,
  normalizedQuery: string
): boolean => {
  if (!normalizedQuery) return true;

  const normalizedName = normalizeSearchText(name);
  const normalizedSlug = normalizeSearchText(slug);

  // 1. Direct substring match
  if (
    normalizedName.includes(normalizedQuery) ||
    (normalizedSlug && normalizedSlug.includes(normalizedQuery))
  ) {
    return true;
  }

  // 2. Separator-stripped match (e.g. "آوانگار" matches "آوا نگار" or "avanegar2" matches "avanegar-2")
  const cleanQuery = stripSearchSeparators(normalizedQuery);
  if (cleanQuery) {
    const cleanName = stripSearchSeparators(normalizedName);
    const cleanSlug = normalizedSlug
      ? stripSearchSeparators(normalizedSlug)
      : "";
    if (
      cleanName.includes(cleanQuery) ||
      (cleanSlug && cleanSlug.includes(cleanQuery))
    ) {
      return true;
    }
  }

  // 3. Multi-word match: every word in query must match name or slug
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const cleanName = stripSearchSeparators(normalizedName);
    const cleanSlug = normalizedSlug
      ? stripSearchSeparators(normalizedSlug)
      : "";
    const allTokensMatch = tokens.every((token) => {
      const cleanToken = stripSearchSeparators(token);
      return (
        normalizedName.includes(token) ||
        (normalizedSlug && normalizedSlug.includes(token)) ||
        (cleanToken && cleanName.includes(cleanToken)) ||
        (cleanSlug && cleanToken && cleanSlug.includes(cleanToken))
      );
    });
    if (allTokensMatch) {
      return true;
    }
  }

  return false;
};

export const filterServicesByQuery = <T extends SelectableService>(
  services: T[],
  query: string
): T[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return services;
  }

  return services.filter((service) =>
    isServiceMatchingQuery(service.name, service.slug, normalizedQuery)
  );
};

export const sortServicesWithSelectedFirst = <T extends SelectableService>(
  services: T[],
  selectedUuids: string[]
): T[] => {
  if (selectedUuids.length === 0) {
    return services;
  }

  const selectedSet = new Set(selectedUuids);
  const selected = selectedUuids
    .map((uuid) => services.find((service) => service.uuid === uuid))
    .filter((service): service is T => Boolean(service));
  const unselected = services.filter(
    (service) => !selectedSet.has(service.uuid)
  );

  return [...selected, ...unselected];
};

let serviceSlugMapCache: Map<string, string> | null = null;

export async function fetchServiceSlugMap(): Promise<Map<string, string>> {
  if (serviceSlugMapCache) {
    return serviceSlugMapCache;
  }
  try {
    const res = await apiGet<
      | { services?: Array<{ uuid: string; slug?: string }> }
      | Array<{ uuid: string; slug?: string }>
    >("/api-service?limit=1000&type=all");
    const list = Array.isArray(res) ? res : (res?.services ?? []);
    serviceSlugMapCache = new Map();
    for (const item of list) {
      if (item?.uuid && item?.slug) {
        serviceSlugMapCache.set(item.uuid, item.slug);
      }
    }
    return serviceSlugMapCache;
  } catch (err) {
    console.warn("Failed to fetch service slug map:", err);
    return new Map();
  }
}

export async function enrichServicesWithSlugs<
  T extends { uuid: string; slug?: string },
>(services: T[]): Promise<T[]> {
  if (services.length > 0 && services.every((s) => Boolean(s.slug))) {
    return services;
  }

  const slugMap = await fetchServiceSlugMap();
  if (slugMap.size === 0) return services;

  return services.map((service) => {
    if (service.slug) return service;
    const slug = slugMap.get(service.uuid);
    return slug ? { ...service, slug } : service;
  });
}
