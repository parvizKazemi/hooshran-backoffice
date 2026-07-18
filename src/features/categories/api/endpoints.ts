/**
 * Category admin API paths — change here when backend routes are finalized.
 */
export const CATEGORY_ENDPOINTS = {
  list: "/admin/categories",
  create: "/admin/categories",
  detail: (id: string) => `/admin/categories/${id}`,
  update: (id: string) => `/admin/categories/${id}`,
  remove: (id: string) => `/admin/categories/${id}`,
  reorder: "/admin/categories/reorder",
} as const;
