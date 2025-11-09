import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserCreditLogs } from "../hooks/use-user-credits";
import { UserCredit, UserCreditsQueryParams } from "../types";
import { UserCreditLogsTable } from "./user-credit-logs-table";

type UserCreditsTableProps = {
  data: UserCredit[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: UserCreditsQueryParams;
  onFiltersChange?: (filters: UserCreditsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const UserCreditsTable = memo(function UserCreditsTable({
  data,
  isLoading = false,
  filters = {},
  onFiltersChange,
  pagination,
}: UserCreditsTableProps) {
  const { t } = useTranslation("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "ADMIN" | "PURCHASE" | "GIFT" | "REFERRAL" | "SYSTEM"
  >(
    (filters.source as
      | "all"
      | "ADMIN"
      | "PURCHASE"
      | "GIFT"
      | "REFERRAL"
      | "SYSTEM") || "all"
  );

  // Keep latest filters in ref to avoid infinite loops
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const { data: logsData } = useUserCreditLogs({
    user_id: selectedUser || undefined,
    page: 1,
    take: 50,
  });

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setSourceFilter(
      (filters.source as
        | "all"
        | "ADMIN"
        | "PURCHASE"
        | "GIFT"
        | "REFERRAL"
        | "SYSTEM") || "all"
    );
  }, [filters]);

  const applyFilters = useCallback(
    (newFilters: Partial<UserCreditsQueryParams>) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...filtersRef.current,
          ...newFilters,
          page: 1,
        });
      }
    },
    [onFiltersChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ q: searchQuery || undefined });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, applyFilters]);

  const sourceLabels: Record<string, string> = {
    PURCHASE: t("userCredits.sources.purchase"),
    GIFT: t("userCredits.sources.gift"),
    REFERRAL: t("userCredits.sources.referral"),
    SYSTEM: t("userCredits.sources.system"),
    ADMIN: t("userCredits.sources.admin"),
  };

  const columns: ColumnDef<UserCredit>[] = useMemo(
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
        accessorKey: "user_name",
        header: t("userCredits.table.user"),
        cell: ({ row }) => {
          const credit = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{credit.user_name || "-"}</span>
              {credit.user_phone && (
                <span className="text-muted-foreground text-xs">
                  {credit.user_phone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "credit_amount",
        header: t("userCredits.table.amount"),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.credit_amount} {t("userCredits.credit")}
          </span>
        ),
      },
      {
        accessorKey: "source",
        header: t("userCredits.table.source"),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {sourceLabels[row.original.source] || row.original.source}
          </Badge>
        ),
      },
      {
        accessorKey: "paid_amount",
        header: t("userCredits.table.paidAmount"),
        cell: ({ row }) => {
          const amount = row.original.paid_amount;
          return amount
            ? `${amount.toLocaleString()} ${t("userCredits.rial")}`
            : "-";
        },
      },
      {
        accessorKey: "expires_at",
        header: t("userCredits.table.expiresAt"),
        cell: ({ row }) => {
          const expiresAt = row.original.expires_at;
          return expiresAt
            ? new Date(expiresAt).toLocaleDateString("fa-IR")
            : "-";
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const credit = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(credit.user_id);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconEye className="mr-2 size-4" />
                  {t("userCredits.actions.viewLogs")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, sourceLabels, setSelectedUser, setIsDrawerOpen]
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
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={t("userCredits.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Select
              value={sourceFilter}
              onValueChange={(value) => {
                const typedValue = value as
                  | "all"
                  | "ADMIN"
                  | "PURCHASE"
                  | "GIFT"
                  | "REFERRAL"
                  | "SYSTEM";
                setSourceFilter(typedValue);
                applyFilters({
                  source:
                    typedValue === "all"
                      ? undefined
                      : (typedValue as UserCredit["source"]),
                });
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("userCredits.source")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("userCredits.allSources")}
                </SelectItem>
                <SelectItem value="PURCHASE">
                  {t("userCredits.sources.purchase")}
                </SelectItem>
                <SelectItem value="GIFT">
                  {t("userCredits.sources.gift")}
                </SelectItem>
                <SelectItem value="REFERRAL">
                  {t("userCredits.sources.referral")}
                </SelectItem>
                <SelectItem value="SYSTEM">
                  {t("userCredits.sources.system")}
                </SelectItem>
                <SelectItem value="ADMIN">
                  {t("userCredits.sources.admin")}
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
                    {t("userCredits.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground text-sm">
              {t("userCredits.page")} {pagination.page} {t("userCredits.of")}{" "}
              {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onFiltersChange && pagination.page > 1) {
                    onFiltersChange({
                      ...filtersRef.current,
                      page: pagination.page - 1,
                    });
                  }
                }}
                disabled={pagination.page <= 1}
              >
                {t("userCredits.prev")}
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
                      ...filtersRef.current,
                      page: pagination.page + 1,
                    });
                  }
                }}
                disabled={pagination.page >= pagination.totalPages}
              >
                {t("userCredits.next")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{t("userCredits.logs.title")}</DrawerTitle>
            <DrawerDescription>
              {t("userCredits.logs.description")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto p-4">
            {logsData?.data && <UserCreditLogsTable data={logsData.data} />}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
});
