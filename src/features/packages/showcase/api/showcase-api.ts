import { apiGet, apiPut } from "@/services/api";
import { INITIAL_SHOWCASE_DATA } from "../mock-data";
import type { ShowcaseData } from "../types";

const SHOWCASE_STORAGE_KEY = "hooshran_service_showcase_data";

/**
 * Loads showcase data from localStorage or falls back to mock defaults.
 */
function loadFromLocalStorage(): ShowcaseData {
  try {
    const raw = localStorage.getItem(SHOWCASE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load showcase data from localStorage:", e);
  }
  return INITIAL_SHOWCASE_DATA;
}

/**
 * Persists showcase data to localStorage.
 */
function saveToLocalStorage(data: ShowcaseData): void {
  try {
    localStorage.setItem(SHOWCASE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save showcase data to localStorage:", e);
  }
}

/**
 * Fetches the showcase layout and configuration.
 * First tries backend API; gracefully falls back to local storage if endpoint is not implemented.
 */
export async function fetchShowcaseData(): Promise<ShowcaseData> {
  try {
    const response = await apiGet<ShowcaseData>(
      "/admin/packages/service-showcase"
    );
    if (response && Array.isArray(response.categories)) {
      saveToLocalStorage(response);
      return response;
    }
  } catch {
    // Backend endpoint not coded yet - fallback gracefully to local storage
  }

  return loadFromLocalStorage();
}

/**
 * Saves the showcase layout, priority, pins and status.
 * Persists to localStorage and attempts backend sync.
 */
export async function saveShowcaseData(
  data: ShowcaseData
): Promise<ShowcaseData> {
  // Always persist locally first so state survives browser reloads
  saveToLocalStorage(data);

  try {
    const response = await apiPut<ShowcaseData>(
      "/admin/packages/service-showcase",
      data
    );
    if (response && Array.isArray(response.categories)) {
      saveToLocalStorage(response);
      return response;
    }
  } catch (error) {
    // Backend endpoint not ready yet. Local persistence succeeded.
    console.warn(
      "Backend showcase endpoint not available yet. Saved locally to browser storage.",
      error
    );
  }

  return data;
}

/**
 * Resets showcase data back to factory defaults.
 */
export function resetShowcaseDataToDefaults(): ShowcaseData {
  saveToLocalStorage(INITIAL_SHOWCASE_DATA);
  return INITIAL_SHOWCASE_DATA;
}
