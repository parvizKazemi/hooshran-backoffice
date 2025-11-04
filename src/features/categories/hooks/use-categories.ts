import { ApiError } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mockCategories } from "../mock-data";
import {
  CategoriesQueryParams,
  Category,
  CreateCategoryInput,
  PaginatedResponse,
  UpdateCategoryInput,
} from "../types";

export const useCategories = (params: CategoriesQueryParams = {}) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async (): Promise<PaginatedResponse<Category>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockCategories];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (cat) =>
              cat.name.toLowerCase().includes(query) ||
              cat.slug?.toLowerCase().includes(query) ||
              cat.description?.toLowerCase().includes(query)
          );
        }
        if (params.is_active !== undefined) {
          filtered = filtered.filter(
            (cat) => cat.is_active === params.is_active
          );
        }
        const page = params.page || 1;
        const take = params.take || 10;
        const start = (page - 1) * take;
        const end = start + take;
        return {
          data: filtered.slice(start, end),
          total: filtered.length,
          page,
          take,
          totalPages: Math.ceil(filtered.length / take),
        };
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryInput): Promise<Category> => {
      // TODO: Implement API call
      const newCategory: Category = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("دسته‌بندی با موفقیت ایجاد شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ایجاد دسته‌بندی");
      }
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCategoryInput): Promise<Category> => {
      // TODO: Implement API call
      const updatedCategory: Category = {
        ...data,
        updatedAt: new Date().toISOString(),
      } as Category;
      return updatedCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("دسته‌بندی با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی دسته‌بندی");
      }
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Implement API call
      void id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("دسته‌بندی با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف دسته‌بندی");
      }
    },
  });
};
