import type {
  PurchasePaymentSettings,
  RequestToolsGateSettings,
} from "../types";

export type MaintenanceModeFormState = {
  isEnabled: boolean;
  description: string;
  estimatedTime: string;
};

export type MaintenanceModeSnapshot = {
  previousPaymentGate: PurchasePaymentSettings;
  previousRequestToolsGate: RequestToolsGateSettings;
};

export type MaintenanceModePersistedState = MaintenanceModeFormState &
  MaintenanceModeSnapshot & {
    isActive: boolean;
    notificationId?: string;
  };

export type MaintenanceModeMessages = {
  purchaseMessage: string;
  outageTitle: string;
  outageDescription: string;
  notificationTitle: string;
  notificationMessage: string;
  notificationBadge?: string;
};
