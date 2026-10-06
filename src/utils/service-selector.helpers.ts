export type SelectableService = {
  uuid: string;
  name: string;
  slug: string;
};

export const filterServicesByQuery = <T extends SelectableService>(
  services: T[],
  query: string
): T[] => {
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

export const sortServicesWithSelectedFirst = <T extends SelectableService>(
  services: T[],
  selectedUuids: string[]
): T[] => {
  if (selectedUuids.length === 0) {
    return services;
  }

  const selectedSet = new Set(selectedUuids);
  const selected = selectedUuids
    .map((uuid) => services.find((service) => service.uuid === uuid))
    .filter((service): service is T => Boolean(service));
  const unselected = services.filter(
    (service) => !selectedSet.has(service.uuid)
  );

  return [...selected, ...unselected];
};
