import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationsList } from "./components/notifications-list";
import { useNotifications } from "./hooks/use-notifications";
import { NotificationsQueryParams } from "./types";

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function NotificationsContent() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<NotificationsQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = useNotifications(filters);
  const notifications = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

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
                  <h1 className="text-2xl font-bold">
                    {t("notifications.title")}
                  </h1>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {t("notifications.description")}
                  </p>
                </div>
                <NotificationsList
                  data={notifications}
                  isLoading={isLoading}
                  onRefresh={() => refetch()}
                  filters={filters}
                  onFiltersChange={setFilters}
                  pagination={{
                    page: currentPage,
                    total: total,
                    totalPages: totalPages,
                    take: filters.take || 10,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Notifications() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsContent />
    </QueryClientProvider>
  );
}
