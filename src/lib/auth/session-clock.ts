import { getCookie, setCookie } from "@/lib/cookies";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  ADMIN_REFRESH_TOKEN_TTL_SECONDS,
  ADMIN_SESSION_COOKIE_DAYS,
  USER_DATA_COOKIE,
} from "@/lib/auth/token-policy";

const CLOCK_KEY = "hooshran.admin.session-clock";

export type SessionClock = {
  accessExpiresAt: number;
  refreshExpiresAt: number;
};

function secondsToMs(
  seconds: number | undefined,
  fallbackSeconds: number
): number {
  if (typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  return fallbackSeconds * 1000;
}

export function readSessionClock(): SessionClock | null {
  try {
    const raw = localStorage.getItem(CLOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionClock>;
    if (
      typeof parsed.accessExpiresAt !== "number" ||
      typeof parsed.refreshExpiresAt !== "number"
    ) {
      return null;
    }
    return {
      accessExpiresAt: parsed.accessExpiresAt,
      refreshExpiresAt: parsed.refreshExpiresAt,
    };
  } catch {
    return null;
  }
}

/** Stores expiry only. The tokens themselves stay in httpOnly cookies. */
export function writeSessionClock(
  expiresInSeconds?: number,
  refreshExpiresInSeconds?: number,
  now = Date.now()
): SessionClock {
  const clock: SessionClock = {
    accessExpiresAt:
      now + secondsToMs(expiresInSeconds, ACCESS_TOKEN_TTL_SECONDS),
    refreshExpiresAt:
      now +
      secondsToMs(refreshExpiresInSeconds, ADMIN_REFRESH_TOKEN_TTL_SECONDS),
  };
  localStorage.setItem(CLOCK_KEY, JSON.stringify(clock));
  return clock;
}

export function clearSessionClock(): void {
  try {
    localStorage.removeItem(CLOCK_KEY);
  } catch {
    /* storage can be blocked */
  }
}

export function isRefreshExpired(
  clock: SessionClock,
  now = Date.now()
): boolean {
  return now >= clock.refreshExpiresAt;
}

/** Slide the profile cookie with each rotation so it does not die before the refresh token. */
export function slideUserSessionCookie(): void {
  const raw = getCookie(USER_DATA_COOKIE);
  if (!raw) return;
  setCookie(USER_DATA_COOKIE, raw, ADMIN_SESSION_COOKIE_DAYS);
}
