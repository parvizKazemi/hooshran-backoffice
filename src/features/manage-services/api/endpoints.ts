/**
 * Manage Services (catalog) API paths — aligned with backend admin docs.
 * @see hooshran-backend-v2/src/modules/api-service/MODULE.md
 */
export const MANAGE_SERVICES_ENDPOINTS = {
  /** GET → catalog list */
  platformList: "/admin/api-services",
  /** GET → all services */
  platformListAll: (limit = 300) =>
    `/admin/api-services?type=all&limit=${limit}`,
  /**
   * GET → services of one category (backend filter).
   * `category` accepts name | url/slug | uuid per MODULE.md.
   */
  platformListByCategory: (category: string, limit = 300) =>
    `/admin/api-services?category=${encodeURIComponent(category)}&limit=${limit}`,
  /** GET → single service full detail */
  platformDetail: (uuid: string) =>
    `/admin/api-services/${encodeURIComponent(uuid)}`,
  /** PUT → upsert admin custom overrides */
  customData: (uuid: string) =>
    `/admin/services/${encodeURIComponent(uuid)}/custom-data`,
  /** DELETE → remove custom overrides */
  deleteCustomData: (uuid: string) =>
    `/admin/services/${encodeURIComponent(uuid)}/custom-data`,
  /** POST → sync base service data from /api/v1/models-shaped payload */
  updateData: "/admin/api-service/update-data",
} as const;
