export const SERVICE_HINT_ENDPOINTS = {
  platformServices: "/api-service",
  serviceGuide: (serviceUuid: string) =>
    `/admin/services/${encodeURIComponent(serviceUuid)}/guide`,
} as const;
