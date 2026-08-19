import { apiGet, apiPost, apiPut } from "@/services/api";
import { AFFILIATE_ADMIN_ENDPOINTS } from "../constants";
import type {
  AffiliateAdminDashboard,
  AffiliateAdminStats,
  AffiliateCommissionLog,
  AffiliatePartner,
  AffiliatePayoutRequest,
  AffiliateProgramRules,
  ApproveAffiliatePayoutPayload,
  RejectAffiliatePayoutPayload,
  ToggleAffiliatePartnerPayload,
} from "../types";
import {
  deriveAffiliateStats,
  mapAccountStatusToUi,
  mapCommissionStatusToUi,
  mapPayoutStatusToUi,
  normalizeAffiliateProgramRules,
} from "../utils/affiliate.helpers";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  const record = asRecord(value);
  if (Array.isArray(record.data))
    return record.data as Record<string, unknown>[];
  return [];
}

function readString(
  source: Record<string, unknown>,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function readNumber(
  source: Record<string, unknown>,
  keys: string[],
  fallback = 0
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

function mapAccounts(raw: unknown): AffiliatePartner[] {
  return asArray(raw).map((item, index) => ({
    id: readString(item, ["uuid", "id"], `affiliate-${index}`),
    name: readString(
      item,
      ["userFullName", "fullName", "name", "accountHolderName"],
      "—"
    ),
    code: readString(
      item,
      ["discountCode", "discount_code", "affiliateCode", "affiliate_code"],
      "—"
    ),
    buyersCount: readNumber(
      item,
      ["referredBuyersCount", "buyersCount", "referred_buyers_count"],
      0
    ),
    totalEarned: readNumber(item, ["totalEarned", "total_earned"], 0),
    availableBalance: readNumber(
      item,
      ["availableBalance", "available_balance"],
      0
    ),
    status: mapAccountStatusToUi(item.status),
  }));
}

function mapPayoutRequests(raw: unknown): AffiliatePayoutRequest[] {
  return asArray(raw).map((item, index) => ({
    id: readString(item, ["uuid", "id"], `payout-${index}`),
    affiliateName: readString(
      item,
      ["affiliateName", "affiliate_name", "accountHolderName"],
      "—"
    ),
    affiliateCode: readString(
      item,
      ["affiliateCode", "affiliate_code", "discountCode"],
      "—"
    ),
    amount: readNumber(item, ["amount"], 0),
    sheba: readString(item, ["shebaNumber", "sheba_number", "sheba"], "—"),
    nameMatch: item.nameMatch !== false,
    status: mapPayoutStatusToUi(item.status),
    requestedAt: readString(
      item,
      ["createdAt", "created_at", "requestedAt"],
      "—"
    ),
    payaCode:
      readString(item, ["payaTrackingCode", "paya_tracking_code"], "") || null,
  }));
}

function mapCommissions(raw: unknown): AffiliateCommissionLog[] {
  return asArray(raw).map((item, index) => ({
    invoiceId: readString(
      item,
      ["paymentUuid", "invoiceId", "uuid", "id"],
      `invoice-${index}`
    ),
    affiliateName: readString(item, ["affiliateName", "affiliate_name"], "—"),
    buyerName: readString(
      item,
      ["buyerUserFullName", "buyerMaskedName", "buyerName", "buyer_name"],
      "—"
    ),
    purchaseType:
      item.isFirstPurchase === true || item.is_first_purchase === true
        ? "first_purchase"
        : "renewal",
    paidAmount: readNumber(item, ["invoiceAmount", "invoice_amount"], 0),
    commissionAmount: readNumber(
      item,
      ["calculatedCommissionAmount", "calculated_commission_amount"],
      0
    ),
    commissionRate: readNumber(item, ["commissionRate"], 0),
    isCapped: item.isCapped === true || item.is_capped === true,
    status: mapCommissionStatusToUi(item.status),
    unlockDate: readString(
      item,
      ["availableAt", "available_at", "holdUntil", "hold_until"],
      "—"
    ),
  }));
}

function baseStats(): AffiliateAdminStats {
  return {
    pendingPayoutAmount: 0,
    pendingPayoutCount: 0,
    pendingPayoutHint: "درخواستی ثبت نشده است",
    totalPaidCommissions: 0,
    affiliateGeneratedSales: 0,
    activePartnersCount: 0,
    marketersWithSalesThisMonth: 0,
  };
}

function buildDashboard(
  accountsRaw: unknown,
  payoutsRaw: unknown,
  commissionsRaw: unknown,
  configRaw: unknown,
  reportsRaw: unknown
): AffiliateAdminDashboard {
  const partners = mapAccounts(accountsRaw);
  const payouts = mapPayoutRequests(payoutsRaw);
  const commissions = mapCommissions(commissionsRaw);
  const reports = asRecord(reportsRaw);
  const statsSeed = baseStats();

  const stats: AffiliateAdminStats = {
    ...statsSeed,
    totalPaidCommissions: readNumber(
      reports,
      ["totalPaidCommissions", "total_paid_commissions"],
      payouts
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + item.amount, 0)
    ),
    affiliateGeneratedSales: readNumber(
      reports,
      ["affiliateGeneratedSales", "affiliate_generated_sales"],
      commissions.reduce((sum, item) => sum + item.paidAmount, 0)
    ),
    activePartnersCount: readNumber(
      reports,
      ["activePartnersCount", "active_partners_count"],
      partners.filter((item) => item.status === "active").length
    ),
    marketersWithSalesThisMonth: readNumber(
      reports,
      ["marketersWithSalesThisMonth", "marketers_with_sales_this_month"],
      partners.filter((item) => item.buyersCount > 0).length
    ),
  };

  return {
    stats: deriveAffiliateStats(payouts, stats),
    payouts,
    partners,
    commissions,
    rules: normalizeAffiliateProgramRules(configRaw),
  };
}

export async function fetchAffiliateAdminDashboard(): Promise<AffiliateAdminDashboard> {
  const [accountsRaw, payoutsRaw, commissionsRaw, configRaw, reportsRaw] =
    await Promise.all([
      apiGet<unknown>(AFFILIATE_ADMIN_ENDPOINTS.accounts),
      apiGet<unknown>(AFFILIATE_ADMIN_ENDPOINTS.payoutRequests),
      apiGet<unknown>(AFFILIATE_ADMIN_ENDPOINTS.commissions),
      apiGet<unknown>(AFFILIATE_ADMIN_ENDPOINTS.config),
      apiGet<unknown>(AFFILIATE_ADMIN_ENDPOINTS.reports).catch(() => ({})),
    ]);

  return buildDashboard(
    accountsRaw,
    payoutsRaw,
    commissionsRaw,
    configRaw,
    reportsRaw
  );
}

export async function approveAffiliatePayout(
  payload: ApproveAffiliatePayoutPayload
): Promise<AffiliateAdminDashboard> {
  await apiPost(
    AFFILIATE_ADMIN_ENDPOINTS.approvePayoutRequest(payload.payoutId),
    { payaTrackingCode: payload.payaTrackingCode }
  );
  return fetchAffiliateAdminDashboard();
}

export async function rejectAffiliatePayout(
  payload: RejectAffiliatePayoutPayload
): Promise<AffiliateAdminDashboard> {
  await apiPost(
    AFFILIATE_ADMIN_ENDPOINTS.rejectPayoutRequest(payload.payoutId),
    { rejectionReason: payload.reason }
  );
  return fetchAffiliateAdminDashboard();
}

export async function toggleAffiliatePartnerStatus(
  payload: ToggleAffiliatePartnerPayload
): Promise<AffiliateAdminDashboard> {
  await apiPut(
    AFFILIATE_ADMIN_ENDPOINTS.updateAccountStatus(payload.partnerId),
    { status: payload.nextStatus }
  );
  return fetchAffiliateAdminDashboard();
}

export async function saveAffiliateProgramRules(
  rules: AffiliateProgramRules
): Promise<AffiliateAdminDashboard> {
  await apiPut(AFFILIATE_ADMIN_ENDPOINTS.config, {
    firstPurchasePercentage: rules.firstCommissionRate,
    transactionCap: rules.capAmount,
    renewalPercentage: rules.renewalCommissionRate,
    cookieDurationDays: rules.renewalSunsetDays,
    holdPeriodDays: rules.holdDays,
    minPayoutAmount: rules.minPayoutAmount,
  });

  return fetchAffiliateAdminDashboard();
}
