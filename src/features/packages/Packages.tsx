import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PackagesTable } from "./components/packages-table";
import { usePackages } from "./hooks/use-packages";
import { PackagesQueryParams } from "./types";

export default function Packages() {
  const { t } = useTranslation("common");
  const [searchParams] = useSearchParams();
  const specialOfferFromUrl = searchParams.get("specialOffer") === "true";
  const [filters, setFilters] = useState<PackagesQueryParams>({
    page: 1,
    limit: 50,
    isSpecialOffer: specialOfferFromUrl || undefined,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      isSpecialOffer: specialOfferFromUrl || undefined,
      page: 1,
    }));
  }, [specialOfferFromUrl]);

  const { data, isLoading, refetch } = usePackages(filters);
  const packages = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("packages.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("packages.description")}
        </p>
      </div>
      <PackagesTable
        data={packages}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        filters={filters}
        onFiltersChange={setFilters}
        pagination={{
          page: currentPage,
          total: total,
          totalPages: totalPages,
          limit: filters.limit || 50,
        }}
      />
    </div>
  );
}
