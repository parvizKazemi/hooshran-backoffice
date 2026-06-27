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
