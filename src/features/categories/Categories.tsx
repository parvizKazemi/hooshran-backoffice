import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoriesTable } from "./components/categories-table";
import { useCategories } from "./hooks/use-categories";
import { CategoriesQueryParams } from "./types";

export default function Categories() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<CategoriesQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = useCategories(filters);
  const categories = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("categories.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("categories.description")}
        </p>
      </div>
      <CategoriesTable
        data={categories}
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
