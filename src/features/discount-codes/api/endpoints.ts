export const DISCOUNT_CODE_ENDPOINTS = {
  list: "/admin/discount-code",
  create: "/admin/discount-code",
  detail: (uuid: string) => `/admin/discount-code/${uuid}`,
  update: (uuid: string) => `/admin/discount-code/${uuid}`,
  overallReport: "/admin/discount-code/reports",
  singleReport: (uuid: string) => `/admin/discount-code/${uuid}/report`,
} as const;
