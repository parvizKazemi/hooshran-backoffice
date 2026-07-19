import type { Category, CategoryPayload } from "../types";

export function sortCategoriesByOrder(items: Category[]): Category[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function applyCategoryOrders(items: Category[]): Category[] {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

export function cloneCategories(items: Category[]): Category[] {
  return items.map((item) => ({ ...item }));
}

export function areCategoriesEqual(
  current: Category[],
  original: Category[]
): boolean {
  if (current.length !== original.length) return false;

  return current.every((item, index) => {
    const source = original[index];
    if (!source) return false;
    return (
      item.uuid === source.uuid &&
      item.name === source.name &&
      item.slug === source.slug &&
      item.order === source.order &&
      item.badge === source.badge &&
      Boolean(item.isLocal) === Boolean(source.isLocal)
    );
  });
}

export function toCategoryPayload(item: Category): CategoryPayload {
  return {
    ...(item.isLocal ? {} : { uuid: item.uuid }),
    name: item.name,
    slug: item.slug,
    order: item.order,
    badge: item.badge,
  };
}

export function toCategoryPayloadList(items: Category[]): CategoryPayload[] {
  return sortCategoriesByOrder(items).map(toCategoryPayload);
}

export function createLocalCategory(
  values: Omit<Category, "uuid" | "isLocal">
): Category {
  return {
    ...values,
    uuid: `local-${crypto.randomUUID()}`,
    isLocal: true,
  };
}

export function normalizeCategoriesResponse(
  response: Category[] | { data: Category[] }
): Category[] {
  const list = Array.isArray(response) ? response : response.data;
  return sortCategoriesByOrder(
    list.map((item) => ({
      ...item,
      isLocal: false,
    }))
  );
}
