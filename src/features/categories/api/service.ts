import { apiGet, apiPatch, apiPost } from "@/services/api";
import { USE_MOCK_CATEGORIES } from "../constants";
import { listMockCategories, saveMockCategories } from "../mock-data";
import type { Category, CategoryPayload } from "../types";
import { normalizeCategoriesResponse } from "../utils/category.helpers";
import { CATEGORY_ENDPOINTS } from "./endpoints";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK_CATEGORIES) {
    await delay();
    return listMockCategories();
  }

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
  if (USE_MOCK_CATEGORIES) {
    await delay();
    return saveMockCategories(payload);
  }

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
