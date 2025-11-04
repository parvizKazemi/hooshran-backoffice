import { z } from "zod";

// Credit Source Types
export const CreditSourceSchema = z.enum([
  "PURCHASE",
  "GIFT",
  "REFERRAL",
  "SYSTEM",
  "ADMIN",
]);

export type CreditSource = z.infer<typeof CreditSourceSchema>;

// Credit Log Type
export const CreditLogTypeSchema = z.enum([
  "INCREASE",
  "DECREASE",
  "SUBSCRIPTION",
]);

export type CreditLogType = z.infer<typeof CreditLogTypeSchema>;

// User Credit Schema
export const UserCreditSchema = z.object({
  id: z.string().min(1),
  user_id: z.string(),
  user_name: z.string().optional(),
  user_phone: z.string().optional(),
  credit_amount: z.number().int().min(0),
  source: CreditSourceSchema,
  expires_at: z.string().optional().nullable(),
  paid_amount: z.number().int().min(0).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type UserCredit = z.infer<typeof UserCreditSchema>;

// User Credit Log Schema
export const UserCreditLogSchema = z.object({
  id: z.string().min(1),
  user_id: z.string(),
  user_name: z.string().optional(),
  credit_amount: z.number().int(),
  type: CreditLogTypeSchema,
  source: CreditSourceSchema.optional(),
  service_id: z.string().optional().nullable(),
  package_id: z.string().optional().nullable(),
  is_confirmed: z.boolean().default(true),
  description: z.string().optional(),
  createdAt: z.string(),
});

export type UserCreditLog = z.infer<typeof UserCreditLogSchema>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface UserCreditsQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  user_id?: string;
  source?: CreditSource | "all";
}

export interface UserCreditLogsQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  user_id?: string;
  type?: CreditLogType | "all";
}
