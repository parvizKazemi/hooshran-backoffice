import { AFFILIATE_DEFAULT_RULES, PROGRAM_RULE_ALIASES } from "../constants";
import {
  AFFILIATE_COMMISSION_STATUSES,
  AFFILIATE_PARTNER_STATUSES,
  AFFILIATE_PAYOUT_STATUSES,
  type AffiliateAdminDashboard,
  type AffiliateAdminStats,
  type AffiliateCommissionLog,
  type AffiliatePartner,
  type AffiliatePayoutRequest,
  type AffiliateProgramRules,
} from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function formatToman(value: number): string {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("fa-IR");
}

function readNumber(
  source: Record<string, unknown>,
  keys: readonly string[],
  fallback: number
): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/,/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
}

export function unwrapAffiliateAdminPayload(
  raw: unknown
): Record<string, unknown> {
  if (!isRecord(raw)) return {};
  if (isRecord(raw.data)) return raw.data;
  return raw;
}

export function normalizeAffiliateProgramRules(
  raw: unknown
): AffiliateProgramRules {
  const source = isRecord(raw) ? raw : {};
  const nested = isRecord(source.rules) ? source.rules : source;
  const defaults = AFFILIATE_DEFAULT_RULES;

  return {
    firstCommissionRate: readNumber(
      nested,
      PROGRAM_RULE_ALIASES.firstCommissionRate,
      defaults.firstCommissionRate
    ),
    capAmount: readNumber(
      nested,
      PROGRAM_RULE_ALIASES.capAmount,
      defaults.capAmount
    ),
    renewalCommissionRate: readNumber(
      nested,
      PROGRAM_RULE_ALIASES.renewalCommissionRate,
      defaults.renewalCommissionRate
    ),
    renewalSunsetDays: readNumber(
      nested,
      PROGRAM_RULE_ALIASES.renewalSunsetDays,
      defaults.renewalSunsetDays
    ),
    holdDays: readNumber(
      nested,
      PROGRAM_RULE_ALIASES.holdDays,
      defaults.holdDays
    ),
    minPayoutAmount: readNumber(
      nested,
      PROGRAM_RULE_ALIASES.minPayoutAmount,
      defaults.minPayoutAmount
    ),
  };
}

export function deriveAffiliateStats(
  payouts: AffiliatePayoutRequest[],
  baseStats: AffiliateAdminStats
): AffiliateAdminStats {
  const pendingPayouts = payouts.filter(
    (item) => item.status === AFFILIATE_PAYOUT_STATUSES.pending
  );
  const pendingPayoutAmount = pendingPayouts.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const pendingPayoutCount = pendingPayouts.length;

  return {
    ...baseStats,
    pendingPayoutAmount,
    pendingPayoutCount,
    pendingPayoutHint:
      pendingPayoutCount > 0
        ? `${pendingPayoutCount.toLocaleString("fa-IR")} درخواست جدید پایا نیاز به تایید دارد`
        : "درخواست در انتظار تسویه‌ای وجود ندارد",
  };
}

export function mapAffiliateAdminDashboard(
  raw: unknown,
  fallback: AffiliateAdminDashboard
): AffiliateAdminDashboard {
  const payload = unwrapAffiliateAdminPayload(raw);

  const payouts = Array.isArray(payload.payouts)
    ? (payload.payouts as AffiliatePayoutRequest[])
    : fallback.payouts;
  const partners = Array.isArray(payload.partners)
    ? (payload.partners as AffiliatePartner[])
    : fallback.partners;
  const commissions = Array.isArray(payload.commissions)
    ? (payload.commissions as AffiliateCommissionLog[])
    : fallback.commissions;

  const statsSource = isRecord(payload.stats) ? payload.stats : {};
  const stats: AffiliateAdminStats = {
    pendingPayoutAmount: readNumber(
      statsSource,
      ["pendingPayoutAmount", "pending_payout_amount"],
      fallback.stats.pendingPayoutAmount
    ),
    pendingPayoutCount: readNumber(
      statsSource,
      ["pendingPayoutCount", "pending_payout_count"],
      fallback.stats.pendingPayoutCount
    ),
    pendingPayoutHint:
      typeof statsSource.pendingPayoutHint === "string"
        ? statsSource.pendingPayoutHint
        : fallback.stats.pendingPayoutHint,
    totalPaidCommissions: readNumber(
      statsSource,
      ["totalPaidCommissions", "total_paid_commissions"],
      fallback.stats.totalPaidCommissions
    ),
    affiliateGeneratedSales: readNumber(
      statsSource,
      ["affiliateGeneratedSales", "affiliate_generated_sales"],
      fallback.stats.affiliateGeneratedSales
    ),
    activePartnersCount: readNumber(
      statsSource,
      ["activePartnersCount", "active_partners_count"],
      fallback.stats.activePartnersCount
    ),
    marketersWithSalesThisMonth: readNumber(
      statsSource,
      ["marketersWithSalesThisMonth", "marketers_with_sales_this_month"],
      fallback.stats.marketersWithSalesThisMonth
    ),
  };

  return {
    stats: deriveAffiliateStats(payouts, stats),
    payouts,
    partners,
    commissions,
    rules: normalizeAffiliateProgramRules(payload),
  };
}

export function mapAccountStatusToUi(
  status: unknown
): AffiliatePartner["status"] {
  if (status === "SUSPENDED" || status === "suspended") {
    return AFFILIATE_PARTNER_STATUSES.suspended;
  }
  return AFFILIATE_PARTNER_STATUSES.active;
}

export function mapPayoutStatusToUi(
  status: unknown
): AffiliatePayoutRequest["status"] {
  if (status === "PAID" || status === "paid" || status === "APPROVED") {
    return AFFILIATE_PAYOUT_STATUSES.paid;
  }
  if (status === "REJECTED" || status === "rejected") {
    return AFFILIATE_PAYOUT_STATUSES.rejected;
  }
  return AFFILIATE_PAYOUT_STATUSES.pending;
}

export function mapCommissionStatusToUi(
  status: unknown
): AffiliateCommissionLog["status"] {
  if (status === "AVAILABLE" || status === "available") {
    return AFFILIATE_COMMISSION_STATUSES.available;
  }
  return AFFILIATE_COMMISSION_STATUSES.pending;
}

export function filterAffiliatePayouts(
  payouts: AffiliatePayoutRequest[],
  status: AffiliatePayoutRequest["status"] | "all"
): AffiliatePayoutRequest[] {
  if (status === "all") return payouts;
  return payouts.filter((item) => item.status === status);
}

export function filterAffiliatePartners(
  partners: AffiliatePartner[],
  query: string
): AffiliatePartner[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return partners;

  return partners.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.code.toLowerCase().includes(normalized)
  );
}

export function getPurchaseTypePercentLabel(commissionRate: number): string {
  return `${commissionRate.toLocaleString("fa-IR")}٪`;
}

export function isPartnerActive(status: AffiliatePartner["status"]): boolean {
  return status === AFFILIATE_PARTNER_STATUSES.active;
}

export function isPayoutPending(
  status: AffiliatePayoutRequest["status"]
): boolean {
  return status === AFFILIATE_PAYOUT_STATUSES.pending;
}

export function isCommissionAvailable(
  status: AffiliateCommissionLog["status"]
): boolean {
  return status === AFFILIATE_COMMISSION_STATUSES.available;
}
