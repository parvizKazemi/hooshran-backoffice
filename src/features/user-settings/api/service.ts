import i18next from "@/i18n";
import { apiGet, apiPatch, apiPost } from "@/services/api";
import type {
  PurchasePaymentSettings,
  RegistrationSettings,
  SubscriptionFreezeConfig,
  SubscriptionFreezeStartPayload,
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
  purchasePayment: {
    isPurchaseDisabled: false,
    purchaseDisabledMessage: resolveFallbackPurchaseMessage(),
  },
  registration: {
    isNewRegistrationBlocked: false,
  },
};

let mockSubscriptionFreezeConfig: SubscriptionFreezeConfig = {
  isFrozen: false,
  title: i18next.t("common:userSettings.defaults.outageTitle"),
  message: i18next.t("common:userSettings.defaults.outageDescription"),
};

export async function getUserSettings(): Promise<UserSettingsState> {
  try {
    return await apiGet<UserSettingsState>(USER_SETTINGS_ENDPOINTS.getAll);
  } catch {
    await delay();
    return structuredClone(mockUserSettingsState);
  }
}

export async function getSubscriptionFreezeConfig(): Promise<SubscriptionFreezeConfig> {
  try {
    return await apiGet<SubscriptionFreezeConfig>(
      USER_SETTINGS_ENDPOINTS.getSubscriptionFreezeConfig
    );
  } catch {
    await delay();
    return structuredClone(mockSubscriptionFreezeConfig);
  }
}

export async function updateSubscriptionFreezeConfig(
  payload: SubscriptionFreezeConfig
): Promise<SubscriptionFreezeConfig> {
  const normalizedPayload: SubscriptionFreezeConfig = {
    ...payload,
    title: payload.title.trim(),
    message: payload.message.trim(),
  };

  try {
    return await apiPatch<SubscriptionFreezeConfig>(
      USER_SETTINGS_ENDPOINTS.updateSubscriptionFreezeConfig,
      normalizedPayload
    );
  } catch {
    await delay();
    mockSubscriptionFreezeConfig = normalizedPayload;
    return structuredClone(mockSubscriptionFreezeConfig);
  }
}

export async function startSubscriptionFreeze(
  payload: SubscriptionFreezeStartPayload
): Promise<SubscriptionFreezeConfig> {
  const normalizedPayload: SubscriptionFreezeStartPayload = {
    title: payload.title.trim(),
    message: payload.message.trim(),
  };

  try {
    return await apiPost<SubscriptionFreezeConfig>(
      USER_SETTINGS_ENDPOINTS.startSubscriptionFreeze,
      normalizedPayload
    );
  } catch {
    await delay();
    mockSubscriptionFreezeConfig = {
      isFrozen: true,
      ...normalizedPayload,
    };
    return structuredClone(mockSubscriptionFreezeConfig);
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

export async function getPaymentGateConfig(): Promise<PurchasePaymentSettings> {
  const response = await apiGet<{
    isEnabled: boolean;
    message?: string | null;
  }>(USER_SETTINGS_ENDPOINTS.updatePurchasePayment);

  return {
    isPurchaseDisabled: Boolean(response.isEnabled),
    purchaseDisabledMessage: response.message?.trim() ?? "",
  };
}

export async function updatePaymentGateConfig(
  payload: PurchasePaymentSettings
): Promise<PurchasePaymentSettings> {
  const normalizedMessage = payload.purchaseDisabledMessage.trim();
  const response = await apiPatch<{
    isEnabled: boolean;
    message?: string | null;
  }>(USER_SETTINGS_ENDPOINTS.updatePurchasePayment, {
    isEnabled: payload.isPurchaseDisabled,
    message: normalizedMessage,
  });

  return {
    isPurchaseDisabled: Boolean(response.isEnabled),
    purchaseDisabledMessage: response.message?.trim() ?? "",
  };
}
