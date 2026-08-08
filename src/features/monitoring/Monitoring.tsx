import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconActivityHeartbeat, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { MonitoringCharts } from "./components/monitoring-charts";
import { MonitoringDetailSheet } from "./components/monitoring-detail-sheet";
import { MonitoringFilters } from "./components/monitoring-filters";
import { MonitoringStats } from "./components/monitoring-stats";
import { MonitoringTable } from "./components/monitoring-table";
import { MONITORING_DEFAULT_TAKE } from "./constants";
import {
  useMonitoringChartData,
  useMonitoringErrors,
} from "./hooks/use-monitoring";
import type { MonitoringErrorsQueryParams } from "./types";

export default function Monitoring() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<MonitoringErrorsQueryParams>({
    page: 1,
    take: MONITORING_DEFAULT_TAKE,
    order: "DESC",
  });
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const listQuery = useMonitoringErrors(filters);
  const chartFilters = useMemo(() => {
    const rest = { ...filters };
    delete rest.page;
    delete rest.take;
    return rest;
  }, [filters]);
  const chartQuery = useMonitoringChartData(chartFilters);

  const entries = listQuery.data?.data || [];
  const meta = listQuery.data?.meta || {
    page: filters.page || 1,
    take: filters.take || MONITORING_DEFAULT_TAKE,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
  const chartItems = chartQuery.data?.data || [];

  const handleView = (uuid: string) => {
    setSelectedUuid(uuid);
    setIsDetailOpen(true);
  };

  const handleRefresh = () => {
    void listQuery.refetch();
    void chartQuery.refetch();
  };

  return (
    <div className="flex flex-col gap-3 px-4 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {t("monitoring.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("monitoring.description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={listQuery.isFetching}
        >
          <IconRefresh className="size-4" />
          {t("monitoring.refresh")}
        </Button>
      </div>

      <div className="bg-card flex items-center gap-2 rounded-2xl border px-3 py-2">
        <IconActivityHeartbeat className="text-primary size-4 shrink-0" />
        <div className="min-w-0 text-start">
          <h2 className="text-xs font-bold">{t("monitoring.headerTitle")}</h2>
          <p className="text-muted-foreground truncate text-[11px]">
            {t("monitoring.headerDescription")}
          </p>
        </div>
      </div>

      <MonitoringFilters filters={filters} onChange={setFilters} />

      <MonitoringTable
        data={entries}
        isLoading={listQuery.isLoading}
        filters={filters}
        onFiltersChange={setFilters}
        pagination={{
          page: meta.page,
          total: meta.itemCount,
          totalPages: meta.pageCount,
          take:
            meta.take > 0 ? meta.take : filters.take || MONITORING_DEFAULT_TAKE,
        }}
        onView={handleView}
      />

      <MonitoringStats
        total={meta.itemCount}
        items={chartItems}
        isLoading={chartQuery.isLoading}
      />

      <MonitoringCharts items={chartItems} isLoading={chartQuery.isLoading} />

      <MonitoringDetailSheet
        uuid={selectedUuid}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedUuid(null);
        }}
      />
    </div>
  );
}
