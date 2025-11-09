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
import { UtmAnalyticsQueryParams, UtmEvent } from "../types";

type UtmAnalyticsTableProps = {
  data: UtmEvent[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: UtmAnalyticsQueryParams;
  onFiltersChange?: (filters: UtmAnalyticsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const UtmAnalyticsTable = memo(function UtmAnalyticsTable({
  data,
  isLoading = false,
  filters = {},
  onFiltersChange,
  pagination,
}: UtmAnalyticsTableProps) {
  const { t } = useTranslation("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [eventTypeFilter, setEventTypeFilter] = useState<
    "signup" | "signin" | "purchase" | "all"
  >((filters.event_type as "signup" | "signin" | "purchase" | "all") || "all");

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setEventTypeFilter(
      (filters.event_type as "signup" | "signin" | "purchase" | "all") || "all"
    );
  }, [filters]);

  const applyFilters = useMemo(
    () => (newFilters: Partial<UtmAnalyticsQueryParams>) => {
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

  const eventTypeLabels: Record<string, string> = {
    signup: t("utmAnalytics.eventTypes.signup"),
    signin: t("utmAnalytics.eventTypes.signin"),
    purchase: t("utmAnalytics.eventTypes.purchase"),
  };

  const columns: ColumnDef<UtmEvent>[] = useMemo(
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
        accessorKey: "event_type",
        header: t("utmAnalytics.table.eventType"),
        cell: ({ row }) => {
          const type = row.original.event_type;
          return (
            <Badge variant="secondary">{eventTypeLabels[type] || type}</Badge>
          );
        },
      },
      {
        accessorKey: "user_name",
        header: t("utmAnalytics.table.user"),
        cell: ({ row }) => {
          const event = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{event.user_name || "-"}</span>
              {event.user_phone && (
                <span className="text-muted-foreground text-xs">
                  {event.user_phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "source",
        header: t("utmAnalytics.table.source"),
        cell: ({ row }) => row.original.source || "-",
      },
      {
        accessorKey: "medium",
        header: t("utmAnalytics.table.medium"),
        cell: ({ row }) => row.original.medium || "-",
      },
      {
        accessorKey: "campaign",
        header: t("utmAnalytics.table.campaign"),
        cell: ({ row }) => row.original.campaign || "-",
      },
      {
        accessorKey: "createdAt",
        header: t("utmAnalytics.table.date"),
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("fa-IR"),
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
                {t("utmAnalytics.actions.view")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, eventTypeLabels]
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
          placeholder={t("utmAnalytics.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Select
            value={eventTypeFilter}
            onValueChange={(value) => {
              setEventTypeFilter(
                value as "signup" | "signin" | "purchase" | "all"
              );
              applyFilters({
                event_type:
                  value === "all"
                    ? undefined
                    : (value as UtmEvent["event_type"]),
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("utmAnalytics.allEventTypes")}
              </SelectItem>
              <SelectItem value="signup">
                {t("utmAnalytics.eventTypes.signup")}
              </SelectItem>
              <SelectItem value="signin">
                {t("utmAnalytics.eventTypes.signin")}
              </SelectItem>
              <SelectItem value="purchase">
                {t("utmAnalytics.eventTypes.purchase")}
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
                  {t("utmAnalytics.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm">
            {t("utmAnalytics.page")} {pagination.page} {t("utmAnalytics.of")}{" "}
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
              {t("utmAnalytics.prev")}
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
              {t("utmAnalytics.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
