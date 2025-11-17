import { User } from "../../types";

/**
 * Get user display name from profile or fallback fields
 */
export function getUserDisplayName(
  user: User,
  fallbackText: string = "بدون نام"
): string {
  return (
    user.profile?.full_name ||
    user.fullName ||
    user.name ||
    user.phoneNumber ||
    fallbackText
  );
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n?.[0] || "")
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "N/A";
}

/**
 * Get role label
 */
export function getRoleLabel(
  role: string | undefined,
  t: (key: string) => string
): string {
  const roleLabels: Record<string, string> = {
    admin: t("users.roles.admin"),
    ADMIN: t("users.roles.ADMIN"),
    moderator: t("users.roles.moderator"),
    user: t("users.roles.user"),
    USER: t("users.roles.USER"),
  };
  return roleLabels[role || "user"] || role || "user";
}

/**
 * Get role badge variant
 */
export function getRoleVariant(
  role: string | undefined
): "default" | "secondary" | "outline" {
  const roleVariants: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    ADMIN: "default",
    moderator: "secondary",
    user: "outline",
    USER: "outline",
  };
  return roleVariants[role || "user"] || "outline";
}

/**
 * Get status label
 */
export function getStatusLabel(
  status: string | undefined,
  t: (key: string) => string
): string {
  const statusLabels: Record<string, string> = {
    active: t("users.statuses.active"),
    inactive: t("users.statuses.inactive"),
    suspended: t("users.statuses.suspended"),
  };
  return statusLabels[status || "active"] || status || "active";
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status: string | undefined
): "default" | "secondary" | "destructive" | "outline" {
  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    inactive: "secondary",
    suspended: "destructive",
  };
  return statusVariants[status || "active"] || "outline";
}

/**
 * Get user status from isActive or status field
 */
export function getUserStatus(user: User): string {
  const isActive =
    user.isActive !== undefined ? user.isActive : user.status === "active";
  return user.status || (isActive ? "active" : "inactive");
}
