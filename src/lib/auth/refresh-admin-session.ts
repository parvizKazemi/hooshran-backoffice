import { apiBaseUrl } from "@/lib/env";
import {
  isRefreshExpired,
  readSessionClock,
  slideUserSessionCookie,
  writeSessionClock,
} from "@/lib/auth/session-clock";
import {
  ADMIN_LOGOUT_ENDPOINT,
  ADMIN_REFRESH_ENDPOINT,
  isAccessDue,
} from "@/lib/auth/token-policy";

export type RefreshResult = "refreshed" | "fresh" | "rejected" | "unavailable";

const REFRESH_TIMEOUT_MS = 8_000;
const LOGOUT_TIMEOUT_MS = 5_000;
const REJECT_COOLDOWN_MS = 5_000;
const REFRESH_LOCK_KEY = "hooshran.admin.refresh-lock";
const REFRESH_LOCK_MS = 12_000;

let inflight: Promise<RefreshResult> | null = null;
let rejectedAt = 0;
let refreshSuspended = false;

export function suspendAdminRefresh(): void {
  refreshSuspended = true;
}

export function resumeAdminRefresh(): void {
  refreshSuspended = false;
}

function claimRefreshLock(): string | null {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    const current = raw ? (JSON.parse(raw) as { until?: number }) : {};
    if (typeof current.until === "number" && current.until > now) return null;
    const owner = `${now}-${Math.random().toString(36).slice(2)}`;
    const next = JSON.stringify({ owner, until: now + REFRESH_LOCK_MS });
    localStorage.setItem(REFRESH_LOCK_KEY, next);
    return localStorage.getItem(REFRESH_LOCK_KEY) === next ? owner : null;
  } catch {
    return "local";
  }
}

function releaseRefreshLock(owner: string | null): void {
  if (!owner || owner === "local") return;
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    const current = raw ? (JSON.parse(raw) as { owner?: string }) : {};
    if (current.owner === owner) localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    /* another tab already cleared it */
  }
}

function waitUntilRefreshLockFree(): Promise<void> {
  const started = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      try {
        const raw = localStorage.getItem(REFRESH_LOCK_KEY);
        const until = raw
          ? Number((JSON.parse(raw) as { until?: number }).until)
          : 0;
        if (
          !until ||
          until <= Date.now() ||
          Date.now() - started >= REFRESH_LOCK_MS
        ) {
          resolve();
          return;
        }
      } catch {
        resolve();
        return;
      }
      window.setTimeout(tick, 150);
    };
    tick();
  });
}

function unwrapPayload(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const record = body as Record<string, unknown>;
  if (typeof record.code === "string" && "data" in record) return record.data;
  return body;
}

function positiveNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
    return undefined;
  return value;
}

function readTokenLifetimes(body: unknown): {
  expiresIn?: number;
  refreshTokenExpiresIn?: number;
} | null {
  const unwrapped = unwrapPayload(body);
  if (!unwrapped || typeof unwrapped !== "object") return null;
  const record = unwrapped as Record<string, unknown>;
  const token =
    record.token && typeof record.token === "object"
      ? (record.token as Record<string, unknown>)
      : record;
  if (typeof token.accessToken !== "string" || token.accessToken.length === 0)
    return null;
  return {
    expiresIn: positiveNumber(token.expiresIn),
    refreshTokenExpiresIn: positiveNumber(token.refreshTokenExpiresIn),
  };
}

function shouldRefreshNow(): boolean {
  const clock = readSessionClock();
  if (!clock) return true;
  if (isRefreshExpired(clock)) return true;
  return isAccessDue(clock.accessExpiresAt);
}

async function postJson(
  endpoint: string,
  timeoutMs: number
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: "{}",
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Cookie only. The API prefers ADMIN_REFRESH_TOKEN over the body, and that
 * cookie is httpOnly. A second copy in JS can disagree with it and trip reuse detection.
 */
async function performRefresh(): Promise<RefreshResult> {
  const response = await postJson(ADMIN_REFRESH_ENDPOINT, REFRESH_TIMEOUT_MS);
  if (!response) return "unavailable";

  if (response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const lifetimes = readTokenLifetimes(body);
    if (!lifetimes) return "unavailable";
    writeSessionClock(lifetimes.expiresIn, lifetimes.refreshTokenExpiresIn);
    slideUserSessionCookie();
    rejectedAt = 0;
    return "refreshed";
  }

  if (
    response.status === 401 ||
    response.status === 403 ||
    response.status === 400
  ) {
    rejectedAt = Date.now();
    return "rejected";
  }

  return "unavailable";
}

async function runRefresh(force: boolean): Promise<RefreshResult> {
  const before = readSessionClock();
  if (before && isRefreshExpired(before)) {
    rejectedAt = Date.now();
    return "rejected";
  }

  let owner = claimRefreshLock();
  if (!owner) {
    await waitUntilRefreshLockFree();
    owner = claimRefreshLock();
  }

  try {
    const latest = readSessionClock();
    const otherTabRotated =
      latest != null &&
      !isAccessDue(latest.accessExpiresAt) &&
      (before == null || latest.accessExpiresAt > before.accessExpiresAt);
    if (otherTabRotated) return "fresh";
    if (!force && latest && !isAccessDue(latest.accessExpiresAt))
      return "fresh";
    return await performRefresh();
  } finally {
    releaseRefreshLock(owner);
  }
}

/** One rotation at a time. A refresh token can be presented once. */
export function refreshAdminSession(options?: {
  force?: boolean;
}): Promise<RefreshResult> {
  if (refreshSuspended) return Promise.resolve("fresh");
  const force = options?.force === true;
  if (Date.now() - rejectedAt < REJECT_COOLDOWN_MS)
    return Promise.resolve("rejected");
  if (inflight) return inflight;
  if (!force && !shouldRefreshNow()) return Promise.resolve("fresh");

  const promise = runRefresh(force).finally(() => {
    if (inflight === promise) inflight = null;
  });
  inflight = promise;
  return promise;
}

export function clearRefreshRejection(): void {
  rejectedAt = 0;
}

/** Revoke the refresh cookie. The API clears the httpOnly cookies on this response. */
export async function requestAdminLogout(): Promise<void> {
  await postJson(ADMIN_LOGOUT_ENDPOINT, LOGOUT_TIMEOUT_MS);
}
