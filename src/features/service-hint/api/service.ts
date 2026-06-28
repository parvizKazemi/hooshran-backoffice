import { ApiError, apiGet, apiPut } from "@/services/api";
import { PLATFORM_SERVICES_LIMIT } from "../constants";
import type { PlatformService, ServiceHintConfig } from "../types";
import { SERVICE_HINT_ENDPOINTS } from "./endpoints";

type PlatformServicesResponse = {
  services: Array<{
    uuid: string;
    name: string;
    slug: string;
    isActive?: boolean;
  }>;
};

const parseSections = (
  response:
    | ServiceHintConfig
    | { sections: ServiceHintConfig }
    | null
    | undefined
): ServiceHintConfig => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  return response.sections ?? [];
};

export async function getPlatformServices(): Promise<PlatformService[]> {
  const response = await apiGet<PlatformServicesResponse>(
    `${SERVICE_HINT_ENDPOINTS.platformServices}?limit=${PLATFORM_SERVICES_LIMIT}&type=all`
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

export async function getServiceHintConfig(
  serviceUuid: string
): Promise<ServiceHintConfig> {
  try {
    const response = await apiGet<
      ServiceHintConfig | { sections: ServiceHintConfig }
    >(SERVICE_HINT_ENDPOINTS.serviceGuide(serviceUuid));

    return parseSections(response);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return [];
    }
    throw error;
  }
}

export async function updateServiceHintConfig(
  serviceUuid: string,
  sections: ServiceHintConfig
): Promise<ServiceHintConfig> {
  const response = await apiPut<
    ServiceHintConfig | { sections: ServiceHintConfig }
  >(SERVICE_HINT_ENDPOINTS.serviceGuide(serviceUuid), { sections });

  return parseSections(response);
}
