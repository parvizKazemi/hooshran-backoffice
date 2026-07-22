/**
 * Manage Services (catalog) API paths — aligned with backend admin docs.
 */
export const MANAGE_SERVICES_ENDPOINTS = {
  /** GET → catalog list (type=all or category slug) */
  platformList: "/admin/api-services",
  platformListAll: (limit = 300) =>
    `/admin/api-services?type=all&limit=${limit}`,
  /** GET by category slug → services of that category (backend type filter) */
  platformListByCategorySlug: (slug: string, limit = 300) =>
    `/admin/api-services?type=${encodeURIComponent(slug)}&limit=${limit}`,
  /** GET → single service full detail */
  platformDetail: (uuid: string) =>
    `/admin/api-services/${encodeURIComponent(uuid)}`,
  /** PUT → upsert admin custom overrides (table / form edits) */
  customData: (uuid: string) =>
    `/admin/services/${encodeURIComponent(uuid)}/custom-data`,
  /** DELETE → remove custom overrides */
  deleteCustomData: (uuid: string) =>
    `/admin/services/${encodeURIComponent(uuid)}/custom-data`,
  /** POST → sync base service data from /api/v1/models-shaped payload */
  updateData: "/admin/api-service/update-data",
} as const;
