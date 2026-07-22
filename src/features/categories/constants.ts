import type { CategoryBadge } from "./types";

export const CATEGORY_BADGE_VALUES = ["soon", "new"] as const;

export const CATEGORY_BADGE_NONE = "none" as const;

export type CategoryBadgeFormValue =
  | (typeof CATEGORY_BADGE_VALUES)[number]
  | typeof CATEGORY_BADGE_NONE;

export const CATEGORY_QUERY_KEY = ["categories"] as const;

export const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCategoryBadge(
  value: CategoryBadgeFormValue | CategoryBadge
): CategoryBadge {
  if (value === "soon" || value === "new") return value;
  return null;
}

export function toCategoryBadgeFormValue(
  badge: CategoryBadge | undefined
): CategoryBadgeFormValue {
  if (badge === "soon" || badge === "new") return badge;
  return CATEGORY_BADGE_NONE;
}
