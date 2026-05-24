export type SubscriptionFreezeConfig = {
  isFrozen: boolean;
  title: string;
  message: string;
};

export type SubscriptionFreezeStartPayload = Pick<
  SubscriptionFreezeConfig,
  "title" | "message"
>;

export type PurchasePaymentSettings = {
  isPurchaseDisabled: boolean;
  purchaseDisabledMessage: string;
};

export type RegistrationSettings = {
  isNewRegistrationBlocked: boolean;
};

export type UserSettingsState = {
  purchasePayment: PurchasePaymentSettings;
  registration: RegistrationSettings;
};
