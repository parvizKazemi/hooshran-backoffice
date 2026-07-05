import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Package } from "@/features/packages/types";
import { IconBell, IconChartBar, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DiscountCode, DiscountCodesQueryParams } from "../types";
import { DiscountCodeReportDialog } from "./discount-code-report-dialog";

type DiscountCodesTableProps = {
  data: DiscountCode[];
  packages: Package[];
  isLoading?: boolean;
  filters: DiscountCodesQueryParams;
  onFiltersChange: (filters: DiscountCodesQueryParams) => void;
  meta?: {
    page: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

function getDiscountRange(code: DiscountCode) {
  const percentages =
    code.packages?.map((item) => item.discountPercentage) ?? [];
  if (percentages.length === 0) {
    return "—";
  }
  const min = Math.min(...percentages);
  const max = Math.max(...percentages);
  return min === max ? `${min}%` : `${min}-${max}%`;
}

function getStatus(code: DiscountCode): "active" | "expired" {
  if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) {
    return "expired";
  }
  return "active";
}

export function DiscountCodesTable({
  data,
  packages,
  isLoading = false,
  filters,
  onFiltersChange,
  meta,
}: DiscountCodesTableProps) {
  const { t } = useTranslation("common");

  const [search, setSearch] = useState(filters.search ?? "");
  const [typeFilter, setTypeFilter] = useState<
    DiscountCodesQueryParams["type"]
  >(filters.type ?? "all");
  const [reportTargetId, setReportTargetId] = useState<number | undefined>();

  const packageNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const pkg of packages) {
      if (pkg.id) {
        map.set(pkg.id, pkg.name);
      }
    }
    return map;
  }, [packages]);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((code) => {
      const matchesSearch = !query || code.code.toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || code.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, search, typeFilter]);

  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      search,
      type: typeFilter,
      page: 1,
    });
  };

  const getTargetPlansLabel = (code: DiscountCode) => {
    const names =
      code.packages
        ?.map((item) =>
          item.packageId ? packageNameById.get(item.packageId) : undefined
        )
        .filter(Boolean) ?? [];

    if (names.length === 0) {
      return t("discountCodes.table.allPlans");
    }

    if (names.length <= 2) {
      return names.join("، ");
    }

    return t("discountCodes.table.plansCount", { count: names.length });
  };

  return (
    <>
      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <IconSearch className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              placeholder={t("discountCodes.table.searchPlaceholder")}
              className="pr-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold">
              {t("discountCodes.table.typeFilter")}
            </span>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as DiscountCodesQueryParams["type"])
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("discountCodes.table.typeAll")}
                </SelectItem>
                <SelectItem value="global">
                  {t("discountCodes.types.global")}
                </SelectItem>
                <SelectItem value="personal">
                  {t("discountCodes.types.personal")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={applyFilters}>
              {t("discountCodes.table.applyFilters")}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>{t("discountCodes.table.code")}</TableHead>
                <TableHead className="text-center">
                  {t("discountCodes.table.type")}
                </TableHead>
                <TableHead className="text-center">
                  {t("discountCodes.table.discount")}
                </TableHead>
                <TableHead className="text-center">
                  {t("discountCodes.table.plans")}
                </TableHead>
                <TableHead className="text-center">
                  {t("discountCodes.table.capacity")}
                </TableHead>
                <TableHead className="text-center">
                  {t("discountCodes.table.expiry")}
                </TableHead>
                <TableHead className="text-center">
                  {t("discountCodes.table.status")}
                </TableHead>
                <TableHead className="text-left">
                  {t("discountCodes.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-muted-foreground py-12 text-center"
                  >
                    {t("discountCodes.table.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((code, index) => {
                  const status = getStatus(code);
                  return (
                    <TableRow key={code.uuid ?? code.code}>
                      <TableCell className="text-center">
                        {((meta?.page ?? 1) - 1) * (filters.limit ?? 10) +
                          index +
                          1}
                      </TableCell>
                      <TableCell dir="ltr" className="font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <span>{code.code}</span>
                          {code.showNotification && (
                            <IconBell className="size-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            code.type === "global" ? "default" : "secondary"
                          }
                        >
                          {t(`discountCodes.types.${code.type}`)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-primary text-center font-bold"
                        dir="ltr"
                      >
                        {getDiscountRange(code)}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {getTargetPlansLabel(code)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {code.capacity.toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {code.expiresAt
                          ? new Date(code.expiresAt).toLocaleDateString("fa-IR")
                          : t("discountCodes.table.noExpiry")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            status === "active" ? "outline" : "destructive"
                          }
                        >
                          {t(`discountCodes.status.${status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReportTargetId(code.id)}
                            title={t("discountCodes.table.viewReport")}
                          >
                            <IconChartBar className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.pageCount > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-muted-foreground text-sm">
              {t("discountCodes.table.pageInfo", {
                page: meta.page,
                totalPages: meta.pageCount,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPreviousPage}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    page: Math.max(1, (filters.page ?? 1) - 1),
                  })
                }
              >
                {t("discountCodes.table.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    page: (filters.page ?? 1) + 1,
                  })
                }
              >
                {t("discountCodes.table.next")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <DiscountCodeReportDialog
        discountCodeId={reportTargetId}
        open={Boolean(reportTargetId)}
        onOpenChange={(open) => {
          if (!open) {
            setReportTargetId(undefined);
          }
        }}
      />
    </>
  );
}
