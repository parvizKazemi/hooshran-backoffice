/** Admin access token lifetime. Backend default is 2 hours. */
export const ACCESS_TOKEN_TTL_SECONDS = 2 * 60 * 60;

/** Admin refresh token lifetime. Backend default is 14 days. */
export const ADMIN_REFRESH_TOKEN_TTL_SECONDS = 14 * 24 * 60 * 60;

/** Ask for a new access token this long before the cookie expires. */
export const ACCESS_TOKEN_REFRESH_LEAD_MS = 60 * 1000;

/** Network or 5xx on refresh: keep the session and try again later. */
export const REFRESH_UNAVAILABLE_BACKOFF_MS = 60 * 1000;

/** Matches the refresh-token cookie. The profile cookie uses the same window. */
export const ADMIN_SESSION_COOKIE_DAYS = 14;

export const USER_DATA_COOKIE = "userData";

export const ADMIN_REFRESH_ENDPOINT = "/admin/auth/refresh";
export const ADMIN_LOGOUT_ENDPOINT = "/admin/auth/logout";

export function isAccessDue(
  accessExpiresAt: number,
  now = Date.now()
): boolean {
  return now >= accessExpiresAt - ACCESS_TOKEN_REFRESH_LEAD_MS;
}
