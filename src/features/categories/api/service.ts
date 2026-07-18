import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/services/api";
import { USE_MOCK_CATEGORIES } from "../constants";
import {
  createMockCategory,
  deleteMockCategory,
  listMockCategories,
  reorderMockCategories,
  updateMockCategory,
} from "../mock-data";
import type {
  Category,
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "../types";
import { CATEGORY_ENDPOINTS } from "./endpoints";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function sortByOrder(items: Category[]): Category[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK_CATEGORIES) {
    await delay();
    return listMockCategories();
  }

  const response = await apiGet<Category[] | { data: Category[] }>(
    CATEGORY_ENDPOINTS.list
  );
  const list = Array.isArray(response) ? response : response.data;
  return sortByOrder(list);
}

export async function createCategory(
  payload: CreateCategoryInput
): Promise<Category> {
  if (USE_MOCK_CATEGORIES) {
    await delay();
    return createMockCategory(payload);
  }
  return apiPost<Category>(CATEGORY_ENDPOINTS.create, payload);
}

export async function updateCategory(
  payload: UpdateCategoryInput
): Promise<Category> {
  if (USE_MOCK_CATEGORIES) {
    await delay();
    return updateMockCategory(payload);
  }
  const { id, ...body } = payload;
  return apiPut<Category>(CATEGORY_ENDPOINTS.update(id), body);
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK_CATEGORIES) {
    await delay();
    deleteMockCategory(id);
    return;
  }
  await apiDelete(CATEGORY_ENDPOINTS.remove(id));
}

export async function reorderCategories(
  payload: ReorderCategoriesInput
): Promise<Category[]> {
  if (USE_MOCK_CATEGORIES) {
    await delay();
    return reorderMockCategories(payload);
  }
  const response = await apiPatch<Category[] | { data: Category[] }>(
    CATEGORY_ENDPOINTS.reorder,
    payload
  );
  const list = Array.isArray(response) ? response : response.data;
  return sortByOrder(list);
}
