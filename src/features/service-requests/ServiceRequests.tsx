import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { IconSearch } from "@tabler/icons-react";
import { ServiceRequestsTable } from "./components/service-requests-table";
import { ServiceRequestFilterDialog } from "./components/service-request-filter-dialog";
import { useServiceRequests } from "./hooks/use-service-requests";
import { ServiceRequestsQueryParams } from "./types";

export default function ServiceRequests() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<ServiceRequestsQueryParams>({
    page: 1,
    take: 10,
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useServiceRequests(filters);
  const requests = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("serviceRequests.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("serviceRequests.description")}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsFilterDialogOpen(true)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <IconSearch className="mr-2 size-4" />
          {filters.phoneNumber
            ? t("serviceRequests.filter.changeFilter")
            : t("serviceRequests.filter.searchByPhone")}
        </Button>
        {filters.phoneNumber && (
          <div className="text-muted-foreground text-sm">
            {t("serviceRequests.filter.currentPhone")}: {filters.phoneNumber}
          </div>
        )}
      </div>

      {!filters.phoneNumber ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <IconSearch className="text-muted-foreground mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("serviceRequests.emptyState.title")}
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {t("serviceRequests.emptyState.description")}
          </p>
          <Button onClick={() => setIsFilterDialogOpen(true)}>
            <IconSearch className="mr-2 size-4" />
            {t("serviceRequests.filter.searchByPhone")}
          </Button>
        </div>
      ) : (
        <ServiceRequestsTable
          data={requests}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={{
            page: meta.page,
            total: meta.itemCount,
            totalPages: meta.pageCount,
            take: meta.take,
          }}
        />
      )}

      <ServiceRequestFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onFilter={setFilters}
        initialFilters={filters}
      />
    </div>
  );
}
