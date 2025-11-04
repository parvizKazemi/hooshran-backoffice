import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNotifications } from "@/contexts/notifications-context";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Ticket, TicketMessage, TicketsFilters } from "../types";
import { TicketDrawer } from "./ticket-drawer";

export function TicketsList({
  data,
  messages,
}: {
  data: Ticket[];
  messages: Record<string, TicketMessage[]>;
}) {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<TicketsFilters>({ status: "all" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const { isTicketRead, markTicketAsRead } = useNotifications();

  const filtered = useMemo(() => {
    const q = (filters.q || "").toLowerCase().trim();
    return data.filter((t) => {
      const matchesQ = q
        ? (t.id + t.subject + (t.userPhone || "")).toLowerCase().includes(q)
        : true;
      const matchesStatus =
        filters.status && filters.status !== "all"
          ? t.status === filters.status
          : true;
      return matchesQ && matchesStatus;
    });
  }, [data, filters]);

  const statusLabel: Record<Ticket["status"], string> = {
    open: t("tickets.statuses.open"),
    pending: t("tickets.statuses.pending"),
    closed: t("tickets.statuses.closed"),
  };
  const statusVariant: Record<
    Ticket["status"],
    "default" | "secondary" | "destructive"
  > = {
    open: "default",
    pending: "secondary",
    closed: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          placeholder={t("tickets.search")}
          value={filters.q || ""}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <Select
          value={(filters.status as string) || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, status: v as TicketsFilters["status"] }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("tickets.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tickets.all")}</SelectItem>
            <SelectItem value="open">{t("tickets.statuses.open")}</SelectItem>
            <SelectItem value="pending">
              {t("tickets.statuses.pending")}
            </SelectItem>
            <SelectItem value="closed">
              {t("tickets.statuses.closed")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">
                {t("tickets.table.id")}
              </TableHead>
              <TableHead className="text-start">
                {t("tickets.table.subject")}
              </TableHead>
              <TableHead className="text-start">
                {t("tickets.table.user")}
              </TableHead>
              <TableHead className="text-start">
                {t("tickets.table.status")}
              </TableHead>
              <TableHead className="text-start">
                {t("tickets.table.date")}
              </TableHead>
              <TableHead className="text-start">
                {t("tickets.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((t) => {
                const unread = !isTicketRead(t.id);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <span className={unread ? "font-bold" : ""}>{t.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className={unread ? "font-bold" : ""}>
                        {t.subject}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={unread ? "font-bold" : ""}>
                        {t.userPhone || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[t.status]}>
                        {statusLabel[t.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={unread ? "font-bold" : ""}>
                        {new Date(t.createdAt).toLocaleString("fa-IR")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTicket(t);
                          setDrawerOpen(true);
                          markTicketAsRead(t.id);
                        }}
                        className="flex cursor-pointer items-center"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("tickets.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TicketDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        ticket={activeTicket}
        messages={activeTicket ? messages[activeTicket.id] || [] : []}
        onSend={(content) => {
          if (!activeTicket) return;
          messages[activeTicket.id] = [
            ...(messages[activeTicket.id] || []),
            {
              id: `m_${activeTicket.id}_${Date.now()}`,
              ticketId: activeTicket.id,
              sender: "admin",
              content,
              createdAt: new Date().toISOString(),
            },
          ];
        }}
      />
    </div>
  );
}
