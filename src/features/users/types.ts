import { z } from "zod";

export const userProfileSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  user_id: z.number(),
  full_name: z.string().nullable(),
  avatar_id: z.string().nullable(),
  bio: z.string().nullable(),
  social_links: z.unknown().nullable(),
  achievements: z.unknown().nullable(),
  level: z.number(),
});

export const userSchema = z.object({
  uuid: z.string(),
  phoneNumber: z.string(),
  role: z.enum(["USER", "ADMIN"]), // Only USER or ADMIN per backend API
  isActive: z.boolean(),
  registrationSource: z.string().optional(),
  referralCode: z.string(),
  profile: userProfileSchema,
  // Optional timestamp fields (may not be present in all responses)
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // Legacy fields for backward compatibility
  fullName: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("ایمیل معتبر نیست").optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

// API Response types
export interface PaginationMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface UsersQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  search?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

// Create user schema - only allows creating with specific fields per API DTO
export const createUserSchema = z.object({
  phoneNumber: z.string().min(1, "شماره تماس الزامی است"),
  role: z.enum(["USER", "ADMIN"]).optional(), // Optional, default handled in form
  registrationSource: z.string().optional(),
});

// Update user schema - only allows updating specific fields per API DTO
// All fields are optional as per API documentation (partial updates are allowed)
export const updateUserSchema = z.object({
  uuid: z.string(), // Required for identification, but excluded from body
  phoneNumber: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(), // Only USER or ADMIN per API DTO
  isActive: z.boolean().optional(),
  registrationSource: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
