import { z } from "zod";

export const PackageTypeSchema = z.enum(["PERMANENT", "SUBSCRIPTION"]);
export type PackageType = z.infer<typeof PackageTypeSchema>;

export const PackageSchema = z.object({
  id: z.string().min(1),
  credit_amount: z.number().int().min(1),
  price: z.number().int().min(0),
  type: PackageTypeSchema,
  duration_days: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Package = z.infer<typeof PackageSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface PackagesQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  type?: PackageType | "all";
  is_active?: boolean;
}

export const createPackageSchema = PackageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePackageSchema = createPackageSchema
  .partial()
  .required({ id: true });

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
