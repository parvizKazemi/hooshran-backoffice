import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PlansTable } from "./components/plans-table";
import { usePlans } from "./hooks/use-plans";
import { PlansQueryParams } from "./types";

export default function Plans() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<PlansQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = usePlans(filters);
  const plans = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("plans.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("plans.description")}
        </p>
      </div>
      <PlansTable
        data={plans}
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
