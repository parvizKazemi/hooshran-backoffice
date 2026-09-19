export const PLAN_CAMPAIGN_ENDPOINTS = {
  list: "/admin/campaigns",
  detail: (uuid: string) => `/admin/campaigns/${encodeURIComponent(uuid)}`,
  platformServices: "/admin/api-services",
  manageServicesBatch: "/admin/services",
} as const;
