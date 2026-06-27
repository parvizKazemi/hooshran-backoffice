export const DEFAULT_SIGNUP_RULE_TYPE = "utm_content" as const;
export const DEFAULT_SIGNUP_RULE_VALUE = "n" as const;

export const UTM_CAMPAIGN_TYPES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

export type UtmCampaignType = (typeof UTM_CAMPAIGN_TYPES)[number];

export const PLATFORM_SERVICES_LIMIT = 150;
