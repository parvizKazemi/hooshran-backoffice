import type {
  CampaignExpirationType,
  CampaignTierKey,
  ServiceVisibility,
} from "./constants";

export type { ServiceVisibility } from "./constants";

export type { CampaignExpirationType, CampaignTierKey } from "./constants";

export type CampaignPlatformService = {
  uuid: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type CampaignServiceDiscount = {
  apiServiceId?: number;
  /** Backend DTO field */
  serviceUuid?: string;
  /** Legacy / alias */
  apiServiceUuid?: string;
  serviceName?: string;
  packageId?: number | null;
  packageUuid?: string | null;
  packageName?: string | null;
  modelName?: string | null;
  tier?: CampaignTierKey | null;
  discountPercentage: number;
  /** Where this service is shown. Empty when removed from the display table. */
  visibility?: ServiceVisibility[];
  /** Display order. Null when the service is removed from the display table. */
  priority?: number | null;
};

export type PlanCampaign = {
  uuid: string;
  name: string;
  title: string;
  description?: string;
  bannerTeaser: string;
  ctaText: string;
  ctaLink?: string;
  expirationType: CampaignExpirationType;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  showAsBanner: boolean;
  showOnPlanPage: boolean;
  showOnPlanCard: boolean;
  priority: number;
  serviceDiscounts?: CampaignServiceDiscount[];
  createdAt?: string;
  updatedAt?: string;
};

export type CampaignsQueryParams = {
  page?: number;
  limit?: number;
  isActive?: boolean;
};

export type PaginatedCampaignsResponse = {
  data: PlanCampaign[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

export type CreateCampaignDiscountItem = {
  serviceUuid: string;
  apiServiceId?: number;
  packageId?: number;
  packageUuid?: string;
  modelName?: string;
  tier?: CampaignTierKey;
  discountPercentage: number;
  serviceName?: string;
  visibility?: ServiceVisibility[];
  priority?: number | null;
};

export type CreateCampaignInput = {
  name: string;
  title: string;
  description?: string;
  bannerTeaser: string;
  ctaText?: string;
  ctaLink?: string;
  expirationType: CampaignExpirationType;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  showAsBanner?: boolean;
  showOnPlanPage?: boolean;
  showOnPlanCard?: boolean;
  priority?: number;
  discounts?: CreateCampaignDiscountItem[];
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export type CampaignAllocationMode = "group" | "individual";

export type TierDiscountState = Record<
  CampaignTierKey,
  { enabled: boolean; percentage: number }
>;

export type IndividualDiscountRow = {
  id: string;
  serviceUuid: string;
  tiers: TierDiscountState;
};

/** Appearance only. Removing a row does not change the discount service selection. */
export type ServiceDisplayConfig = {
  serviceUuid: string;
  displayName: string;
  priority: number | null;
  showOnPlanCard: boolean;
  showOnPlanComparison: boolean;
  showInBanner: boolean;
  removedFromDisplay: boolean;
};

export type CampaignFormState = {
  name: string;
  title: string;
  description: string;
  bannerTeaser: string;
  ctaText: string;
  ctaLink: string;
  expirationType: CampaignExpirationType;
  hasCampaignEnd: boolean;
  endDate: string;
  endTime: string;
  isActive: boolean;
  showAsBanner: boolean;
  showOnPlanPage: boolean;
  showOnPlanCard: boolean;
  priority: number;
  allocationMode: CampaignAllocationMode;
  groupServiceUuids: string[];
  groupTiers: TierDiscountState;
  individualRows: IndividualDiscountRow[];
  displayServices: ServiceDisplayConfig[];
};
