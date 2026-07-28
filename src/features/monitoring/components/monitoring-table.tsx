import {
  IconChevronLeft,
  IconChevronRight,
  IconEye,
} from "@tabler/icons-react";
import { memo, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MonitoringErrorLog, MonitoringErrorsQueryParams } from "../types";
import {
  formatMonitoringDate,
  getSeverityBadgeClass,
  getTypeBadgeClass,
} from "../utils/monitoring.helpers";

type MonitoringTableProps = {
  data: MonitoringErrorLog[];
  isLoading?: boolean;
  filters: MonitoringErrorsQueryParams;
  onFiltersChange: (filters: MonitoringErrorsQueryParams) => void;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
  onView: (uuid: string) => void;
};

function buildPageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export const MonitoringTable = memo(function MonitoringTable({
  data,
  isLoading,
  filters,
  onFiltersChange,
  pagination,
  onView,
}: MonitoringTableProps) {
  const { t } = useTranslation("common");
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const startIndex = (pagination.page - 1) * pagination.take + 1;
  const endIndex = Math.min(
    pagination.page * pagination.take,
    pagination.total
  );
  const pageNumbers = useMemo(
    () => buildPageNumbers(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages]
  );

  if (isLoading) {
    return (
      <div className="bg-card space-y-3 rounded-3xl border p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card overflow-hidden rounded-3xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">#</TableHead>
                <TableHead>{t("monitoring.table.severity")}</TableHead>
                <TableHead>{t("monitoring.table.type")}</TableHead>
                <TableHead>{t("monitoring.table.location")}</TableHead>
                <TableHead>{t("monitoring.table.error")}</TableHead>
                <TableHead>{t("monitoring.table.source")}</TableHead>
                <TableHead>{t("monitoring.table.createdAt")}</TableHead>
                <TableHead className="text-center">
                  {t("monitoring.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-muted-foreground py-12 text-center"
                  >
                    {t("monitoring.table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.uuid} className="text-xs">
                    <TableCell className="text-muted-foreground text-center font-medium">
                      {(startIndex + index).toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-black",
                          getSeverityBadgeClass(item.severity)
                        )}
                      >
                        {t(`monitoring.severity.${item.severity}`, {
                          defaultValue: item.severity,
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-black",
                          getTypeBadgeClass(item.type)
                        )}
                      >
                        {t(`monitoring.type.${item.type}`, {
                          defaultValue: item.type,
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="max-w-[180px] truncate font-medium"
                      title={item.location}
                    >
                      <span dir="ltr">{item.location}</span>
                    </TableCell>
                    <TableCell
                      className="max-w-[260px] truncate"
                      title={item.error}
                    >
                      {item.error}
                    </TableCell>
                    <TableCell>
                      {t(`monitoring.source.${item.source}`, {
                        defaultValue: item.source,
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatMonitoringDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onView(item.uuid)}
                        aria-label={t("monitoring.table.view")}
                      >
                        <IconEye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination.total > 0 && (
        <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-3xl border p-4 sm:flex-row">
          <div className="text-muted-foreground text-xs">
            {t("monitoring.pagination.showing", {
              start: startIndex.toLocaleString("fa-IR"),
              end: endIndex.toLocaleString("fa-IR"),
              total: pagination.total.toLocaleString("fa-IR"),
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                disabled={pagination.page <= 1}
                onClick={() =>
                  onFiltersChange({
                    ...filtersRef.current,
                    page: pagination.page - 1,
                  })
                }
              >
                <IconChevronRight className="size-4" />
              </Button>

              {pageNumbers.map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev !== undefined && page - prev > 1;
                return (
                  <div key={page} className="flex items-center gap-1.5">
                    {showEllipsis && (
                      <span className="text-muted-foreground px-1 text-xs">
                        …
                      </span>
                    )}
                    <Button
                      variant={page === pagination.page ? "default" : "ghost"}
                      size="icon"
                      className="size-8 text-xs font-bold"
                      onClick={() =>
                        onFiltersChange({
                          ...filtersRef.current,
                          page,
                        })
                      }
                    >
                      {page.toLocaleString("fa-IR")}
                    </Button>
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                className="size-9"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  onFiltersChange({
                    ...filtersRef.current,
                    page: pagination.page + 1,
                  })
                }
              >
                <IconChevronLeft className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
