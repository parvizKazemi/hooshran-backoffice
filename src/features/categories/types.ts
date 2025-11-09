import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  slug: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface CategoriesQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  is_active?: boolean;
}

export const createCategorySchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({ id: z.string().min(1) });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
