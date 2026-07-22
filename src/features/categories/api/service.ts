import { apiGet, apiPatch, apiPost } from "@/services/api";
import type { Category, CategoryPayload } from "../types";
import { normalizeCategoriesResponse } from "../utils/category.helpers";
import { CATEGORY_ENDPOINTS } from "./endpoints";

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiGet<Category[] | { data: Category[] }>(
    CATEGORY_ENDPOINTS.list
  );
  return normalizeCategoriesResponse(response);
}

/**
 * Persist full category list as an array.
 * - Empty previous state → POST
 * - Otherwise → PATCH
 */
export async function saveCategories(
  payload: CategoryPayload[],
  options?: { useCreate?: boolean }
): Promise<Category[]> {
  const useCreate = options?.useCreate ?? false;
  const response = useCreate
    ? await apiPost<Category[] | { data: Category[] }>(
        CATEGORY_ENDPOINTS.create,
        payload
      )
    : await apiPatch<Category[] | { data: Category[] }>(
        CATEGORY_ENDPOINTS.save,
        payload
      );

  return normalizeCategoriesResponse(response);
}
