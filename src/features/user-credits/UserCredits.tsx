import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserCreditsTable } from "./components/user-credits-table";
import { useUserCredits } from "./hooks/use-user-credits";
import { UserCreditsQueryParams } from "./types";

export default function UserCredits() {
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
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("userCredits.title")}</h1>
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
  );
}
