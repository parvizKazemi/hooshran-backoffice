import { z } from "zod";
import {
  SERVICE_BADGE_NONE,
  SERVICE_BADGE_VALUES,
  SERVICE_DESC_MAX,
  SERVICE_MODEL_TYPES,
  SERVICE_NAME_MAX,
} from "./constants";

export const ServiceBadgeSchema = z.enum(SERVICE_BADGE_VALUES).nullable();
export type ServiceBadge = z.infer<typeof ServiceBadgeSchema>;

export const ServiceModelTypeSchema = z.enum(SERVICE_MODEL_TYPES);
export type ServiceModelType = z.infer<typeof ServiceModelTypeSchema>;

export const ServiceSubmodelSchema = z.object({
  uuid: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  slug: z.string().min(1),
  imageUrl: z.string().default(""),
  creditHint: z.string().default(""),
  badge: ServiceBadgeSchema,
  isActive: z.boolean().default(true),
  inactiveReason: z.string().default(""),
  order: z.number().int().positive().optional(),
  isLocal: z.boolean().optional(),
});

export type ServiceSubmodel = z.infer<typeof ServiceSubmodelSchema>;

export const ManageServiceSchema = z.object({
  uuid: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  introduction: z.string().optional(),
  slug: z.string().min(1),
  modelType: ServiceModelTypeSchema,
  badge: ServiceBadgeSchema,
  imageUrl: z.string(),
  order: z.number().int().positive(),
  isActive: z.boolean(),
  inactiveReason: z.string(),
  /** Catalog visibility — `metadata.ui.display` / `information.display`. */
  display: z.boolean().default(false),
  /** Search index — `metadata.ui.searchable` / `information.searchable`. */
  searchable: z.boolean().default(true),
  categoryUuids: z.array(z.string()),
  categoryOrders: z.record(z.string(), z.number()).optional(),
  parentUuid: z.string().nullable(),
  isAutoCredit: z.boolean(),
  creditHint: z.string(),
  submodels: z.array(ServiceSubmodelSchema).default([]),
  /** Raw platform cost from detail (for auto credit display). */
  cost: z.unknown().optional(),
  isLocal: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ManageService = z.infer<typeof ManageServiceSchema>;

export const serviceFormSchema = z
  .object({
    modelType: ServiceModelTypeSchema,
    name: z
      .string()
      .min(1, "نام سرویس الزامی است")
      .max(SERVICE_NAME_MAX, `حداکثر ${SERVICE_NAME_MAX} کاراکتر`),
    description: z
      .string()
      .min(1, "توضیحات الزامی است")
      .max(SERVICE_DESC_MAX, `حداکثر ${SERVICE_DESC_MAX} کاراکتر`),
    slug: z.string().min(1, "اسلاگ الزامی است"),
    categoryUuids: z.array(z.string()).min(1, "حداقل یک دسته‌بندی لازم است"),
    imageUrl: z.string().min(1, "رسانه شاخص الزامی است"),
    isAutoCredit: z.boolean(),
    creditHint: z.string(),
    badge: z.enum([...SERVICE_BADGE_VALUES, SERVICE_BADGE_NONE]),
    isActive: z.boolean(),
    inactiveReason: z.string(),
    searchable: z.boolean(),
    display: z.boolean(),
    order: z.number().int().positive("ترتیب باید عدد مثبت باشد"),
    isChildOfMulti: z.boolean(),
    parentUuid: z.string().nullable(),
  })
  .superRefine((values, ctx) => {
    if (!values.isAutoCredit && !values.creditHint.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["creditHint"],
        message: "میزان اعتبار را وارد کنید یا محاسبه خودکار را فعال کنید",
      });
    }
    if (!values.isActive && !values.inactiveReason.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["inactiveReason"],
        message: "دلیل غیرفعال بودن الزامی است",
      });
    }
    if (
      values.modelType === "single" &&
      values.isChildOfMulti &&
      !values.parentUuid
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["parentUuid"],
        message: "سرویس والد چندمدله را انتخاب کنید",
      });
    }
  });

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export type ServiceSubmodelPayload = {
  uuid?: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  creditHint: string;
  badge: ServiceBadge;
  isActive: boolean;
  inactiveReason: string;
};

/** Full-list sync item for POST/PATCH body. */
export type ManageServicePayload = {
  uuid?: string;
  name: string;
  description: string;
  slug: string;
  modelType: ServiceModelType;
  badge: ServiceBadge;
  imageUrl: string;
  order: number;
  isActive: boolean;
  inactiveReason: string;
  categoryUuids: string[];
  parentUuid: string | null;
  isAutoCredit: boolean;
  creditHint: string;
  submodels: ServiceSubmodelPayload[];
};

export type ServiceFormSubmitValues = {
  modelType: ServiceModelType;
  name: string;
  description: string;
  slug: string;
  categoryUuids: string[];
  imageUrl: string;
  isAutoCredit: boolean;
  creditHint: string;
  badge: ServiceBadge;
  isActive: boolean;
  inactiveReason: string;
  searchable: boolean;
  display: boolean;
  order: number;
  parentUuid: string | null;
  submodels: ServiceSubmodel[];
};

export type ServiceDeleteMode = "fromCategory" | "entire";

export type ParentServiceOption = {
  uuid: string;
  name: string;
  slug: string;
};

/** Services selectable as multi-model children. */
export type CatalogServiceOption = ParentServiceOption & {
  endpoint?: string;
  modelType?: ServiceModelType;
  description?: string;
  imageUrl?: string;
  creditHint?: string;
  badge?: ServiceBadge;
  isActive?: boolean;
  inactiveReason?: string;
  order?: number;
  parentUuid?: string | null;
};
