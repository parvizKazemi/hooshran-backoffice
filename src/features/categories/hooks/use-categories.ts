import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  reorderCategories,
  updateCategory,
} from "../api/service";
import { CATEGORY_QUERY_KEY } from "../constants";
import type {
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "../types";

export function useCategories() {
  const { t } = useTranslation("common");

  return useQuery({
    queryKey: CATEGORY_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchCategories();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error(t("categories.toasts.loadFailed"));
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      toast.success(t("categories.toasts.created"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("categories.toasts.createFailed")
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdateCategoryInput) => updateCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      toast.success(t("categories.toasts.updated"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("categories.toasts.updateFailed")
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      toast.success(t("categories.toasts.deleted"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("categories.toasts.deleteFailed")
      );
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ReorderCategoriesInput) => reorderCategories(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CATEGORY_QUERY_KEY, data);
      toast.success(t("categories.toasts.reordered"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("categories.toasts.reorderFailed")
      );
    },
  });
}
