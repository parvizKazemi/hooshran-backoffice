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
  createdAt: z.string(),
  updatedAt: z.string(),
  registrationSource: z.string().nullable(),
  referralCode: z.string(),
  phoneNumber: z.string(),
  profile: userProfileSchema,
  // Legacy fields for backward compatibility
  fullName: z.string().optional(),
  role: z.enum(["admin", "user", "moderator", "USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
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

export const createUserSchema = userSchema.omit({
  uuid: true,
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = userSchema.partial().required({ uuid: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
