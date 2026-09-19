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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function extractRawServices(response: unknown): Record<string, unknown>[] {
  const list = Array.isArray(response)
    ? response
    : response && typeof response === "object"
      ? ((response as { data?: unknown[]; services?: unknown[] }).data ??
        (response as { services?: unknown[] }).services ??
        [])
      : [];
  return list.map((item) => asRecord(item) ?? {});
}

function readNumericId(record: Record<string, unknown>): number | undefined {
  const candidates = [record.id, record.serviceId, record.apiServiceId];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }
  }
  return undefined;
}

export function buildServiceIdMapFromCampaigns(
  campaigns: PlanCampaign[]
): Map<string, number> {
  const map = new Map<string, number>();

  for (const campaign of campaigns) {
    for (const discount of campaign.serviceDiscounts ?? []) {
      if (discount.apiServiceUuid && discount.apiServiceId) {
        map.set(discount.apiServiceUuid, discount.apiServiceId);
      }
    }
  }

  return map;
}

async function fetchServiceIdMapFromBatch(): Promise<Map<string, number>> {
  const map = new Map<string, number>();

  try {
    const response = await apiGet<unknown>(
      PLAN_CAMPAIGN_ENDPOINTS.manageServicesBatch
    );
    for (const item of extractRawServices(response)) {
      const uuid = typeof item.uuid === "string" ? item.uuid : "";
      const id = readNumericId(item);
      if (uuid && id) {
        map.set(uuid, id);
      }
    }
  } catch {
    // Optional enrichment — campaigns list remains primary source.
  }

  return map;
}

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
  serviceIdByUuid: Map<string, number>;
}> {
  const [servicesResponse, campaignsResponse, batchIdMap] = await Promise.all([
    apiGet<AdminPlatformServicesResponse | AdminPlatformServicesResponse["services"]>(
      `${PLAN_CAMPAIGN_ENDPOINTS.platformServices}?type=all&limit=${PLATFORM_SERVICES_LIMIT}`
    ),
    fetchCampaigns({ page: 1, limit: 500 }),
    fetchServiceIdMapFromBatch(),
  ]);

  const rawList = Array.isArray(servicesResponse)
    ? servicesResponse
    : (servicesResponse?.services ?? []);

  const serviceIdByUuid = buildServiceIdMapFromCampaigns(campaignsResponse.data);
  for (const [uuid, id] of batchIdMap) {
    if (!serviceIdByUuid.has(uuid)) {
      serviceIdByUuid.set(uuid, id);
    }
  }

  const services = rawList
    .filter((service) => Boolean(service?.uuid && service?.name))
    .map((service) => ({
      uuid: service.uuid,
      name: service.name,
      slug: service.slug ?? "",
      isActive: service.isActive ?? true,
      id: serviceIdByUuid.get(service.uuid),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));

  return { services, serviceIdByUuid };
}
