import {
  IconAlertTriangle,
  IconBell,
  IconInfoCircle,
  IconPlus,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Notification, NotificationsQueryParams } from "../types";
import { NotificationForm } from "./notification-form";

// Format date helper
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

type NotificationsListProps = {
  data: Notification[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: NotificationsQueryParams;
  onFiltersChange?: (filters: NotificationsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  system: IconSettings,
  user: IconUser,
  admin: IconUser,
  alert: IconAlertTriangle,
  info: IconInfoCircle,
};

// typeLabels will be defined inside the component to use t()

const typeVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  system: "default",
  user: "secondary",
  admin: "default",
  alert: "destructive",
  info: "outline",
};

export function NotificationsList({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: NotificationsListProps) {
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState(filters.type || "");

  const typeLabels: Record<string, string> = {
    system: t("notifications.types.system"),
    user: t("notifications.types.user"),
    admin: t("notifications.types.admin"),
    alert: t("notifications.types.alert"),
    info: t("notifications.types.info"),
  };

  const handleFilterChange = (type: string) => {
    setTypeFilter(type);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        type: type === "all" ? undefined : type,
        page: 1,
      });
    }
  };

  const handleFormSuccess = () => {
    setIsDrawerOpen(false);
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter || "all"}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("notifications.filter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("notifications.allTypes")}
                </SelectItem>
                <SelectItem value="system">
                  {t("notifications.types.system")}
                </SelectItem>
                <SelectItem value="user">
                  {t("notifications.types.user")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("notifications.types.admin")}
                </SelectItem>
                <SelectItem value="alert">
                  {t("notifications.types.alert")}
                </SelectItem>
                <SelectItem value="info">
                  {t("notifications.types.info")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button>
                <IconPlus className="mr-2 size-4" />
                {t("notifications.sendNew")}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("notifications.sendNewTitle")}</DrawerTitle>
                <DrawerDescription>
                  {t("notifications.sendNewDescription")}
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <NotificationForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsDrawerOpen(false)}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="space-y-3">
          {data.length > 0 ? (
            data.map((notification) => {
              const Icon = typeIcons[notification.type] || IconBell;
              return (
                <Card key={notification.uuid}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted rounded-full p-2">
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              typeVariants[notification.type] || "outline"
                            }
                          >
                            {typeLabels[notification.type] || notification.type}
                          </Badge>
                          {notification.metaData.type && (
                            <Badge variant="outline" className="text-xs">
                              {notification.metaData.type}
                            </Badge>
                          )}
                          {notification.isPopup && (
                            <Badge variant="outline" className="text-xs">
                              {t("notifications.popup")} دارد
                            </Badge>
                          )}

                          {notification.user && (
                            <span className="text-muted-foreground text-sm">
                              {t("notifications.user")}:{" "}
                              {notification.user.phoneNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">
                          {notification.metaData?.data ||
                            notification.message ||
                            ""}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <IconBell className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground text-sm">
                  {t("notifications.noResults")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground text-sm">
              {t("notifications.page")} {pagination.page}{" "}
              {t("notifications.of")} {pagination.totalPages} (
              {pagination.total} {t("notifications.items")})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onFiltersChange && pagination.page > 1) {
                    onFiltersChange({
                      ...filters,
                      page: pagination.page - 1,
                    });
                  }
                }}
                disabled={pagination.page <= 1}
              >
                {t("notifications.prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    onFiltersChange &&
                    pagination.page < pagination.totalPages
                  ) {
                    onFiltersChange({
                      ...filters,
                      page: pagination.page + 1,
                    });
                  }
                }}
                disabled={pagination.page >= pagination.totalPages}
              >
                {t("notifications.next")}
              </Button>
              <Select
                value={String(pagination.take)}
                onValueChange={(value) => {
                  if (onFiltersChange) {
                    onFiltersChange({
                      ...filters,
                      take: Number(value),
                      page: 1,
                    });
                  }
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
