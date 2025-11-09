import { z } from "zod";

export const ticketMessageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  sender: z.enum(["user", "admin"]),
  content: z.string(),
  createdAt: z.string(),
});

export const ticketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  userPhone: z.string().optional(),
  status: z.enum(["open", "pending", "closed"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Ticket = z.infer<typeof ticketSchema>;
export type TicketMessage = z.infer<typeof ticketMessageSchema>;

export type TicketsFilters = {
  q?: string;
  status?: "open" | "pending" | "closed" | "all";
};

export const mockTickets: Ticket[] = Array.from({ length: 40 }).map((_, i) => {
  const statuses: Ticket["status"][] = ["open", "pending", "closed"];
  const s = statuses[i % statuses.length]!;
  return {
    id: `t_${1000 + i}`,
    subject: `مشکل شماره ${i + 1}`,
    userPhone: `09${(123000000 + i).toString()}`,
    status: s,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - i * 1800_000).toISOString(),
  };
});

export const mockTicketMessages: Record<string, TicketMessage[]> =
  Object.fromEntries(
    mockTickets.map((t, idx) => {
      const msgs: TicketMessage[] = Array.from({ length: 4 + (idx % 3) }).map(
        (_, j) => ({
          id: `m_${t.id}_${j}`,
          ticketId: t.id,
          sender: j % 2 === 0 ? "user" : "admin",
          content:
            j % 2 === 0
              ? `کاربر: لطفا راهنمایی کنید (${j + 1})`
              : `ادمین: بررسی شد (${j + 1})`,
          createdAt: new Date(
            Date.now() - (idx * 4 + j) * 900_000
          ).toISOString(),
        })
      );
      return [t.id, msgs];
    })
  );
