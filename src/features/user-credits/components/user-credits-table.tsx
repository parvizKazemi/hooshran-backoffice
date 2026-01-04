import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconDotsVertical, IconEye, IconEdit } from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserCredit, UserCreditsQueryParams } from "../types";
import { UserCreditDetail } from "./user-credit-detail";
import { UserCreditForm } from "./user-credit-form";

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
  const [selectedCredit, setSelectedCredit] = useState<UserCredit | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<UserCredit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Keep latest filters in ref to avoid infinite loops
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const statusLabels: Record<string, string> = {
    active: t("userCredits.statuses.active"),
    used: t("userCredits.statuses.used"),
    expired: t("userCredits.statuses.expired"),
  };

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    used: "secondary",
    expired: "destructive",
  };

  const typeLabels: Record<string, string> = {
    PURCHASE: t("userCredits.types.purchase"),
    GIFT: t("userCredits.types.gift"),
    REFERRAL: t("userCredits.types.referral"),
    SYSTEM: t("userCredits.types.system"),
    ADMIN: t("userCredits.types.admin"),
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
        accessorKey: "userPhoneNumber",
        header: t("userCredits.table.userPhone"),
        cell: ({ row }) => {
          const credit = row.original;
          return (
            <span className="font-mono text-sm">
              {credit.userPhoneNumber || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "creditBalance",
        header: t("userCredits.table.creditBalance"),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.creditBalance} {t("userCredits.credit")}
          </span>
        ),
      },
      {
        accessorKey: "creditAmount",
        header: t("userCredits.table.creditAmount"),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.creditAmount} {t("userCredits.credit")}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: t("userCredits.table.type"),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {typeLabels[row.original.type] || row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("userCredits.table.purchaseTime"),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex flex-col">
              <span>{date.toLocaleDateString("fa-IR")}</span>
              <span className="text-muted-foreground text-xs">
                {date.toLocaleTimeString("fa-IR")}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "expiresAt",
        header: t("userCredits.table.expiresAt"),
        cell: ({ row }) => {
          const date = new Date(row.original.expiresAt);
          return (
            <div className="flex flex-col">
              <span>{date.toLocaleDateString("fa-IR")}</span>
              <span className="text-muted-foreground text-xs">
                {date.toLocaleTimeString("fa-IR")}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("userCredits.table.status"),
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
        id: "actions",
        cell: ({ row }) => {
          const credit = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">
                    {t("userCredits.actions.openMenu")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCredit(credit);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <IconEye className="mr-2 size-4" />
                  {t("userCredits.actions.view")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingCredit(credit);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  {t("userCredits.actions.edit")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, statusLabels, statusVariants, typeLabels]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
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

        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground flex-1 text-sm">
            {t("userCredits.selectedRows", {
              selected: table.getFilteredSelectedRowModel().rows.length,
              total:
                pagination?.total || table.getFilteredRowModel().rows.length,
            })}
          </div>
          <div className="flex items-center gap-2">
            {pagination && (
              <>
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
                <div className="text-muted-foreground text-sm">
                  {t("userCredits.page")} {pagination.page}{" "}
                  {t("userCredits.of")} {pagination.totalPages} (
                  {pagination.total} {t("userCredits.items")})
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
                        ...filtersRef.current,
                        page: pagination.page + 1,
                      });
                    }
                  }}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  {t("userCredits.next")}
                </Button>
                <Select
                  value={String(pagination.take)}
                  onValueChange={(value) => {
                    if (onFiltersChange) {
                      onFiltersChange({
                        ...filtersRef.current,
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
            )}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("userCredits.detail.title")}</DialogTitle>
            <DialogDescription>
              {selectedCredit?.uuid || selectedCredit?.userPhoneNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            {selectedCredit && <UserCreditDetail credit={selectedCredit} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("userCredits.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("userCredits.edit.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {editingCredit && (
              <UserCreditForm
                credit={editingCredit}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setEditingCredit(null);
                  // onRefresh?.();
                }}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingCredit(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
