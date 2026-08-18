export const AFFILIATE_ADMIN_QUERY_KEY = "affiliate-admin-dashboard";

export const AFFILIATE_ADMIN_ENDPOINTS = {
  accounts: "/admin/affiliate/accounts",
  payoutRequests: "/admin/affiliate/payout-requests",
  approvePayoutRequest: (uuid: string) =>
    `/admin/affiliate/payout-requests/${uuid}/approve`,
  rejectPayoutRequest: (uuid: string) =>
    `/admin/affiliate/payout-requests/${uuid}/reject`,
  updateAccountStatus: (uuid: string) =>
    `/admin/affiliate/accounts/${uuid}/status`,
  commissions: "/admin/affiliate/commissions",
  config: "/admin/affiliate/config",
  reports: "/admin/affiliate/reports",
} as const;

export const AFFILIATE_DEFAULT_RULES = {
  firstCommissionRate: 20,
  capAmount: 1_500_000,
  renewalCommissionRate: 10,
  renewalSunsetDays: 180,
  holdDays: 14,
  minPayoutAmount: 500_000,
} as const;

export const AFFILIATE_REJECT_REASONS = [
  "عدم تطابق نام صاحب شماره شبا با حساب",
  "اشتباه در شماره شبا / حساب مسدود است",
  "مشکوک به تقلب خود-ارجاعی (Self-Referral)",
] as const;

export const PROGRAM_RULE_ALIASES = {
  firstCommissionRate: [
    "firstCommissionRate",
    "commission",
    "firstCommission",
    "first_commission_rate",
    "firstPurchasePercentage",
    "first_purchase_percentage",
  ],
  capAmount: [
    "capAmount",
    "cap",
    "commissionCap",
    "cap_amount",
    "transactionCap",
    "transaction_cap",
  ],
  renewalCommissionRate: [
    "renewalCommissionRate",
    "renewalCommission",
    "renewal_commission_rate",
    "renewalPercentage",
    "renewal_percentage",
  ],
  renewalSunsetDays: [
    "renewalSunsetDays",
    "renewalMonths",
    "renewalDurationDays",
    "renewal_sunset_days",
    "cookieDurationDays",
    "cookie_duration_days",
  ],
  holdDays: ["holdDays", "holdPeriodDays", "pendingDays", "hold_days"],
  minPayoutAmount: [
    "minPayoutAmount",
    "minPayout",
    "minimumPayout",
    "min_payout_amount",
  ],
} as const;
