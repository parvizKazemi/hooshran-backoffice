import {
  CAMPAIGN_TIER_KEYS,
  DEFAULT_END_TIME,
  INDEFINITE_CAMPAIGN_END_ISO,
} from "../constants";
import type {
  CampaignAllocationMode,
  CampaignFormState,
  CampaignServiceDiscount,
  CreateCampaignDiscountItem,
  CreateCampaignInput,
  IndividualDiscountRow,
  PlanCampaign,
  TierDiscountState,
} from "../types";

export const createEmptyTierDiscountState = (): TierDiscountState =>
  CAMPAIGN_TIER_KEYS.reduce(
    (acc, tier) => ({
      ...acc,
      [tier]: { enabled: false, percentage: 0 },
    }),
    {} as TierDiscountState
  );

export function normalizeTime24(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) {
    return trimmed;
  }

  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2] ?? 0)));

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export const createInitialCampaignForm = (): CampaignFormState => ({
  name: "",
  title: "",
  description: "",
  bannerTeaser: "",
  ctaText: "مشاهده ابزارها",
  ctaLink: "",
  expirationType: "subscription_bound",
  hasCampaignEnd: true,
  endDate: "",
  endTime: DEFAULT_END_TIME,
  isActive: true,
  showAsBanner: true,
  showOnPlanPage: true,
  showOnPlanCard: true,
  priority: 0,
  allocationMode: "group",
  groupServiceUuids: [],
  groupTiers: createEmptyTierDiscountState(),
  individualRows: [],
});

export const createIndividualDiscountRow = (): IndividualDiscountRow => ({
  id: crypto.randomUUID(),
  serviceUuid: "",
  tiers: createEmptyTierDiscountState(),
});

function isoToDateInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToTimeInput(value: string): string {
  if (!value) return DEFAULT_END_TIME;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DEFAULT_END_TIME;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function tierMapFromDiscounts(
  discounts: CampaignServiceDiscount[]
): TierDiscountState {
  const tiers = createEmptyTierDiscountState();

  for (const discount of discounts) {
    if (!discount.tier) continue;
    tiers[discount.tier] = {
      enabled: true,
      percentage: discount.discountPercentage,
    };
  }

  return tiers;
}

function serializeTierMap(tiers: TierDiscountState): string {
  return CAMPAIGN_TIER_KEYS.map((tier) =>
    tiers[tier].enabled ? `${tier}:${tiers[tier].percentage}` : ""
  ).join("|");
}

function getDiscountServiceUuid(
  discount: CampaignServiceDiscount
): string | undefined {
  const uuid = discount.serviceUuid ?? discount.apiServiceUuid;
  return uuid?.trim() || undefined;
}

export function detectAllocationMode(
  discounts: CampaignServiceDiscount[] = []
): CampaignAllocationMode {
  if (discounts.length === 0) return "group";

  const byService = new Map<string, CampaignServiceDiscount[]>();
  for (const discount of discounts) {
    const key =
      getDiscountServiceUuid(discount) ??
      (discount.apiServiceId != null ? `id:${discount.apiServiceId}` : "");
    if (!key) continue;
    const list = byService.get(key) ?? [];
    list.push(discount);
    byService.set(key, list);
  }

  if (byService.size <= 1) {
    return "individual";
  }

  const tierMaps = Array.from(byService.values()).map((items) =>
    serializeTierMap(tierMapFromDiscounts(items))
  );
  const [firstMap] = tierMaps;
  return tierMaps.every((map) => map === firstMap) ? "group" : "individual";
}

export function campaignToFormState(campaign: PlanCampaign): CampaignFormState {
  const discounts = campaign.serviceDiscounts ?? [];
  const allocationMode = detectAllocationMode(discounts);
  const hasIndefiniteEnd =
    campaign.endsAt.startsWith("2099-") ||
    new Date(campaign.endsAt).getFullYear() >= 2099;

  const base: CampaignFormState = {
    name: campaign.name,
    title: campaign.title,
    description: campaign.description ?? "",
    bannerTeaser: campaign.bannerTeaser,
    ctaText: campaign.ctaText || "مشاهده ابزارها",
    ctaLink: campaign.ctaLink ?? "",
    expirationType: campaign.expirationType,
    hasCampaignEnd: !hasIndefiniteEnd,
    endDate: isoToDateInput(campaign.endsAt),
    endTime: isoToTimeInput(campaign.endsAt),
    isActive: campaign.isActive,
    showAsBanner: campaign.showAsBanner,
    showOnPlanPage: campaign.showOnPlanPage,
    showOnPlanCard: campaign.showOnPlanCard,
    priority: campaign.priority,
    allocationMode,
    groupServiceUuids: [],
    groupTiers: createEmptyTierDiscountState(),
    individualRows: [],
  };

  if (allocationMode === "group") {
    base.groupServiceUuids = [
      ...new Set(
        discounts
          .map(getDiscountServiceUuid)
          .filter((uuid): uuid is string => Boolean(uuid))
      ),
    ];
    base.groupTiers = tierMapFromDiscounts(discounts);
    return base;
  }

  const rowsByService = new Map<string, CampaignServiceDiscount[]>();
  for (const discount of discounts) {
    const key =
      getDiscountServiceUuid(discount) ??
      (discount.apiServiceId != null ? `id:${discount.apiServiceId}` : "");
    if (!key || key.startsWith("id:")) continue;
    const list = rowsByService.get(key) ?? [];
    list.push(discount);
    rowsByService.set(key, list);
  }

  base.individualRows = Array.from(rowsByService.entries()).map(
    ([serviceUuid, items]) => ({
      id: crypto.randomUUID(),
      serviceUuid,
      tiers: tierMapFromDiscounts(items),
    })
  );

  return base;
}

function buildEndsAtIso(form: CampaignFormState): string {
  if (!form.hasCampaignEnd) {
    return INDEFINITE_CAMPAIGN_END_ISO;
  }
  if (!form.endDate) {
    return INDEFINITE_CAMPAIGN_END_ISO;
  }
  const [hours, minutes] = form.endTime.split(":").map(Number);
  const date = new Date(`${form.endDate}T00:00:00`);
  date.setHours(hours || 23, minutes || 59, 59, 999);
  return date.toISOString();
}

function buildTierDiscountItems(
  serviceUuid: string,
  tiers: TierDiscountState
): CreateCampaignDiscountItem[] {
  return CAMPAIGN_TIER_KEYS.flatMap((tier) => {
    const state = tiers[tier];
    if (!state.enabled || state.percentage <= 0) {
      return [];
    }
    return [
      {
        serviceUuid,
        tier,
        discountPercentage: Math.min(100, Math.max(1, Math.round(state.percentage))),
      },
    ];
  });
}

export function buildDiscountPayload(
  form: CampaignFormState
): CreateCampaignDiscountItem[] {
  if (form.allocationMode === "group") {
    return form.groupServiceUuids.flatMap((uuid) => {
      if (!uuid) return [];
      return buildTierDiscountItems(uuid, form.groupTiers);
    });
  }

  return form.individualRows.flatMap((row) => {
    if (!row.serviceUuid) return [];
    return buildTierDiscountItems(row.serviceUuid, row.tiers);
  });
}

export function buildCampaignPayload(
  form: CampaignFormState,
  existingStartsAt?: string
): CreateCampaignInput {
  const trimmedTitle = form.title.trim();
  const trimmedName = form.name.trim() || trimmedTitle;

  return {
    name: trimmedName,
    title: trimmedTitle,
    description: form.description.trim() || undefined,
    bannerTeaser: form.bannerTeaser.trim(),
    ctaText: form.ctaText.trim() || "مشاهده ابزارها",
    ctaLink: form.ctaLink.trim() || undefined,
    expirationType: form.expirationType,
    startsAt: existingStartsAt ?? new Date().toISOString(),
    endsAt: buildEndsAtIso(form),
    isActive: form.isActive,
    showAsBanner: form.showAsBanner,
    showOnPlanPage: form.showOnPlanPage,
    showOnPlanCard: form.showOnPlanCard,
    priority: form.priority,
    discounts: buildDiscountPayload(form),
  };
}

export function validateCampaignForm(form: CampaignFormState): string | null {
  if (!form.title.trim()) {
    return "titleRequired";
  }
  if (!form.bannerTeaser.trim()) {
    return "bannerTeaserRequired";
  }
  if (form.hasCampaignEnd && !form.endDate) {
    return "endDateRequired";
  }

  const hasTierSelection = (tiers: TierDiscountState) =>
    CAMPAIGN_TIER_KEYS.some(
      (tier) => tiers[tier].enabled && tiers[tier].percentage > 0
    );

  if (form.allocationMode === "group") {
    if (form.groupServiceUuids.length === 0) {
      return "servicesRequired";
    }
    if (!hasTierSelection(form.groupTiers)) {
      return "tierRequired";
    }
    return null;
  }

  if (form.individualRows.length === 0) {
    return "individualRowsRequired";
  }

  for (const row of form.individualRows) {
    if (!row.serviceUuid) {
      return "rowServiceRequired";
    }
    if (!hasTierSelection(row.tiers)) {
      return "rowTierRequired";
    }
  }

  return null;
}

export function toCampaignEndDateLabel(endsAt: string): {
  label: string;
  isExpired: boolean;
  isIndefinite: boolean;
} {
  if (!endsAt || endsAt.startsWith("2099-")) {
    return { label: "بدون پایان", isExpired: false, isIndefinite: true };
  }

  const endDate = new Date(endsAt);
  if (Number.isNaN(endDate.getTime())) {
    return { label: "—", isExpired: false, isIndefinite: false };
  }

  const isExpired = endDate.getTime() < Date.now();
  return {
    label: endDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    isExpired,
    isIndefinite: false,
  };
}
