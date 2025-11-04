import { z } from "zod";

export const PaymentStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentTypeSchema = z.enum(["PACKAGE", "SERVICE"]);
export type PaymentType = z.infer<typeof PaymentTypeSchema>;

export const PaymentSchema = z.object({
  id: z.string().min(1),
  user_id: z.string(),
  user_name: z.string().optional(),
  user_phone: z.string().optional(),
  amount: z.number().int().min(0),
  status: PaymentStatusSchema,
  type: PaymentTypeSchema,
  payable_type: z.string(),
  payable_id: z.string(),
  paid_at: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface PaymentsQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  user_id?: string;
  status?: PaymentStatus | "all";
  type?: PaymentType | "all";
  start_date?: string;
  end_date?: string;
}
