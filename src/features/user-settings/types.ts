export type FreezeStartSettings = {
  isFreezeEnabled: boolean;
  outageTitle: string;
  outageDescription: string;
};

export type FreezeEndSettings = {
  manualUnfreezeGraceDays: number;
  compensationGiftDays: number;
  sendRecoverySms: boolean;
};

export type PurchasePaymentSettings = {
  isPurchaseDisabled: boolean;
  purchaseDisabledMessage: string;
};

export type RegistrationSettings = {
  isNewRegistrationBlocked: boolean;
};

export type UserSettingsState = {
  freezeStart: FreezeStartSettings;
  freezeEnd: FreezeEndSettings;
  purchasePayment: PurchasePaymentSettings;
  registration: RegistrationSettings;
};
