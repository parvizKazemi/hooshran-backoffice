import { z } from "zod";

// Service Request Status
export const ServiceRequestStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
]);

export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;

// Service Request Schema
export const ServiceRequestSchema = z.object({
  id: z.string().min(1),
  user_id: z.string(),
  user_phone: z.string().optional(),
  user_name: z.string().optional(),
  api_service_id: z.string(),
  api_service_name: z.string().optional(),
  input_params: z.record(z.unknown()).optional(),
  output: z.record(z.unknown()).optional().nullable(),
  error: z.string().optional().nullable(),
  status: ServiceRequestStatusSchema,
  credit_cost: z.number().int().min(0).optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  error_message: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface ServiceRequestsQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  user_id?: string;
  api_service_id?: string;
  status?: ServiceRequestStatus | "all";
  start_date?: string;
  end_date?: string;
}
