import { z } from "zod";

export const PlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().min(0),
  duration_days: z.number().int().min(1),
  max_usage: z.number().int().min(0).optional().nullable(),
  discount: z.number().int().min(0).max(100).optional().nullable(),
  is_active: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Plan = z.infer<typeof PlanSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface PlansQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  is_active?: boolean;
}

export const createPlanSchema = PlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePlanSchema = createPlanSchema
  .partial()
  .required({ id: true });

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
