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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Package } from "@/features/packages/types";
import { cn } from "@/lib/utils";
import { IconBell, IconEdit, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  useDiscountCodeUsageCounts,
  useUpdateDiscountCode,
} from "../hooks/use-discount-codes";
import type { DiscountCode, DiscountCodesQueryParams } from "../types";
import { resolveDiscountCodeUuid } from "../types";
import { extractPackageDisplayName } from "../utils/group-packages";

type DiscountCodesTableProps = {
  data: DiscountCode[];
  packages: Package[];
  isLoading?: boolean;
  filters: DiscountCodesQueryParams;
  onFiltersChange: (filters: DiscountCodesQueryParams) => void;
  onEdit: (code: DiscountCode) => void;
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

export function DiscountCodesTable({
  data,
  packages,
  isLoading = false,
  filters,
  onFiltersChange,
  onEdit,
  meta,
}: DiscountCodesTableProps) {
  const { t } = useTranslation("common");
  const updateDiscountCode = useUpdateDiscountCode();
  const [togglingCodeUuid, setTogglingCodeUuid] = useState<string | null>(null);

  const [search, setSearch] = useState(filters.search ?? "");
  const [typeFilter, setTypeFilter] = useState<
    DiscountCodesQueryParams["type"]
  >(filters.type ?? "all");

  const packageNameByUuid = useMemo(() => {
    const map = new Map<string, string>();
    for (const pkg of packages) {
      map.set(pkg.uuid, extractPackageDisplayName(pkg.name));
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

  const codeUuids = useMemo(
    () => data.map((code) => code.uuid).filter(Boolean),
    [data]
  );
  const { usageMap, isLoading: isUsageLoading } =
    useDiscountCodeUsageCounts(codeUuids);

  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      search,
      type: typeFilter,
      page: 1,
    });
  };

  const handleToggleActive = async (
    code: DiscountCode,
    nextActive: boolean
  ) => {
    const discountCodeUuid = resolveDiscountCodeUuid(code);

    if (!discountCodeUuid) {
      toast.error(t("discountCodes.form.errors.missingCodeUuid"));
      return;
    }

    setTogglingCodeUuid(discountCodeUuid);

    try {
      await updateDiscountCode.mutateAsync({
        uuid: discountCodeUuid,
        payload: {
          isActive: nextActive,
        },
      });
      toast.success(
        t(
          nextActive
            ? "discountCodes.table.statusActivated"
            : "discountCodes.table.statusDeactivated"
        )
      );
    } catch {
      // handled in mutation hook
    } finally {
      setTogglingCodeUuid(null);
    }
  };

  const getTargetPlansLabel = (code: DiscountCode) => {
    const names =
      code.packages
        ?.map((item) => {
          if (!item.packageUuid) {
            return undefined;
          }

          const resolvedName = packageNameByUuid.get(item.packageUuid);
          return resolvedName
            ? extractPackageDisplayName(resolvedName)
            : undefined;
        })
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
                {t("discountCodes.table.usage")}
              </TableHead>
              <TableHead className="text-center">
                {t("discountCodes.table.expiry")}
              </TableHead>
              <TableHead className="text-center">
                {t("discountCodes.table.status")}
              </TableHead>
              <TableHead className="pl-6 text-left">
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
                const isToggling =
                  updateDiscountCode.isPending &&
                  togglingCodeUuid === code.uuid;

                return (
                  <TableRow
                    key={code.uuid ?? code.code}
                    className={cn(!code.isActive && "bg-muted/30 opacity-80")}
                  >
                    <TableCell className="text-center">
                      {((meta?.page ?? 1) - 1) * (filters.limit ?? 10) +
                        index +
                        1}
                    </TableCell>
                    <TableCell dir="ltr" className="font-mono font-bold">
                      <div className="flex items-center gap-2">
                        {code.showNotification && (
                          <IconBell
                            className="text-primary size-4 shrink-0"
                            aria-hidden
                            title={t("discountCodes.table.notificationEnabled")}
                          />
                        )}
                        <span>{code.code}</span>
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
                      {isUsageLoading && !usageMap.has(code.uuid) ? (
                        <Skeleton className="mx-auto h-4 w-16" />
                      ) : (
                        <span dir="ltr">
                          {(usageMap.get(code.uuid) ?? 0).toLocaleString(
                            "fa-IR"
                          )}
                          <span className="text-muted-foreground mx-1">/</span>
                          {code.capacity.toLocaleString("fa-IR")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {code.expiresAt
                        ? new Date(code.expiresAt).toLocaleDateString("fa-IR")
                        : t("discountCodes.table.noExpiry")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Switch
                          dir="ltr"
                          checked={code.isActive}
                          disabled={isToggling}
                          onCheckedChange={(checked) =>
                            handleToggleActive(code, checked)
                          }
                          aria-label={t("discountCodes.table.status")}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(code)}
                          title={t("discountCodes.table.edit")}
                        >
                          <IconEdit className="size-4" />
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
  );
}
