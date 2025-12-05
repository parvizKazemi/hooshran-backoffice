import { z } from "zod";

// API Service Parameter Types
export const ApiServiceParameterTypeSchema = z.enum([
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "FILE",
  "SELECT",
  "IMAGE",
  "VIDEO",
]);

export type ApiServiceParameterType = z.infer<
  typeof ApiServiceParameterTypeSchema
>;

// API Service Parameter Schema
export const ApiServiceParameterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "نام پارامتر الزامی است"),
  type: ApiServiceParameterTypeSchema,
  required: z.boolean().default(false),
  priority: z.number().int().min(0).default(0),
  default_value: z.string().optional(),
  options: z.array(z.string()).optional(), // For SELECT type
});

export type ApiServiceParameter = z.infer<typeof ApiServiceParameterSchema>;

// Service Credit Cost Schema
export const ServiceCreditCostSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional().nullable(),
  credit_cost: z.number().int().min(0, "هزینه اعتبار باید عدد مثبت باشد"),
});

export type ServiceCreditCost = z.infer<typeof ServiceCreditCostSchema>;

// API Service Schema
export const ApiServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "نام سرویس الزامی است"),
  description: z.string().optional(),
  endpoint: z.string().url("آدرس endpoint معتبر نیست").optional(),
  category_id: z.string().optional().nullable(),
  category_name: z.string().optional(),
  media_id: z.string().optional().nullable(),
  slug: z.string().optional(),
  english_name: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ApiService = z.infer<typeof ApiServiceSchema>;

// API Service with relationships
export const ApiServiceDetailSchema = ApiServiceSchema.extend({
  parameters: z.array(ApiServiceParameterSchema).optional(),
  credit_costs: z.array(ServiceCreditCostSchema).optional(),
});

export type ApiServiceDetail = z.infer<typeof ApiServiceDetailSchema>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface ApiServicesQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  category_id?: string;
  is_active?: boolean;
}

// Create/Update schemas
export const createApiServiceSchema = ApiServiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  category_name: true,
}).extend({
  parameters: z.array(ApiServiceParameterSchema).optional(),
  default_credit_cost: z.number().int().min(0).optional(),
});

export const updateApiServiceSchema = createApiServiceSchema
  .partial()
  .extend({ id: z.string().min(1) });

export type CreateApiServiceInput = z.infer<typeof createApiServiceSchema>;
export type UpdateApiServiceInput = z.infer<typeof updateApiServiceSchema>;

// Service Review Types
export const ServiceReviewMetadataSchema = z
  .object({
    result_url: z.string().url().optional(),
  })
  .passthrough(); // Allow additional fields

export const ServiceReviewSchema = z.object({
  uuid: z.string(),
  serviceRequestId: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
  reviewMetadata: ServiceReviewMetadataSchema.optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type ServiceReview = z.infer<typeof ServiceReviewSchema>;
export type ServiceReviewMetadata = z.infer<typeof ServiceReviewMetadataSchema>;

// Service Reviews Pagination Meta (matches API response)
export interface ServiceReviewsPaginationMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Service Reviews Paginated Response (matches API response structure)
export interface ServiceReviewsPaginatedResponse {
  data: ServiceReview[];
  meta: ServiceReviewsPaginationMeta;
}

// Service Reviews Query Params
export interface ServiceReviewsQueryParams {
  page?: number;
  take?: number;
  q?: string;
  order?: string;
}

// Update Service Review Input
export const updateServiceReviewSchema = z.object({
  uuid: z.string(), // Required for identification, but excluded from body
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
  reviewMetadata: ServiceReviewMetadataSchema.optional(),
});

export type UpdateServiceReviewInput = z.infer<
  typeof updateServiceReviewSchema
>;
