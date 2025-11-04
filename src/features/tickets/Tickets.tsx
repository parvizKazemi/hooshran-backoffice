import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { TicketsList } from "./components/tickets-list";
import { mockTicketMessages, mockTickets } from "./types";

export default function Tickets() {
  const { t } = useTranslation("common");
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold">{t("tickets.title")}</h1>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {t("tickets.description")}
                  </p>
                </div>

                <TicketsList data={mockTickets} messages={mockTicketMessages} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
