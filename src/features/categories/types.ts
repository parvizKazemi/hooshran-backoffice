import { z } from "zod";
import {
  CATEGORY_BADGE_NONE,
  CATEGORY_BADGE_VALUES,
  CATEGORY_SLUG_PATTERN,
} from "./constants";

export const CategoryBadgeSchema = z.enum(CATEGORY_BADGE_VALUES).nullable();

export type CategoryBadge = z.infer<typeof CategoryBadgeSchema>;

export const CategorySchema = z.object({
  uuid: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  order: z.number().int().positive(),
  badge: CategoryBadgeSchema,
  /** Featured / cover image URL for the category. */
  imageUrl: z.string().default(""),
  /** True for rows created locally and not yet persisted. */
  isLocal: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(CATEGORY_SLUG_PATTERN, "اسلاگ فقط با حروف کوچک، عدد و خط تیره"),
  order: z.number().int().positive("ترتیب باید عدد مثبت باشد"),
  badge: z.enum([...CATEGORY_BADGE_VALUES, CATEGORY_BADGE_NONE]),
  imageUrl: z.string(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/** Payload item sent to POST/PATCH (array body). */
export type CategoryPayload = {
  uuid?: string;
  name: string;
  slug: string;
  order: number;
  badge: CategoryBadge;
  imageUrl: string;
};

export type CategoryFormSubmitValues = {
  name: string;
  slug: string;
  order: number;
  badge: CategoryBadge;
  imageUrl: string;
};
