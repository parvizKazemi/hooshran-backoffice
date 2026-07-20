import { useMemo } from "react";
import { useCategories } from "./use-categories";
import type { Category } from "../types";

export type CategoryOption = {
  uuid: string;
  name: string;
  slug: string;
  order: number;
  badge: Category["badge"];
};

/**
 * Shared category options for selects/filters across admin features.
 */
export function useCategoryOptions() {
  const query = useCategories();

  const options = useMemo<CategoryOption[]>(
    () =>
      (query.data ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          uuid: item.uuid,
          name: item.name,
          slug: item.slug,
          order: item.order,
          badge: item.badge,
        })),
    [query.data]
  );

  return {
    ...query,
    options,
    isLoading: query.isLoading,
  };
}
