export const KNOWN_SMS_PROVIDER_IDS = ["sms_ir", "ippanel"] as const;

export type KnownSmsProviderId = (typeof KNOWN_SMS_PROVIDER_IDS)[number];

/** Known providers + future custom provider ids from backend */
export type SmsProviderId = KnownSmsProviderId | (string & {});

export const SMS_ACTIONS = [
  "login",
  "forgetPassword",
  "creditExpiration",
  "subscriptionExpiration",
  "adminSubscriptionDays",
] as const;

export type SmsAction = (typeof SMS_ACTIONS)[number];

export type ConfigSource = "redis" | "db" | "env";

export type SmsTemplateConfig = {
  templateId: string;
  params: Record<string, string>;
};

export type SmsProviderConfigItem = {
  id: SmsProviderId;
  isActive: boolean;
  /** Known actions + any future/custom actions from backend */
  templates: Record<string, SmsTemplateConfig>;
};

export type SmsConfigResponse = {
  providers: SmsProviderConfigItem[];
  source: ConfigSource;
};

export type UpdateSmsConfigPayload = {
  providers: SmsProviderConfigItem[];
};
