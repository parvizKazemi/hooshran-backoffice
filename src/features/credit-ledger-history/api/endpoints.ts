export const CREDIT_LEDGER_ENDPOINTS = {
  byPhone: "/admin/users/credit-ledger/by-phone",
  byUserId: (userId: number) => `/admin/users/${userId}/credit-ledger`,
} as const;
