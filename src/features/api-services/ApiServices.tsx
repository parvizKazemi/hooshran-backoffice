import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiServicesTable } from "./components/api-services-table";
import { ServiceReviewsTable } from "./components/service-reviews-table";
import { useApiServices } from "./hooks/use-api-services";
import { useServiceReviews } from "./hooks/use-service-reviews";
import { ApiServicesQueryParams, ServiceReviewsQueryParams } from "./types";

export default function ApiServices() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<ApiServicesQueryParams>({
    page: 1,
    take: 10,
  });
  const [reviewFilters, setReviewFilters] = useState<ServiceReviewsQueryParams>(
    {
      page: 1,
      take: 10,
    }
  );

  const { data, isLoading, refetch } = useApiServices(filters);
  const services = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 1;

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useServiceReviews(reviewFilters);
  const reviews = reviewsData?.data || [];
  const reviewsMeta = reviewsData?.meta;
  const reviewsTotal = reviewsMeta?.itemCount || 0;
  const reviewsCurrentPage = reviewsMeta?.page || 1;
  const reviewsTotalPages = reviewsMeta?.pageCount || 1;
  const reviewsTake = reviewsMeta?.take || reviewFilters.take || 10;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("apiServices.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("apiServices.description")}
        </p>
      </div>
      <ApiServicesTable
        data={services}
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

      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold">بررسی‌های سرویس</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            مدیریت و ویرایش بررسی‌های کاربران برای سرویس‌ها
          </p>
        </div>
        <ServiceReviewsTable
          data={reviews}
          isLoading={isReviewsLoading}
          onRefresh={() => refetchReviews()}
          filters={reviewFilters}
          onFiltersChange={setReviewFilters}
          pagination={{
            page: reviewsCurrentPage,
            total: reviewsTotal,
            totalPages: reviewsTotalPages,
            take: reviewsTake,
          }}
        />
      </div>
    </div>
  );
}
