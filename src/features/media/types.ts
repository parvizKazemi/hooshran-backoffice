import { z } from "zod";

export const MediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const MediaSchema = z.object({
  id: z.string().min(1),
  extension: z.string(),
  type: MediaTypeSchema,
  size: z.number().int().min(0),
  bucket: z.string(),
  key: z.string(),
  url: z.string().optional(),
  createdAt: z.string(),
});

export type Media = z.infer<typeof MediaSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface MediaQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  type?: MediaType | "all";
}
