import { MAINTENANCE_MODE_STORAGE_KEY } from "./constants";
import type { MaintenanceModePersistedState } from "./types";

export function readMaintenanceModeState(): MaintenanceModePersistedState | null {
  try {
    const raw = localStorage.getItem(MAINTENANCE_MODE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as MaintenanceModePersistedState;
  } catch {
    return null;
  }
}

export function writeMaintenanceModeState(
  state: MaintenanceModePersistedState
): void {
  localStorage.setItem(MAINTENANCE_MODE_STORAGE_KEY, JSON.stringify(state));
}

export function clearMaintenanceModeState(): void {
  localStorage.removeItem(MAINTENANCE_MODE_STORAGE_KEY);
}
