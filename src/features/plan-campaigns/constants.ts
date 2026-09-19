export const PLAN_CAMPAIGNS_QUERY_KEY = "plan-campaigns";
export const CAMPAIGN_PLATFORM_SERVICES_QUERY_KEY = "campaign-platform-services";

export const PLATFORM_SERVICES_LIMIT = 300;
export const CAMPAIGNS_STALE_TIME_MS = 60_000;

export const CAMPAIGN_TIER_KEYS = [
  "basic",
  "explorer",
  "adventurer",
  "hero",
] as const;

export type CampaignTierKey = (typeof CAMPAIGN_TIER_KEYS)[number];

export const CAMPAIGN_EXPIRATION_TYPES = [
  "subscription_bound",
  "campaign_bound",
] as const;

export type CampaignExpirationType = (typeof CAMPAIGN_EXPIRATION_TYPES)[number];

export const DEFAULT_END_TIME = "23:59";

export const INDEFINITE_CAMPAIGN_END_ISO = "2099-12-31T23:59:59.000Z";
