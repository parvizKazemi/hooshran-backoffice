import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { PLATFORM_SERVICES_LIMIT } from "../constants";
import { PLAN_CAMPAIGN_ENDPOINTS } from "./endpoints";
import type {
  CampaignPlatformService,
  CampaignsQueryParams,
  CreateCampaignInput,
  PaginatedCampaignsResponse,
  PlanCampaign,
  UpdateCampaignInput,
} from "../types";

const buildListQuery = (params: CampaignsQueryParams = {}): string => {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.isActive === true || params.isActive === false) {
    searchParams.set("isActive", String(params.isActive));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export async function fetchCampaigns(
  params: CampaignsQueryParams = {}
): Promise<PaginatedCampaignsResponse> {
  return apiGet<PaginatedCampaignsResponse>(
    `${PLAN_CAMPAIGN_ENDPOINTS.list}${buildListQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      isActive: params.isActive,
    })}`
  );
}

export async function fetchCampaign(uuid: string): Promise<PlanCampaign> {
  return apiGet<PlanCampaign>(PLAN_CAMPAIGN_ENDPOINTS.detail(uuid));
}

export async function createCampaign(
  payload: CreateCampaignInput
): Promise<PlanCampaign> {
  return apiPost<PlanCampaign>(PLAN_CAMPAIGN_ENDPOINTS.list, payload);
}

export async function updateCampaign(
  uuid: string,
  payload: UpdateCampaignInput
): Promise<PlanCampaign> {
  return apiPut<PlanCampaign>(PLAN_CAMPAIGN_ENDPOINTS.detail(uuid), payload);
}

export async function deleteCampaign(uuid: string): Promise<boolean> {
  return apiDelete<boolean>(PLAN_CAMPAIGN_ENDPOINTS.detail(uuid));
}

type AdminPlatformServicesResponse = {
  services?: Array<{
    uuid: string;
    name: string;
    slug?: string;
    isActive?: boolean;
  }>;
};

export async function fetchCampaignPlatformServices(): Promise<{
  services: CampaignPlatformService[];
}> {
  const servicesResponse = await apiGet<
    AdminPlatformServicesResponse | AdminPlatformServicesResponse["services"]
  >(
    `${PLAN_CAMPAIGN_ENDPOINTS.platformServices}?type=all&limit=${PLATFORM_SERVICES_LIMIT}`
  );

  const rawList = Array.isArray(servicesResponse)
    ? servicesResponse
    : (servicesResponse?.services ?? []);

  const services = rawList
    .filter((service) => Boolean(service?.uuid && service?.name))
    .map((service) => ({
      uuid: service.uuid,
      name: service.name,
      slug: service.slug ?? "",
      isActive: service.isActive ?? true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));

  return { services };
}
