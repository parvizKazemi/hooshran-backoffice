import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { fetchCategories, saveCategories } from "../api/service";
import { CATEGORY_QUERY_KEY } from "../constants";
import type { CategoryPayload } from "../types";

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

type SaveCategoriesInput = {
  payload: CategoryPayload[];
  useCreate?: boolean;
};

export function useSaveCategories() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({ payload, useCreate }: SaveCategoriesInput) =>
      saveCategories(payload, { useCreate }),
    onSuccess: (data) => {
      queryClient.setQueryData(CATEGORY_QUERY_KEY, data);
      toast.success(t("categories.toasts.saved"));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("categories.toasts.saveFailed")
      );
    },
  });
}
