import type { ServiceBadge, ServiceModelType } from "./types";

export const MANAGE_SERVICES_QUERY_KEY = ["manage-services"] as const;

export const PLATFORM_SERVICES_LIMIT = 300;

/** Backend / front convention for multi-model shell services. */
export const PARENT_SERVICE_TEMPLATE_NAME = "ParentService";

export const SERVICE_MODEL_TYPES = ["single", "multi"] as const;

export const SERVICE_BADGE_VALUES = ["popular", "most_used", "newest"] as const;

export const SERVICE_BADGE_NONE = "none" as const;

export type ServiceBadgeFormValue =
  | (typeof SERVICE_BADGE_VALUES)[number]
  | typeof SERVICE_BADGE_NONE;

export const MULTI_MODEL_SLUG_PREFIX = "models-";

export const SERVICE_NAME_MAX = 150;
export const SERVICE_DESC_MAX = 150;

export function normalizeServiceBadge(
  value: ServiceBadgeFormValue | ServiceBadge
): ServiceBadge {
  if (value === "popular" || value === "most_used" || value === "newest") {
    return value;
  }
  return null;
}

export function toServiceBadgeFormValue(
  badge: ServiceBadge | undefined
): ServiceBadgeFormValue {
  if (badge === "popular" || badge === "most_used" || badge === "newest") {
    return badge;
  }
  return SERVICE_BADGE_NONE;
}

export function isMultiModelType(type: ServiceModelType): boolean {
  return type === "multi";
}
