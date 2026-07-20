/**
 * Manage Services (catalog) API paths — change here when backend is ready.
 * Batch array body (same pattern as categories): GET / POST / PATCH.
 */
export const MANAGE_SERVICES_ENDPOINTS = {
  /** GET → ManageService[] */
  list: "/admin/services",
  /** POST → ManageServicePayload[] (first save / empty baseline) */
  create: "/admin/services",
  /** PATCH → ManageServicePayload[] (full-list sync) */
  save: "/admin/services",
} as const;
