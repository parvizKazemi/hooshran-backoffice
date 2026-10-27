import { z } from "zod";

export type ServiceIconType = "wand-2" | "image" | "video" | "mic";
export type CategoryColorTheme = "emerald" | "blue" | "indigo" | "amber";
export type ShowcaseStatusFilter = "all" | "active" | "inactive" | "pinned";

export const ShowcaseServiceSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  costDescription: z.string(),
  isActive: z.boolean(),
  isPinned: z.boolean(),
  badge: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  order: z.number().int().min(0),
  categoryId: z.string(),
});

export type ShowcaseService = z.infer<typeof ShowcaseServiceSchema>;

export const ShowcaseCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.enum(["wand-2", "image", "video", "mic"]),
  colorTheme: z.enum(["emerald", "blue", "indigo", "amber"]),
  isActive: z.boolean(),
  order: z.number().int().min(0),
  services: z.array(ShowcaseServiceSchema),
});

export type ShowcaseCategory = z.infer<typeof ShowcaseCategorySchema>;

export const ShowcaseConfigSchema = z.object({
  defaultRowsBeforeExpand: z.number().int().min(1).max(10).default(3),
});

export type ShowcaseConfig = z.infer<typeof ShowcaseConfigSchema>;

export const ShowcaseDataSchema = z.object({
  categories: z.array(ShowcaseCategorySchema),
  config: ShowcaseConfigSchema,
});

export type ShowcaseData = z.infer<typeof ShowcaseDataSchema>;

/**
 * Payload sent to backend when saving layout
 */
export type ShowcaseSavePayload = {
  categories: Array<{
    id: string;
    order: number;
    isActive: boolean;
    services: Array<{
      id: string;
      order: number;
      isActive: boolean;
      isPinned: boolean;
    }>;
  }>;
  config: ShowcaseConfig;
};
