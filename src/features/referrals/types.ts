import { z } from "zod";

export const ReferralRewardTypeSchema = z.enum(["CREDIT", "POINT"]);
export type ReferralRewardType = z.infer<typeof ReferralRewardTypeSchema>;

export const ReferralRewardSchema = z.object({
  id: z.string().min(1),
  referrer_id: z.string(),
  referrer_name: z.string().optional(),
  referrer_phone: z.string().optional(),
  referred_id: z.string(),
  referred_name: z.string().optional(),
  referred_phone: z.string().optional(),
  reward_type: ReferralRewardTypeSchema,
  reward_amount: z.number().int().min(0),
  user_credit_id: z.string().optional().nullable(),
  received_at: z.string().optional(),
  createdAt: z.string(),
});

export type ReferralReward = z.infer<typeof ReferralRewardSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface ReferralsQueryParams {
  order?: string;
  page?: number;
  take?: number;
  q?: string;
  referrer_id?: string;
  referred_id?: string;
  reward_type?: ReferralRewardType | "all";
}
