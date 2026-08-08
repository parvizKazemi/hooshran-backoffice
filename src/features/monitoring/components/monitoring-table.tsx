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
      <div className="bg-card space-y-2 rounded-2xl border p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-card overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-bold">
                  #
                </TableHead>
                <TableHead className="text-start text-xs font-bold">
                  {t("monitoring.table.severity")}
                </TableHead>
                <TableHead className="text-start text-xs font-bold">
                  {t("monitoring.table.type")}
                </TableHead>
                <TableHead className="text-start text-xs font-bold">
                  {t("monitoring.table.location")}
                </TableHead>
                <TableHead className="text-start text-xs font-bold">
                  {t("monitoring.table.error")}
                </TableHead>
                <TableHead className="text-start text-xs font-bold">
                  {t("monitoring.table.source")}
                </TableHead>
                <TableHead className="text-start text-xs font-bold">
                  {t("monitoring.table.createdAt")}
                </TableHead>
                <TableHead className="text-center text-xs font-bold">
                  {t("monitoring.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-muted-foreground py-10 text-center"
                  >
                    {t("monitoring.table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.uuid} className="text-xs">
                    <TableCell className="text-muted-foreground text-center font-medium tabular-nums">
                      {(startIndex + index).toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell className="text-start">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold",
                          getSeverityBadgeClass(item.severity)
                        )}
                      >
                        {t(`monitoring.severity.${item.severity}`, {
                          defaultValue: item.severity,
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-start">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold",
                          getTypeBadgeClass(item.type)
                        )}
                      >
                        {t(`monitoring.type.${item.type}`, {
                          defaultValue: item.type,
                        })}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="max-w-[160px] truncate text-start font-medium"
                      title={item.location}
                    >
                      <span
                        className="inline-block max-w-full truncate"
                        dir="ltr"
                      >
                        {item.location}
                      </span>
                    </TableCell>
                    <TableCell
                      className="max-w-[240px] truncate text-start whitespace-normal"
                      title={item.error}
                      dir="auto"
                    >
                      {item.error}
                    </TableCell>
                    <TableCell className="text-start">
                      {t(`monitoring.source.${item.source}`, {
                        defaultValue: item.source,
                      })}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground text-start whitespace-nowrap tabular-nums"
                      dir="ltr"
                    >
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
        <div className="bg-card flex flex-col items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 sm:flex-row">
          <div className="text-muted-foreground text-start text-xs">
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
                className="size-8"
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
                className="size-8"
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
