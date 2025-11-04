import { z } from "zod";

export const userSchema = z.object({
  id: z.string().min(1),
  uuid: z.string().optional(),
  name: z.string().min(2, "نام باید حداقل 2 کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر نیست").optional(),
  phone: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(["admin", "user", "moderator", "USER", "ADMIN"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface UsersQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  role?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = userSchema.partial().required({ id: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
