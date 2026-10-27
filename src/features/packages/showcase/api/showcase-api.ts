import { apiGet, apiPut } from "@/services/api";
import { INITIAL_SHOWCASE_DATA } from "../mock-data";
import type {
  CategoryColorTheme,
  ServiceIconType,
  ShowcaseCategory,
  ShowcaseData,
} from "../types";

/**
 * Derives a consistent category icon if omitted by backend DTO.
 */
export function deriveCategoryIcon(id: string, name?: string): ServiceIconType {
  const s = `${id} ${name || ""}`.toLowerCase();
  if (s.includes("video") || s.includes("ویدیو") || s.includes("متحرک"))
    return "video";
  if (
    s.includes("audio") ||
    s.includes("voice") ||
    s.includes("صدا") ||
    s.includes("گویندگی") ||
    s.includes("دوبله")
  )
    return "mic";
  if (
    s.includes("edit") ||
    s.includes("ویرایش") ||
    s.includes("بهینه") ||
    s.includes("رتوش")
  )
    return "wand-2";
  return "image";
}

/**
 * Derives a consistent category color theme if omitted by backend DTO.
 */
export function deriveCategoryTheme(
  id: string,
  name?: string,
  index = 0
): CategoryColorTheme {
  const s = `${id} ${name || ""}`.toLowerCase();
  if (s.includes("edit") || s.includes("ویرایش")) return "emerald";
  if (s.includes("image") || s.includes("تصویر")) return "blue";
  if (s.includes("video") || s.includes("ویدیو")) return "indigo";
  if (s.includes("audio") || s.includes("voice") || s.includes("صدا"))
    return "amber";
  const themes: CategoryColorTheme[] = ["emerald", "blue", "indigo", "amber"];
  return themes[index % themes.length] ?? "indigo";
}

/**
 * Normalizes backend response to guarantee valid icon, colorTheme, order and structure.
 */
export function normalizeAdminShowcase(
  raw: Partial<ShowcaseData> | null | undefined
): ShowcaseData {
  if (!raw || !Array.isArray(raw.categories)) {
    return INITIAL_SHOWCASE_DATA;
  }

  const categories: ShowcaseCategory[] = raw.categories.map((cat, idx) => ({
    id: String(cat.id),
    name: String(cat.name || "دسته‌بندی"),
    icon: cat.icon || deriveCategoryIcon(cat.id, cat.name),
    colorTheme: cat.colorTheme || deriveCategoryTheme(cat.id, cat.name, idx),
    isActive: cat.isActive !== false,
    order: typeof cat.order === "number" ? cat.order : idx + 1,
    services: Array.isArray(cat.services)
      ? cat.services.map((srv, sIdx) => ({
          id: String(srv.id),
          title: String(srv.title || srv.id),
          costDescription: srv.costDescription || "",
          isActive: srv.isActive !== false,
          isPinned: Boolean(srv.isPinned),
          badge: srv.badge ?? null,
          order: typeof srv.order === "number" ? srv.order : sIdx + 1,
          categoryId: String(srv.categoryId || cat.id),
        }))
      : [],
  }));

  return {
    config: {
      defaultRowsBeforeExpand: raw.config?.defaultRowsBeforeExpand ?? 4,
    },
    categories,
  };
}

/**
 * Fetches the showcase layout and configuration from the backend API.
 */
export async function fetchShowcaseData(): Promise<ShowcaseData> {
  const response = await apiGet<ShowcaseData>(
    "/admin/packages/service-showcase"
  );
  return normalizeAdminShowcase(response);
}

/**
 * Saves the showcase layout, priority, pins and status to the backend API.
 */
export async function saveShowcaseData(
  data: ShowcaseData
): Promise<ShowcaseData> {
  const response = await apiPut<ShowcaseData>(
    "/admin/packages/service-showcase",
    data
  );
  return normalizeAdminShowcase(response);
}

/**
 * Resets showcase data back to empty baseline.
 */
export function resetShowcaseDataToDefaults(): ShowcaseData {
  return INITIAL_SHOWCASE_DATA;
}
