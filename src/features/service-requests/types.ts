import { z } from "zod";

// Service Request Status
export const ServiceRequestStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
]);

export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;

// User Schema
export const UserSchema = z.object({
  uuid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  registrationSource: z.string().nullable(),
  referralCode: z.string(),
  phoneNumber: z.string(),
  profile: z.unknown().nullable(),
});

export type User = z.infer<typeof UserSchema>;

// API Service Schema
export const ApiServiceSchema = z.object({
  uuid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  description: z.string(),
  endpoint: z.string(),
  slug: z.string(),
  templateName: z.string(),
  serviceCreditCosts: z.array(z.unknown()),
  metadata: z.record(z.string(), z.unknown()),
});

export type ApiService = z.infer<typeof ApiServiceSchema>;

// Service Request Schema (New API Structure)
export const ServiceRequestSchema = z.object({
  uuid: z.string(),
  createdAt: z.string(),
  parameters: z.record(z.string(), z.unknown()),
  status: ServiceRequestStatusSchema,
  responseData: z.record(z.string(), z.unknown()).nullable(),
  creditCost: z.number().int().min(0),
  paidWithGems: z.boolean(),
  gemsUsed: z.number().int().min(0),
  taskId: z.string(),
  userUuid: z.string(),
  apiServiceUuid: z.string(),
  user: UserSchema,
  apiService: ApiServiceSchema,
});

export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ServiceRequestsQueryParams {
  phoneNumber?: string;
  page?: number;
  take?: number;
  status?: ServiceRequestStatus | "all";
  dateFrom?: string;
  dateTo?: string;
}
