/**
 * Manage Services (catalog) API paths.
 * Batch array body: GET / POST / PATCH.
 */
export const MANAGE_SERVICES_ENDPOINTS = {
  /** GET → ManageService[] */
  list: "/admin/services",
  /** POST → ManageServicePayload[] (first save / empty baseline) */
  create: "/admin/services",
  /** PATCH → ManageServicePayload[] (full-list sync) */
  save: "/admin/services",
  /** GET → platform service detail (accept_hint / inputs) */
  platformDetail: (slug: string) => `/api-service/${slug}`,
} as const;
