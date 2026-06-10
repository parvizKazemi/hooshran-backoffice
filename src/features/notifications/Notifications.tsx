import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationsList } from "./components/notifications-list";
import { useNotifications } from "./hooks/use-notifications";
import { NotificationsQueryParams } from "./types";

export default function Notifications() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<NotificationsQueryParams>({
    page: 1,
    take: 10,
  });

  const { data, isLoading, refetch } = useNotifications(filters);
  const notifications = data?.data || [];
  const meta = data?.meta;
  const total = meta?.itemCount || 0;
  const currentPage = meta?.page || 1;
  const totalPages = meta?.pageCount || 1;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("notifications.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("notifications.description")}
        </p>
      </div>
      <NotificationsList
        data={notifications}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        filters={filters}
        onFiltersChange={setFilters}
        pagination={{
          page: currentPage,
          total: total,
          totalPages: totalPages,
          take: meta?.take || filters.take || 10,
        }}
      />
    </div>
  );
}
