import { useTranslation } from "react-i18next";
import { TicketsList } from "./components/tickets-list";
import { mockTicketMessages, mockTickets } from "./types";

export default function Tickets() {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("tickets.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("tickets.description")}
        </p>
      </div>

      <TicketsList data={mockTickets} messages={mockTicketMessages} />
    </div>
  );
}
