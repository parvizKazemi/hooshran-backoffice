import type {
  CampaignExpirationType,
  CampaignTierKey,
} from "./constants";

export type { CampaignExpirationType, CampaignTierKey } from "./constants";

export type CampaignPlatformService = {
  uuid: string;
  name: string;
  slug: string;
  isActive: boolean;
  id?: number;
};

export type CampaignServiceDiscount = {
  apiServiceId: number;
  apiServiceUuid?: string;
  serviceName?: string;
  packageId?: number | null;
  packageUuid?: string | null;
  packageName?: string | null;
  modelName?: string | null;
  tier?: CampaignTierKey | null;
  discountPercentage: number;
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
  apiServiceId: number;
  packageId?: number;
  packageUuid?: string;
  modelName?: string;
  tier?: CampaignTierKey;
  discountPercentage: number;
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
};
