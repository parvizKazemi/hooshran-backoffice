/**
 * Category admin API paths — change here when backend routes are finalized.
 * Only GET / POST / PATCH (no per-item PUT/DELETE).
 * Request/response bodies are arrays of category objects.
 */
export const CATEGORY_ENDPOINTS = {
  /** GET → Category[] */
  list: "/admin/categories",
  /** POST → body: CategoryPayload[] (create / first save) */
  create: "/admin/categories",
  /** PATCH → body: CategoryPayload[] (full-list sync) */
  save: "/admin/categories",
} as const;
