// انواع و داده‌های نمونه تراکنش‌ها
// - schema: تعریف ساختار تراکنش برای اطمینان از صحت داده‌ها
// - TransactionsFilters: فیلترهای صفحه
// - mockTransactions: تولید ۱۲۵ رکورد نمونه برای نمایش و تست صفحه
import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string().min(1),
  refId: z.string().optional(),
  userPhone: z.string().optional(),
  gateway: z.string(),
  amount: z.number(),
  status: z.enum(["success", "failed", "pending"]),
  createdAt: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export type TransactionsFilters = {
  q?: string;
  gateway?: string;
  status?: "success" | "failed" | "pending" | "all";
  page?: number;
  take?: number;
};

export const mockTransactions: Transaction[] = Array.from({ length: 125 }).map(
  (_, i) => {
    const gateways = ["zarinpal", "idpay", "saman", "mellat", "parsian"];
    const statuses: Transaction["status"][] = ["success", "failed", "pending"];
    const g = gateways[i % gateways.length]!;
    const s = statuses[i % statuses.length]!;
    return {
      id: `trx_${100000 + i}`,
      refId: `R${900000 + i}`,
      userPhone: `09${(913000000 + i).toString()}`,
      gateway: g,
      amount: 10000 + (i % 20) * 5000,
      status: s,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  }
);
