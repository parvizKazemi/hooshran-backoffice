import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ServiceRequestsTable } from "./components/service-requests-table";
import { useServiceRequests } from "./hooks/use-service-requests";
import { ServiceRequestsQueryParams } from "./types";

export default function ServiceRequests() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<ServiceRequestsQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = useServiceRequests(filters);
  const requests = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("serviceRequests.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("serviceRequests.description")}
        </p>
      </div>
      <ServiceRequestsTable
        data={requests}
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
  );
}
