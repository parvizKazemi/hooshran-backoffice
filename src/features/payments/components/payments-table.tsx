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
import { IconDotsVertical, IconEye } from "@tabler/icons-react";
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
import { Payment, PaymentsQueryParams } from "../types";

type PaymentsTableProps = {
  data: Payment[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: PaymentsQueryParams;
  onFiltersChange?: (filters: PaymentsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const PaymentsTable = memo(function PaymentsTable({
  data,
  isLoading = false,
  filters = {},
  onFiltersChange,
  pagination,
}: PaymentsTableProps) {
  const { t } = useTranslation("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "PENDING" | "SUCCESS" | "FAILED"
  >((filters.status as "all" | "PENDING" | "SUCCESS" | "FAILED") || "all");
  const [typeFilter, setTypeFilter] = useState<"all" | "PACKAGE" | "SERVICE">(
    (filters.type as "all" | "PACKAGE" | "SERVICE") || "all"
  );

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setStatusFilter(
      (filters.status as "all" | "PENDING" | "SUCCESS" | "FAILED") || "all"
    );
    setTypeFilter((filters.type as "all" | "PACKAGE" | "SERVICE") || "all");
  }, [filters]);

  const applyFilters = useMemo(
    () => (newFilters: Partial<PaymentsQueryParams>) => {
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

  const statusLabels: Record<string, string> = {
    PENDING: t("payments.statuses.pending"),
    SUCCESS: t("payments.statuses.success"),
    FAILED: t("payments.statuses.failed"),
  };

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    PENDING: "outline",
    SUCCESS: "default",
    FAILED: "destructive",
  };

  const columns: ColumnDef<Payment>[] = useMemo(
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
        accessorKey: "id",
        header: t("payments.table.id"),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "user_name",
        header: t("payments.table.user"),
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{payment.user_name || "-"}</span>
              {payment.user_phone && (
                <span className="text-muted-foreground text-xs">
                  {payment.user_phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: t("payments.table.amount"),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.amount.toLocaleString()} {t("payments.rial")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("payments.table.status"),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={statusVariants[status] || "outline"}>
              {statusLabels[status] || status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "type",
        header: t("payments.table.type"),
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant="secondary">
              {type === "PACKAGE"
                ? t("payments.types.package")
                : t("payments.types.service")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "paid_at",
        header: t("payments.table.paidAt"),
        cell: ({ row }) => {
          const paidAt = row.original.paid_at;
          return paidAt ? new Date(paidAt).toLocaleDateString("fa-IR") : "-";
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
                <IconEye className="mr-2 size-4" />
                {t("payments.actions.view")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, statusLabels, statusVariants]
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
          placeholder={t("payments.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              const typedValue = value as
                | "all"
                | "PENDING"
                | "SUCCESS"
                | "FAILED";
              setStatusFilter(typedValue);
              applyFilters({
                status:
                  typedValue === "all"
                    ? undefined
                    : (typedValue as Payment["status"]),
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("payments.allStatuses")}</SelectItem>
              <SelectItem value="PENDING">
                {t("payments.statuses.pending")}
              </SelectItem>
              <SelectItem value="SUCCESS">
                {t("payments.statuses.success")}
              </SelectItem>
              <SelectItem value="FAILED">
                {t("payments.statuses.failed")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              const typedValue = value as "all" | "PACKAGE" | "SERVICE";
              setTypeFilter(typedValue);
              applyFilters({
                type:
                  typedValue === "all"
                    ? undefined
                    : (typedValue as Payment["type"]),
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("payments.allTypes")}</SelectItem>
              <SelectItem value="PACKAGE">
                {t("payments.types.package")}
              </SelectItem>
              <SelectItem value="SERVICE">
                {t("payments.types.service")}
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
                  {t("payments.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm">
            {t("payments.page")} {pagination.page} {t("payments.of")}{" "}
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
              {t("payments.prev")}
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
              {t("payments.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
