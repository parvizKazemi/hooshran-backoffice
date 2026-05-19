import i18next from "@/i18n";
import { apiGet, apiPatch } from "@/services/api";
import type {
  FreezeEndSettings,
  FreezeStartSettings,
  PurchasePaymentSettings,
  RegistrationSettings,
  UserSettingsState,
} from "../types";
import { USER_SETTINGS_ENDPOINTS } from "./endpoints";

const API_SIMULATION_DELAY_MS = 350;

const delay = (ms = API_SIMULATION_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const resolveFallbackPurchaseMessage = () =>
  i18next.t("common:userSettings.defaults.purchaseDisabledFallbackMessage");

const normalizePurchaseSettings = (
  payload: PurchasePaymentSettings
): PurchasePaymentSettings => {
  const trimmed = payload.purchaseDisabledMessage.trim();
  return {
    ...payload,
    purchaseDisabledMessage: trimmed || resolveFallbackPurchaseMessage(),
  };
};

let mockUserSettingsState: UserSettingsState = {
  freezeStart: {
    isFreezeEnabled: false,
    outageTitle: i18next.t("common:userSettings.defaults.outageTitle"),
    outageDescription: i18next.t(
      "common:userSettings.defaults.outageDescription"
    ),
  },
  freezeEnd: {
    manualUnfreezeGraceDays: 10,
    compensationGiftDays: 5,
    sendRecoverySms: true,
  },
  purchasePayment: {
    isPurchaseDisabled: false,
    purchaseDisabledMessage: resolveFallbackPurchaseMessage(),
  },
  registration: {
    isNewRegistrationBlocked: false,
  },
};

export async function getUserSettings(): Promise<UserSettingsState> {
  try {
    return await apiGet<UserSettingsState>(USER_SETTINGS_ENDPOINTS.getAll);
  } catch {
    await delay();
    return structuredClone(mockUserSettingsState);
  }
}

export async function updateFreezeStartSettings(
  payload: FreezeStartSettings
): Promise<UserSettingsState> {
  try {
    return await apiPatch<UserSettingsState>(
      USER_SETTINGS_ENDPOINTS.updateFreezeStart,
      payload
    );
  } catch {
    await delay();
    mockUserSettingsState = {
      ...mockUserSettingsState,
      freezeStart: payload,
    };
    return structuredClone(mockUserSettingsState);
  }
}

export async function updateFreezeEndSettings(
  payload: FreezeEndSettings
): Promise<UserSettingsState> {
  try {
    return await apiPatch<UserSettingsState>(
      USER_SETTINGS_ENDPOINTS.updateFreezeEnd,
      payload
    );
  } catch {
    await delay();
    mockUserSettingsState = {
      ...mockUserSettingsState,
      freezeEnd: payload,
    };
    return structuredClone(mockUserSettingsState);
  }
}

export async function updatePurchasePaymentSettings(
  payload: PurchasePaymentSettings
): Promise<UserSettingsState> {
  const normalizedPayload = normalizePurchaseSettings(payload);
  try {
    return await apiPatch<UserSettingsState>(
      USER_SETTINGS_ENDPOINTS.updatePurchasePayment,
      normalizedPayload
    );
  } catch {
    await delay();
    mockUserSettingsState = {
      ...mockUserSettingsState,
      purchasePayment: normalizedPayload,
    };
    return structuredClone(mockUserSettingsState);
  }
}

export async function updateRegistrationSettings(
  payload: RegistrationSettings
): Promise<UserSettingsState> {
  try {
    return await apiPatch<UserSettingsState>(
      USER_SETTINGS_ENDPOINTS.updateRegistration,
      payload
    );
  } catch {
    await delay();
    mockUserSettingsState = {
      ...mockUserSettingsState,
      registration: payload,
    };
    return structuredClone(mockUserSettingsState);
  }
}
