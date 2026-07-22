export const SERVICE_HINT_ENDPOINTS = {
  platformServices: "/admin/api-services",
  serviceGuide: (serviceUuid: string) =>
    `/admin/services/${encodeURIComponent(serviceUuid)}/guide`,
} as const;
