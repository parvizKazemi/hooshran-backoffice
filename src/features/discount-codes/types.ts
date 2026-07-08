import { z } from "zod";

export const DISCOUNT_CODE_TYPES = ["global", "personal"] as const;
export type DiscountCodeType = (typeof DISCOUNT_CODE_TYPES)[number];

export const DiscountCodePackageSchema = z.object({
  packageUuid: z.string().min(1),
  discountPercentage: z.number().int().min(1).max(100),
});

export type DiscountCodePackage = z.infer<typeof DiscountCodePackageSchema>;

export const DiscountCodeSchema = z.object({
  uuid: z.string().uuid(),
  code: z.string(),
  type: z.enum(DISCOUNT_CODE_TYPES),
  phoneNumbers: z.array(z.string()).optional(),
  capacity: z.number().int().min(1),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  showNotification: z.boolean(),
  isActive: z.boolean(),
  clientUsageLimit: z.number().int().min(1).nullable().optional(),
  notificationTitle: z.string().nullable().optional(),
  notificationText: z.string().nullable().optional(),
  notificationDetails: z.record(z.unknown()).nullable().optional(),
  packages: z.array(DiscountCodePackageSchema).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type DiscountCode = z.infer<typeof DiscountCodeSchema>;

export interface PageMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedDiscountCodesResponse {
  data: DiscountCode[];
  meta: PageMeta;
}

export interface DiscountCodesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: DiscountCodeType | "all";
  isActive?: boolean | "all";
}

export interface DiscountCodeOverallReport {
  totalDiscountCodes: number;
  totalSuccessfulRedemptions: number;
  totalMoneyDiscountedRials: number;
}

export interface DiscountCodeUsageReportItem {
  userId: number;
  userPhone: string;
  paymentId: number;
  originalAmount: number;
  discountAmountApplied: number;
  usedAt: string;
}

export interface DiscountCodeSingleReport {
  code: string;
  type: DiscountCodeType;
  capacity: number;
  usagesCount: number;
  remainingCapacity: number;
  usages: DiscountCodeUsageReportItem[];
}

/** Payload aligned with backend CreateDiscountCodeDto */
export interface CreateDiscountCodeInput {
  code: string;
  type: DiscountCodeType;
  phoneNumbers?: string[];
  packages: DiscountCodePackage[];
  capacity: number;
  startsAt?: string;
  expiresAt?: string;
  showNotification?: boolean;
  notificationTitle?: string;
  notificationText?: string;
  notificationDetails?: Record<string, unknown> | null;
  isActive?: boolean;
  clientUsageLimit?: number | null;
}

export interface UpdateDiscountCodeInput {
  type?: DiscountCodeType;
  phoneNumbers?: string[];
  packages?: DiscountCodePackage[];
  capacity?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  showNotification?: boolean;
  notificationTitle?: string;
  notificationText?: string;
  notificationDetails?: Record<string, unknown> | null;
  isActive?: boolean;
  clientUsageLimit?: number | null;
}

export function resolveDiscountCodeUuid(
  code: Pick<DiscountCode, "uuid">
): string | null {
  const uuid = code.uuid?.trim();
  return uuid || null;
}

export function buildNotificationPayload(
  showNotification: boolean,
  title: string,
  message: string
): Pick<
  CreateDiscountCodeInput,
  "showNotification" | "notificationTitle" | "notificationText"
> {
  if (!showNotification) {
    return { showNotification: false };
  }

  return {
    showNotification: true,
    notificationTitle: title.trim() || undefined,
    notificationText: message.trim() || undefined,
  };
}

export interface DiscountCodeFormState {
  code: string;
  type: DiscountCodeType;
  phoneNumbers: string[];
  capacity: number;
  clientUsageLimit: number;
  hasExpiry: boolean;
  expiresAt?: string;
  showNotification: boolean;
  notificationTitle: string;
  notificationMessage: string;
}

export type PackageSelectionState = Record<
  string,
  {
    selected: boolean;
    discountPercentage: number;
  }
>;
