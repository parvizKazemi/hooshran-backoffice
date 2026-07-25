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

// Credit Type (from API)
export const CreditTypeSchema = z.enum([
  "PURCHASE",
  "GIFT",
  "REFERRAL",
  "SYSTEM",
  "ADMIN",
]);

export type CreditType = z.infer<typeof CreditTypeSchema>;

// Package Type
export const PackageTypeSchema = z.enum([
  "SUBSCRIPTION",
  "SUBSCRIPTION-TRANSFERED",
  "PERMANENT",
]);

export type PackageType = z.infer<typeof PackageTypeSchema>;

// Credit Status
export const CreditStatusSchema = z.enum([
  "active",
  "used",
  "expired",
  "transferred",
  "transfered", // backend spelling variant
  "canceled",
  "frozen",
]);

export type CreditStatus = z.infer<typeof CreditStatusSchema>;

/** Editable statuses in the admin edit form */
export const EditableCreditStatusSchema = z.enum([
  "active",
  "expired",
  "transferred",
  "canceled",
]);

export type EditableCreditStatus = z.infer<typeof EditableCreditStatusSchema>;

// Credit Log Type
export const CreditLogTypeSchema = z.enum([
  "INCREASE",
  "DECREASE",
  "SUBSCRIPTION",
]);

export type CreditLogType = z.infer<typeof CreditLogTypeSchema>;

// User Credit Schema (API Response Structure)
export const UserCreditSchema = z.object({
  uuid: z.string(),
  userUuid: z.string(),
  userPhoneNumber: z.string(),
  creditBalance: z.number().int().min(0),
  creditAmount: z.number().int().min(0),
  pricePaid: z.number().int().min(0),
  type: CreditTypeSchema,
  packageType: PackageTypeSchema,
  packageUuid: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
  status: CreditStatusSchema,
  cancelationReason: z.string().optional().nullable(),
});

export type UserCredit = z.infer<typeof UserCreditSchema>;

// Legacy User Credit Schema (for backward compatibility)
export const LegacyUserCreditSchema = z.object({
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

export type LegacyUserCredit = z.infer<typeof LegacyUserCreditSchema>;

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
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Legacy Paginated Response (for backward compatibility)
export interface LegacyPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface UserCreditsQueryParams {
  page?: number;
  take?: number;
  phoneNumber?: string;
  packageType?: PackageType;
  type?: CreditType;
  status?: CreditStatus;
  // Legacy params
  order?: string;
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
