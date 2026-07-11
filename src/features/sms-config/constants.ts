import type { KnownSmsProviderId, SmsAction } from "./types";
import { KNOWN_SMS_PROVIDER_IDS } from "./types";

export const SMS_CONFIG_QUERY_KEY = ["sms-config"] as const;

export const PROVIDER_LABEL_KEYS: Record<
  KnownSmsProviderId,
  "smsConfig.providers.sms_ir" | "smsConfig.providers.ippanel"
> = {
  sms_ir: "smsConfig.providers.sms_ir",
  ippanel: "smsConfig.providers.ippanel",
};

export function isKnownSmsProviderId(id: string): id is KnownSmsProviderId {
  return (KNOWN_SMS_PROVIDER_IDS as readonly string[]).includes(id);
}

export const ACTION_LABEL_KEYS: Record<
  SmsAction,
  | "smsConfig.actions.login"
  | "smsConfig.actions.forgetPassword"
  | "smsConfig.actions.creditExpiration"
  | "smsConfig.actions.subscriptionExpiration"
  | "smsConfig.actions.adminSubscriptionDays"
> = {
  login: "smsConfig.actions.login",
  forgetPassword: "smsConfig.actions.forgetPassword",
  creditExpiration: "smsConfig.actions.creditExpiration",
  subscriptionExpiration: "smsConfig.actions.subscriptionExpiration",
  adminSubscriptionDays: "smsConfig.actions.adminSubscriptionDays",
};
