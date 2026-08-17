import { AFFILIATE_ADMIN_INITIAL_DASHBOARD } from "../mock-data";
import type {
  AffiliateAdminDashboard,
  AffiliateProgramRules,
  ApproveAffiliatePayoutPayload,
  RejectAffiliatePayoutPayload,
  ToggleAffiliatePartnerPayload,
} from "../types";
import { deriveAffiliateStats } from "../utils/affiliate.helpers";

/**
 * In-memory mock store — replace with baseAPI calls when backend is ready.
 */
const mockStore: AffiliateAdminDashboard = structuredClone(
  AFFILIATE_ADMIN_INITIAL_DASHBOARD
);

function withDerivedStats(
  data: AffiliateAdminDashboard
): AffiliateAdminDashboard {
  return {
    ...data,
    stats: deriveAffiliateStats(data.payouts, data.stats),
  };
}

export async function fetchAffiliateAdminDashboard(): Promise<AffiliateAdminDashboard> {
  // return mapAffiliateAdminDashboard(
  //   await apiGet(AFFILIATE_ADMIN_ENDPOINTS.dashboard),
  //   AFFILIATE_ADMIN_INITIAL_DASHBOARD,
  // );
  return withDerivedStats(structuredClone(mockStore));
}

export async function approveAffiliatePayout(
  payload: ApproveAffiliatePayoutPayload
): Promise<AffiliateAdminDashboard> {
  // await apiPost(AFFILIATE_ADMIN_ENDPOINTS.approvePayout(payload.payoutId), { payaTrackingCode: payload.payaTrackingCode });
  const payout = mockStore.payouts.find((item) => item.id === payload.payoutId);
  if (payout) {
    payout.status = "paid";
    payout.payaCode = payload.payaTrackingCode;
    mockStore.stats.totalPaidCommissions += payout.amount;
  }
  return withDerivedStats(structuredClone(mockStore));
}

export async function rejectAffiliatePayout(
  payload: RejectAffiliatePayoutPayload
): Promise<AffiliateAdminDashboard> {
  // await apiPost(AFFILIATE_ADMIN_ENDPOINTS.rejectPayout(payload.payoutId), { reason: payload.reason });
  void payload.reason;
  const payout = mockStore.payouts.find((item) => item.id === payload.payoutId);
  if (payout) {
    payout.status = "rejected";
  }
  return withDerivedStats(structuredClone(mockStore));
}

export async function toggleAffiliatePartnerStatus(
  payload: ToggleAffiliatePartnerPayload
): Promise<AffiliateAdminDashboard> {
  // await apiPost(AFFILIATE_ADMIN_ENDPOINTS.togglePartner(payload.partnerId));
  const partner = mockStore.partners.find(
    (item) => item.id === payload.partnerId
  );
  if (partner) {
    partner.status = partner.status === "active" ? "suspended" : "active";
  }
  return withDerivedStats(structuredClone(mockStore));
}

export async function saveAffiliateProgramRules(
  rules: AffiliateProgramRules
): Promise<AffiliateAdminDashboard> {
  // await apiPut(AFFILIATE_ADMIN_ENDPOINTS.rules, rules);
  mockStore.rules = { ...rules };
  return withDerivedStats(structuredClone(mockStore));
}
