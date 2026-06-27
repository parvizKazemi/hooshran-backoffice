import { apiGet, apiPatch } from "@/services/api";
import { PLATFORM_SERVICES_LIMIT } from "../constants";
import type {
  PlatformService,
  UpdateUtmContentRewardRulesInput,
  UtmContentRewardRule,
} from "../types";
import { WELCOME_PACKAGES_ENDPOINTS } from "./endpoints";

type PlatformServicesResponse = {
  services: Array<{
    uuid: string;
    name: string;
    slug: string;
    isActive?: boolean;
  }>;
};

export async function getUtmContentRewardRules(): Promise<
  UtmContentRewardRule[]
> {
  return apiGet<UtmContentRewardRule[]>(
    WELCOME_PACKAGES_ENDPOINTS.utmContentRewardRules
  );
}

export async function updateUtmContentRewardRules(
  payload: UpdateUtmContentRewardRulesInput
): Promise<UtmContentRewardRule[]> {
  return apiPatch<UtmContentRewardRule[]>(
    WELCOME_PACKAGES_ENDPOINTS.utmContentRewardRules,
    payload
  );
}

export async function updatePresentTokenEnabled(
  isEnabled: boolean
): Promise<{ isEnabled: boolean }> {
  return apiPatch<{ isEnabled: boolean }>(
    WELCOME_PACKAGES_ENDPOINTS.presentTokenConfig,
    { isEnabled }
  );
}

export async function getPlatformServices(): Promise<PlatformService[]> {
  const response = await apiGet<PlatformServicesResponse>(
    `${WELCOME_PACKAGES_ENDPOINTS.platformServices}?limit=${PLATFORM_SERVICES_LIMIT}&type=all`
  );

  return (response.services ?? [])
    .filter((service) => service.uuid && service.name)
    .map((service) => ({
      uuid: service.uuid,
      name: service.name,
      slug: service.slug,
      isActive: service.isActive ?? true,
    }));
}
