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
    templateName?: string | null;
    cost?: unknown;
    endpoint?: string;
    description?: string;
    metadata?: {
      cost?: unknown;
      ui?: { image?: string; description?: string; cost_hint?: string };
    };
    information?: { image?: string; description?: string };
    media?: { url?: string };
  }>;
};

type ServiceHintResponse =
  | ServiceHintConfig
  | { sections: ServiceHintConfig }
  | { serviceGuide: { sections: ServiceHintConfig } };

const parseSections = (
  response: ServiceHintResponse | null | undefined
): ServiceHintConfig => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if ("serviceGuide" in response) {
    return response.serviceGuide?.sections ?? [];
  }

  return response.sections ?? [];
};

export async function getPlatformServices(): Promise<PlatformService[]> {
  const response = await apiGet<
    | PlatformServicesResponse
    | { services?: PlatformServicesResponse["services"] }
  >(
    `${SERVICE_HINT_ENDPOINTS.platformServices}?limit=${PLATFORM_SERVICES_LIMIT}&type=all`
  );

  const list = Array.isArray(response) ? response : (response.services ?? []);

  return list
    .filter((service) => Boolean(service?.uuid && service?.name))
    .map((service) => ({
      uuid: service.uuid,
      name: service.name,
      slug: service.slug ?? "",
      isActive: service.isActive ?? true,
      templateName: service.templateName ?? null,
      cost: service.cost ?? service.metadata?.cost,
      endpoint: service.endpoint,
      description:
        service.information?.description ||
        service.metadata?.ui?.description ||
        service.description ||
        "",
      imageUrl:
        service.information?.image ||
        service.metadata?.ui?.image ||
        service.media?.url ||
        "",
    }));
}

export async function getServiceHintConfig(
  serviceUuid: string
): Promise<ServiceHintConfig> {
  try {
    const response = await apiGet<ServiceHintResponse>(
      SERVICE_HINT_ENDPOINTS.serviceGuide(serviceUuid)
    );

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
  const response = await apiPut<ServiceHintResponse>(
    SERVICE_HINT_ENDPOINTS.serviceGuide(serviceUuid),
    { sections }
  );

  return parseSections(response);
}
