import { refreshAdminSession } from "@/lib/auth/refresh-admin-session";
import {
  SESSION_SIGNAL_KEY,
  notifySessionEnded,
  readSessionSignal,
} from "@/lib/auth/session-events";
import { isRefreshExpired, readSessionClock } from "@/lib/auth/session-clock";
import {
  ACCESS_TOKEN_REFRESH_LEAD_MS,
  REFRESH_UNAVAILABLE_BACKOFF_MS,
} from "@/lib/auth/token-policy";

const CLOCK_KEY = "hooshran.admin.session-clock";

type WatchHandlers = {
  onRemoteLogout: () => void;
};

function nextDelay(now = Date.now()): number {
  const clock = readSessionClock();
  if (!clock) return 0;
  if (isRefreshExpired(clock, now)) return 0;
  return Math.max(
    clock.accessExpiresAt - now - ACCESS_TOKEN_REFRESH_LEAD_MS,
    0
  );
}

/**
 * Rotates the access cookie before it expires, and when the tab wakes up.
 * Does not change the page or show a loading state.
 */
export function watchAdminSession(handlers: WatchHandlers): () => void {
  let timer = 0;
  let stopped = false;
  let nextAllowedAt = 0;

  const schedule = () => {
    window.clearTimeout(timer);
    if (stopped) return;
    const delay = Math.max(nextDelay(), nextAllowedAt - Date.now());
    timer = window.setTimeout(() => {
      void run();
    }, delay);
  };

  const run = async () => {
    if (stopped) return;
    const clock = readSessionClock();
    if (clock && isRefreshExpired(clock)) {
      notifySessionEnded();
      return;
    }

    const result = await refreshAdminSession();
    if (stopped) return;
    if (result === "rejected") {
      notifySessionEnded();
      return;
    }
    if (result === "unavailable") {
      nextAllowedAt = Date.now() + REFRESH_UNAVAILABLE_BACKOFF_MS;
    }
    schedule();
  };

  const onWake = () => {
    if (document.visibilityState === "hidden") return;
    schedule();
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === CLOCK_KEY) {
      schedule();
      return;
    }
    if (event.key !== SESSION_SIGNAL_KEY) return;
    const reason = readSessionSignal(event.newValue);
    if (reason === "logged-out") handlers.onRemoteLogout();
    if (reason === "ended") notifySessionEnded();
  };

  schedule();
  document.addEventListener("visibilitychange", onWake);
  window.addEventListener("focus", onWake);
  window.addEventListener("pageshow", onWake);
  window.addEventListener("storage", onStorage);

  return () => {
    stopped = true;
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onWake);
    window.removeEventListener("focus", onWake);
    window.removeEventListener("pageshow", onWake);
    window.removeEventListener("storage", onStorage);
  };
}
