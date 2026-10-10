const SIGNAL_KEY = "hooshran.admin.session-signal";

type SessionEndHandler = () => void;

let handler: SessionEndHandler | null = null;
let pending = false;
let announced = false;

/** One announcement per dead session, including 401s that arrive before React mounts. */
export function notifySessionEnded(): void {
  if (announced) return;
  if (!handler) {
    pending = true;
    return;
  }
  announced = true;
  pending = false;
  handler();
}

export function registerSessionEndedHandler(
  next: SessionEndHandler
): () => void {
  handler = next;
  if (pending) notifySessionEnded();
  return () => {
    if (handler === next) handler = null;
  };
}

export function resetSessionEnded(): void {
  announced = false;
  pending = false;
}

export function publishSessionSignal(reason: "ended" | "logged-out"): void {
  try {
    localStorage.setItem(SIGNAL_KEY, `${reason}:${Date.now()}`);
  } catch {
    /* another tab just will not hear it */
  }
}

export function readSessionSignal(
  value: string | null
): "ended" | "logged-out" | null {
  if (!value) return null;
  if (value.startsWith("ended:")) return "ended";
  if (value.startsWith("logged-out:")) return "logged-out";
  return null;
}

export const SESSION_SIGNAL_KEY = SIGNAL_KEY;
