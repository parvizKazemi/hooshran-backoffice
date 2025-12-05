import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ReferralsTable } from "./components/referrals-table";
import { useReferrals } from "./hooks/use-referrals";
import { ReferralsQueryParams } from "./types";

export default function Referrals() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<ReferralsQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = useReferrals(filters);
  const referrals = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("referrals.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("referrals.description")}
        </p>
      </div>
      <ReferralsTable
        data={referrals}
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
