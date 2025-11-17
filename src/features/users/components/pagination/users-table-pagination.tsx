import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersQueryParams } from "../../types";
import { Table } from "@tanstack/react-table";
import { User } from "../../types";

type UsersTablePaginationProps = {
  table: Table<User>;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
  filters: UsersQueryParams;
  onFiltersChange?: (filters: UsersQueryParams) => void;
};

export function UsersTablePagination({
  table,
  pagination,
  filters,
  onFiltersChange,
}: UsersTablePaginationProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        {t("users.selectedRows", {
          selected: table.getFilteredSelectedRowModel().rows.length,
          total: pagination?.total || table.getFilteredRowModel().rows.length,
        })}
      </div>
      <div className="flex items-center gap-2">
        {pagination ? (
          <>
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
              {t("users.prev")}
            </Button>
            <div className="text-muted-foreground text-sm">
              {t("users.page")} {pagination.page} {t("users.of")}{" "}
              {pagination.totalPages} ({pagination.total} {t("users.items")})
            </div>
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
              {t("users.next")}
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
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t("users.prev")}
            </Button>
            <div className="text-muted-foreground text-sm">
              {t("users.page")} {table.getState().pagination.pageIndex + 1}{" "}
              {t("users.of")} {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("users.next")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
