export const FILTERS_ENDPOINTS = {
  list: "/admin/filters",
  item: (filter: string) => `/admin/filters/${encodeURIComponent(filter)}`,
  serviceDetail: (uuid: string) =>
    `/admin/api-services/${encodeURIComponent(uuid)}`,
  serviceCustomData: (uuid: string) =>
    `/admin/services/${encodeURIComponent(uuid)}/custom-data`,
} as const;
