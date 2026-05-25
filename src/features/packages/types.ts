import { z } from "zod";

export const PackageTypeSchema = z.enum(["PERMANENT", "SUBSCRIPTION"]);
export type PackageType = z.infer<typeof PackageTypeSchema>;

export const PackageSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  creditAmount: z.number().int().min(1),
  price: z.number().int().min(0),
  type: PackageTypeSchema,
  durationDays: z.number().int().min(0).optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  properties: z.object({
    transferLimit: z.number().int().min(0),
    boughtLimit: z.number().int(),
    parallelRequestLimit: z.number().int().min(0),
    isSpecialOffer: z.boolean().optional(),
    toolboxAccess: z.boolean().optional(),
  }),
});

export type Package = z.infer<typeof PackageSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PackagesQueryParams {
  order?: string;
  page?: number;
  limit?: number;
  q?: string;
  type?: PackageType | "all";
  is_active?: boolean;
}

export const createPackageSchema = PackageSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  properties: z.object({
    transferLimit: z.number().int().min(0),
    boughtLimit: z.number().int(),
    parallelRequestLimit: z.number().int().min(0),
    isSpecialOffer: z.boolean().optional(),
    toolboxAccess: z.boolean().optional(),
  }),
});

export const updatePackageSchema = createPackageSchema.partial().extend({
  uuid: z.string().min(1),
  properties: z
    .object({
      transferLimit: z.number().int().min(0),
      boughtLimit: z.number().int(),
      parallelRequestLimit: z.number().int().min(0),
      isSpecialOffer: z.boolean().optional(),
      toolboxAccess: z.boolean().optional(),
    })
    .optional(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
