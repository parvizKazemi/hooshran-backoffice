export const AFFILIATE_PAYOUT_STATUSES = {
  pending: "pending",
  paid: "paid",
  rejected: "rejected",
} as const;

export type AffiliatePayoutStatus =
  (typeof AFFILIATE_PAYOUT_STATUSES)[keyof typeof AFFILIATE_PAYOUT_STATUSES];

export const AFFILIATE_PARTNER_STATUSES = {
  active: "active",
  suspended: "suspended",
} as const;

export type AffiliatePartnerStatus =
  (typeof AFFILIATE_PARTNER_STATUSES)[keyof typeof AFFILIATE_PARTNER_STATUSES];

export const AFFILIATE_PURCHASE_TYPES = {
  firstPurchase: "first_purchase",
  renewal: "renewal",
} as const;

export type AffiliatePurchaseType =
  (typeof AFFILIATE_PURCHASE_TYPES)[keyof typeof AFFILIATE_PURCHASE_TYPES];

export const AFFILIATE_COMMISSION_STATUSES = {
  available: "available",
  pending: "pending",
} as const;

export type AffiliateCommissionStatus =
  (typeof AFFILIATE_COMMISSION_STATUSES)[keyof typeof AFFILIATE_COMMISSION_STATUSES];

export type AffiliateAdminStats = {
  pendingPayoutAmount: number;
  pendingPayoutCount: number;
  pendingPayoutHint: string;
  totalPaidCommissions: number;
  affiliateGeneratedSales: number;
  activePartnersCount: number;
  marketersWithSalesThisMonth: number;
};

export type AffiliatePayoutRequest = {
  id: string;
  affiliateName: string;
  affiliateCode: string;
  amount: number;
  sheba: string;
  nameMatch: boolean;
  status: AffiliatePayoutStatus;
  requestedAt: string;
  payaCode?: string | null;
};

export type AffiliatePartner = {
  id: string;
  name: string;
  phone: string;
  code: string;
  buyersCount: number;
  totalEarned: number;
  availableBalance: number;
  status: AffiliatePartnerStatus;
};

export type AffiliateCommissionLog = {
  invoiceId: string;
  affiliateName: string;
  buyerName: string;
  purchaseType: AffiliatePurchaseType;
  paidAmount: number;
  commissionAmount: number;
  commissionRate: number;
  isCapped?: boolean;
  status: AffiliateCommissionStatus;
  unlockDate: string;
  affiliateUserPhone: string;
  buyerUserPhone: string;
};

/** Backend program rules — field names may change; mapper handles aliases. */
export type AffiliateProgramRules = {
  firstCommissionRate: number;
  capAmount: number;
  renewalCommissionRate: number;
  renewalSunsetDays: number;
  holdDays: number;
  minPayoutAmount: number;
};

export type AffiliateAdminDashboard = {
  stats: AffiliateAdminStats;
  payouts: AffiliatePayoutRequest[];
  partners: AffiliatePartner[];
  commissions: AffiliateCommissionLog[];
  rules: AffiliateProgramRules;
};

export type AffiliatePayoutFilter = AffiliatePayoutStatus | "all";

export type ApproveAffiliatePayoutPayload = {
  payoutId: string;
  payaTrackingCode: string;
};

export type RejectAffiliatePayoutPayload = {
  payoutId: string;
  reason: string;
};

export type ToggleAffiliatePartnerPayload = {
  partnerId: string;
  nextStatus: "ACTIVE" | "SUSPENDED";
};
