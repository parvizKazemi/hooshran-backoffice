import { z } from "zod";

export const DISCOUNT_CODE_TYPES = ["global", "personal"] as const;
export type DiscountCodeType = (typeof DISCOUNT_CODE_TYPES)[number];

export const DiscountCodePackageSchema = z.object({
  packageId: z.number().int().positive(),
  discountPercentage: z.number().int().min(1).max(100),
});

export type DiscountCodePackage = z.infer<typeof DiscountCodePackageSchema>;

export const DiscountCodeSchema = z.object({
  id: z.number().int().positive().optional(),
  uuid: z.string().optional(),
  code: z.string(),
  type: z.enum(DISCOUNT_CODE_TYPES),
  phoneNumber: z.string().nullable().optional(),
  capacity: z.number().int().min(1),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  showNotification: z.boolean(),
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

/** Payload aligned with current backend CreateDiscountCodeDto */
export interface CreateDiscountCodeInput {
  code: string;
  type: DiscountCodeType;
  phoneNumber?: string;
  packages: DiscountCodePackage[];
  capacity: number;
  startsAt?: string;
  expiresAt?: string;
  showNotification?: boolean;
}

export interface DiscountCodeFormState {
  code: string;
  type: DiscountCodeType;
  phoneNumbers: string[];
  capacity: number;
  usageLimitPerUser: number;
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
