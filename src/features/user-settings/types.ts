export type SubscriptionFreezeConfig = {
  isFrozen: boolean;
  title: string;
  message: string;
};

export type SubscriptionFreezeStartPayload = Pick<
  SubscriptionFreezeConfig,
  "title" | "message"
>;

export type ServiceRequestSendingConfig = {
  isEnableService: boolean;
  serviceOutageTitle: string;
  serviceOutageDescription: string;
  whiteList: string[];
  updatedAt?: string;
};

export type RequestToolsGateSettings = {
  isRequestSendingDisabled: boolean;
  outageTitle: string;
  outageDescription: string;
  testerWhitelistPhoneNumbers: string[];
};

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

export type BannedUser = {
  uuid: string;
  phoneNumber: string;
  banningReason?: string;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
  profile?: {
    full_name?: string | null;
  } | null;
};

export type BlacklistRecord = BannedUser;

export type BanUserPayload = {
  phoneNumber: string;
  banningReason: string;
};

export type UpdateBanPayload = {
  uuid: string;
  banningReason: string;
};

export type BannedUsersQueryParams = {
  page?: number;
  take?: number;
  search?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
};
