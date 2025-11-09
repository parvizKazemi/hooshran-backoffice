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

export interface NotificationMetaData {
  data: string;
  type: "text" | string;
}

export interface Notification {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  type: "system" | "user" | "admin" | "alert" | "info";
  metaData: NotificationMetaData;
  isPopup: boolean;
  // Legacy fields for backward compatibility
  message?: string;
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

export const notificationSchema = z.object({
  type: z.enum(["system", "user", "admin", "alert", "info"]),
  metaData: z.object({
    data: z.string().min(1, "محتوا الزامی است"),
    type: z.string().default("text"),
  }),
  isPopup: z.boolean().optional(),
  userId: z.string().uuid().optional(),
  // Legacy field for backward compatibility
  message: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof notificationSchema>;
