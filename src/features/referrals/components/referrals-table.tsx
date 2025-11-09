import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { IconDotsVertical } from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReferralReward, ReferralsQueryParams } from "../types";

type ReferralsTableProps = {
  data: ReferralReward[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: ReferralsQueryParams;
  onFiltersChange?: (filters: ReferralsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const ReferralsTable = memo(function ReferralsTable({
  data,
  isLoading = false,
  filters = {},
  onFiltersChange,
  pagination,
}: ReferralsTableProps) {
  const { t } = useTranslation("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [typeFilter, setTypeFilter] = useState<"all" | "CREDIT" | "POINT">(
    (filters.reward_type as "all" | "CREDIT" | "POINT") || "all"
  );

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setTypeFilter((filters.reward_type as "all" | "CREDIT" | "POINT") || "all");
  }, [filters]);

  const applyFilters = useMemo(
    () => (newFilters: Partial<ReferralsQueryParams>) => {
      if (onFiltersChange) {
        onFiltersChange({ ...filters, ...newFilters, page: 1 });
      }
    },
    [filters, onFiltersChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ q: searchQuery || undefined });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, applyFilters]);

  const columns: ColumnDef<ReferralReward>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "referrer_name",
        header: t("referrals.table.referrer"),
        cell: ({ row }) => {
          const reward = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{reward.referrer_name || "-"}</span>
              {reward.referrer_phone && (
                <span className="text-muted-foreground text-xs">
                  {reward.referrer_phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "referred_name",
        header: t("referrals.table.referred"),
        cell: ({ row }) => {
          const reward = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{reward.referred_name || "-"}</span>
              {reward.referred_phone && (
                <span className="text-muted-foreground text-xs">
                  {reward.referred_phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "reward_type",
        header: t("referrals.table.type"),
        cell: ({ row }) => {
          const type = row.original.reward_type;
          return (
            <Badge variant={type === "CREDIT" ? "default" : "secondary"}>
              {type === "CREDIT"
                ? t("referrals.types.credit")
                : t("referrals.types.point")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "reward_amount",
        header: t("referrals.table.amount"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.reward_amount}</span>
        ),
      },
      {
        accessorKey: "received_at",
        header: t("referrals.table.receivedAt"),
        cell: ({ row }) => {
          const date = row.original.received_at;
          return date ? new Date(date).toLocaleDateString("fa-IR") : "-";
        },
      },
      {
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem disabled>
                {t("referrals.actions.view")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t("referrals.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              const typedValue = value as "all" | "CREDIT" | "POINT";
              setTypeFilter(typedValue);
              applyFilters({
                reward_type:
                  typedValue === "all"
                    ? undefined
                    : (typedValue as ReferralReward["reward_type"]),
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("referrals.allTypes")}</SelectItem>
              <SelectItem value="CREDIT">
                {t("referrals.types.credit")}
              </SelectItem>
              <SelectItem value="POINT">
                {t("referrals.types.point")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-start">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("referrals.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm">
            {t("referrals.page")} {pagination.page} {t("referrals.of")}{" "}
            {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onFiltersChange && pagination.page > 1) {
                  onFiltersChange({ ...filters, page: pagination.page - 1 });
                }
              }}
              disabled={pagination.page <= 1}
            >
              {t("referrals.prev")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  onFiltersChange &&
                  pagination.page < pagination.totalPages
                ) {
                  onFiltersChange({ ...filters, page: pagination.page + 1 });
                }
              }}
              disabled={pagination.page >= pagination.totalPages}
            >
              {t("referrals.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
