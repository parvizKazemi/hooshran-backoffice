import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Ticket, TicketMessage } from "../types";

export function TicketDrawer({
  open,
  onOpenChange,
  ticket,
  messages,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  messages: TicketMessage[];
  onSend: (content: string) => void;
}) {
  const { t } = useTranslation("common");
  const listRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  const title = useMemo(() => {
    if (!ticket) return "";
    return t("tickets.drawer.title", {
      id: ticket.id,
      subject: ticket.subject,
    });
  }, [ticket, t]);

  const handleSend = () => {
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue("");
    setTimeout(
      () => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }),
      50
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="max-h h-fit min-w-full lg:min-w-[600px]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            {ticket && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {t("tickets.drawer.user")}: {ticket.userPhone}
                </span>
                <Badge
                  variant={ticket.status === "closed" ? "secondary" : "default"}
                >
                  {ticket.status === "open"
                    ? t("tickets.statuses.open")
                    : ticket.status === "pending"
                      ? t("tickets.statuses.pending")
                      : t("tickets.statuses.closed")}
                </Badge>
              </div>
            )}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 p-4">
          <div
            ref={listRef}
            className="bg-muted/30 flex-1 overflow-auto rounded-md p-3"
          >
            {messages.map((m) => (
              <div key={m.id} className="mb-3">
                <div className="text-muted-foreground mb-1 text-xs">
                  {m.sender === "user"
                    ? t("tickets.drawer.sender.user")
                    : t("tickets.drawer.sender.admin")}{" "}
                  • {new Date(m.createdAt).toLocaleString("fa-IR")}
                </div>
                <div
                  className={
                    m.sender === "user"
                      ? "bg-background border-input w-fit max-w-[80%] rounded-md border px-3 py-2"
                      : "bg-primary text-primary-foreground w-fit max-w-[80%] rounded-md px-3 py-2"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t("tickets.drawer.placeholder")}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <Button onClick={handleSend}>{t("tickets.drawer.send")}</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
