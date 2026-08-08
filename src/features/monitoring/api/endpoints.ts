export const MONITORING_ENDPOINTS = {
  list: "/admin/monitoring/errors",
  detail: (uuid: string) => `/admin/monitoring/errors/${uuid}`,
} as const;
