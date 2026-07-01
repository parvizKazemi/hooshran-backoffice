import type { PlatformService } from "../types";

export const filterServicesByQuery = (
  services: PlatformService[],
  query: string
): PlatformService[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return services;
  }

  return services.filter(
    (service) =>
      service.name.toLowerCase().includes(normalizedQuery) ||
      service.slug.toLowerCase().includes(normalizedQuery)
  );
};

export const sortServicesWithSelectedFirst = (
  services: PlatformService[],
  selectedUuids: string[]
): PlatformService[] => {
  if (selectedUuids.length === 0) {
    return services;
  }

  const selectedSet = new Set(selectedUuids);
  const selected = selectedUuids
    .map((uuid) => services.find((service) => service.uuid === uuid))
    .filter((service): service is PlatformService => Boolean(service));
  const unselected = services.filter(
    (service) => !selectedSet.has(service.uuid)
  );

  return [...selected, ...unselected];
};
