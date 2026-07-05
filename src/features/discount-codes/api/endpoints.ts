export const DISCOUNT_CODE_ENDPOINTS = {
  list: "/admin/discount-code",
  create: "/admin/discount-code",
  overallReport: "/admin/discount-code/reports",
  singleReport: (id: number) => `/admin/discount-code/${id}/report`,
} as const;
