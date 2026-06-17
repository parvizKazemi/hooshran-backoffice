import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { BannedUsersQueryParams } from "../../../types";

type BlacklistTablePaginationProps = {
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
  filters: BannedUsersQueryParams;
  onFiltersChange?: (filters: BannedUsersQueryParams) => void;
};

export function BlacklistTablePagination({
  pagination,
  filters,
  onFiltersChange,
}: BlacklistTablePaginationProps) {
  const { t } = useTranslation("common");

  if (!pagination) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        {t("users.page")} {pagination.page} {t("users.of")}{" "}
        {pagination.totalPages} ({pagination.total} {t("users.items")})
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
          {t("users.prev")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onFiltersChange && pagination.page < pagination.totalPages) {
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
      </div>
    </div>
  );
}
