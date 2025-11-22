import { z } from "zod";

// Notification Types
export type NotificationType = "notification" | "information";

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "notification",
  "information",
] as const;

// User DTO (simplified, matches backend structure)
export interface UserDto {
  uuid: string;
  phoneNumber: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  registrationSource?: string;
  referralCode: string;
  profile?: {
    full_name?: string | null;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Notification MetaData structure
export interface NotificationMetaData {
  type: string; // Template type: 'service_result', 'payment_success', 'security_alert', 'promotional', 'dynamic', 'simple'
  data: Record<string, unknown>; // Dynamic data based on template type
}

// AdminNotificationDto (response from GET /admin/notification)
export interface AdminNotification {
  uuid: string;
  type: NotificationType;
  metaData: NotificationMetaData;
  isPopup: boolean;
  isPublic: boolean;
  user?: UserDto;
  recipientCount?: number;
  readCount?: number;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Basic notification response from create/update endpoints
export interface BasicNotification {
  uuid: string;
  type: NotificationType;
  metaData: NotificationMetaData;
  isPopup: boolean;
  isPublic: boolean;
  user?: UserDto;
  createdAt: string;
  updatedAt: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

// Query Parameters for GET /admin/notification
export interface NotificationsQueryParams {
  page?: number; // Default: 1
  take?: number; // Default: 10, Max: 50
  order?: "ASC" | "DESC"; // Default: 'DESC'
  search?: string; // Search in metadata
  type?: NotificationType;
  templateType?: string; // e.g., 'payment_success', 'service_result'
  isPopup?: boolean;
  dateFrom?: string; // ISO 8601 format
  dateTo?: string; // ISO 8601 format
  sortBy?: string; // Default: 'createdAt'
}

// Create Notification DTO
export const createNotificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES, {
    message: "نوع نوتیفیکیشن الزامی است",
  }),
  metaData: z.object({
    type: z.string().min(1, "نوع template الزامی است"),
    data: z
      .record(z.string(), z.unknown())
      .refine(
        (val) => Object.keys(val).length > 0,
        "داده‌های template الزامی است"
      ),
  }),
  userId: z.string().uuid("UUID معتبر نیست").optional(),
  isPopup: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
});

export type CreateNotificationInput = Omit<
  z.infer<typeof createNotificationSchema>,
  "isPopup" | "isPublic" | "type"
> & {
  type: NotificationType;
  isPopup: boolean;
  isPublic: boolean;
};

// Update Notification DTO
export const updateNotificationSchema = z.object({
  type: z
    .enum(NOTIFICATION_TYPES, {
      message: "نوع نوتیفیکیشن معتبر نیست",
    })
    .optional(),
  metaData: z
    .object({
      type: z.string().optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  userId: z.string().uuid("UUID معتبر نیست").optional(),
  isPopup: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

// Notification Stats Response
export interface NotificationStats {
  notificationId: string;
  recipientCount: number;
  readCount: number;
  unreadCount: number;
  readPercentage: number;
  unreadPercentage: number;
}

// Template Types
export const TEMPLATE_TYPES = [
  "simple",
  "promotional",
  "dynamic",
  // "service_result",
  // "payment_success",
  // "security_alert",
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

// Legacy type alias for backward compatibility
export type Notification = AdminNotification;
