import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserCreditsTable } from "./components/user-credits-table";
import { useUserCredits } from "./hooks/use-user-credits";
import { UserCreditsQueryParams } from "./types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function UserCreditsContent() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<UserCreditsQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = useUserCredits(filters);
  const credits = data?.data || [];
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
                    {t("userCredits.title")}
                  </h1>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {t("userCredits.description")}
                  </p>
                </div>
                <UserCreditsTable
                  data={credits}
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

export default function UserCredits() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserCreditsContent />
    </QueryClientProvider>
  );
}
