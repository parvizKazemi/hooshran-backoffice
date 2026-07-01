export const NEW_USER_RULE_TYPE = "new_user" as const;
export const NEW_USER_RULE_VALUE = "t" as const;

/** @deprecated Legacy signup rule – read-only for migration */
export const LEGACY_SIGNUP_RULE_TYPE = "utm_content" as const;
/** @deprecated Legacy signup rule – read-only for migration */
export const LEGACY_SIGNUP_RULE_VALUE = "n" as const;

export const UTM_CAMPAIGN_TYPES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmCampaignType = (typeof UTM_CAMPAIGN_TYPES)[number];

export const PLATFORM_SERVICES_LIMIT = 300;
