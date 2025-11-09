import { z } from "zod";

export const UtmEventTypeSchema = z.enum(["signup", "signin", "purchase"]);
export type UtmEventType = z.infer<typeof UtmEventTypeSchema>;

export const UtmEventSchema = z.object({
  id: z.string().min(1),
  event_type: UtmEventTypeSchema,
  user_id: z.string().optional().nullable(),
  user_name: z.string().optional(),
  user_phone: z.string().optional(),
  payment_id: z.string().optional().nullable(),
  utm_params: z.record(z.string(), z.unknown()),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  createdAt: z.string(),
});

export type UtmEvent = z.infer<typeof UtmEventSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface UtmAnalyticsQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  event_type?: UtmEventType | "all";
  source?: string;
  medium?: string;
  campaign?: string;
  start_date?: string;
  end_date?: string;
}
