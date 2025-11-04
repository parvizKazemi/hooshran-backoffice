import { z } from "zod";

export interface User {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  registrationSource: string;
  referralCode: string;
  phoneNumber: string;
  profile: Record<string, unknown>;
}

export interface Notification {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  type: "system" | "user" | "admin" | "alert" | "info";
  message: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface NotificationsQueryParams {
  page?: number;
  take?: number;
  type?: string;
}

export interface CreateNotificationInput {
  type: "system" | "user" | "admin" | "alert" | "info";
  message: string;
  userId?: string;
}

export const notificationSchema = z.object({
  type: z.enum(["system", "user", "admin", "alert", "info"]),
  message: z.string().min(1, "پیام الزامی است"),
  userId: z.string().uuid().optional(),
});
