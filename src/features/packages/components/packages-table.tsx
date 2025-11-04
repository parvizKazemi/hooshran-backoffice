import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useDeletePackage } from "../hooks/use-packages";
import { Package, PackagesQueryParams } from "../types";
import { PackageForm } from "./package-form";

type PackagesTableProps = {
  data: Package[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: PackagesQueryParams;
  onFiltersChange?: (filters: PackagesQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const PackagesTable = memo(function PackagesTable({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: PackagesTableProps) {
  const { t } = useTranslation("common");
  const deletePackage = useDeletePackage();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [typeFilter, setTypeFilter] = useState(filters.type || "all");
  const [isActiveFilter, setIsActiveFilter] = useState<string>(
    filters.is_active !== undefined ? String(filters.is_active) : ""
  );

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setTypeFilter(filters.type || "all");
    setIsActiveFilter(
      filters.is_active !== undefined ? String(filters.is_active) : ""
    );
  }, [filters]);

  const applyFilters = useMemo(
    () => (newFilters: Partial<PackagesQueryParams>) => {
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

  const columns: ColumnDef<Package>[] = useMemo(
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
        accessorKey: "credit_amount",
        header: t("packages.table.creditAmount"),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.credit_amount} {t("packages.credit")}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: t("packages.table.price"),
        cell: ({ row }) => (
          <span>
            {row.original.price.toLocaleString()} {t("packages.rial")}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: t("packages.table.type"),
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant={type === "PERMANENT" ? "default" : "secondary"}>
              {type === "PERMANENT"
                ? t("packages.types.permanent")
                : t("packages.types.subscription")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "duration_days",
        header: t("packages.table.duration"),
        cell: ({ row }) => {
          const days = row.original.duration_days;
          return days ? `${days} ${t("packages.days")}` : "-";
        },
      },
      {
        accessorKey: "is_active",
        header: t("packages.table.status"),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active
              ? t("packages.statuses.active")
              : t("packages.statuses.inactive")}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const pkg = row.original;
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
                    setEditingPackage(pkg);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  {t("packages.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(t("packages.confirmDelete"))) {
                      deletePackage.mutate(pkg.id, {
                        onSuccess: () => onRefresh?.(),
                      });
                    }
                  }}
                  className="text-destructive"
                >
                  <IconTrash className="mr-2 size-4" />
                  {t("packages.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, deletePackage, onRefresh]
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
            placeholder={t("packages.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                applyFilters({
                  type:
                    value === "all" ? undefined : (value as Package["type"]),
                });
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("packages.allTypes")}</SelectItem>
                <SelectItem value="PERMANENT">
                  {t("packages.types.permanent")}
                </SelectItem>
                <SelectItem value="SUBSCRIPTION">
                  {t("packages.types.subscription")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isActiveFilter || "all"}
              onValueChange={(value) => {
                setIsActiveFilter(value === "all" ? "" : value);
                applyFilters({
                  is_active: value === "all" ? undefined : value === "true",
                });
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("packages.allStatuses")}</SelectItem>
                <SelectItem value="true">
                  {t("packages.statuses.active")}
                </SelectItem>
                <SelectItem value="false">
                  {t("packages.statuses.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingPackage(null);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconPlus className="mr-2 size-4" />
                  {t("packages.addPackage")}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    {editingPackage
                      ? t("packages.editPackage")
                      : t("packages.addNewPackage")}
                  </DrawerTitle>
                  <DrawerDescription>
                    {editingPackage
                      ? t("packages.editPackageInfo")
                      : t("packages.addPackageInfo")}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <PackageForm
                    package={editingPackage || undefined}
                    onSuccess={() => {
                      setIsDrawerOpen(false);
                      setEditingPackage(null);
                      onRefresh?.();
                    }}
                    onCancel={() => setIsDrawerOpen(false)}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                    {t("packages.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground text-sm">
              {t("packages.page")} {pagination.page} {t("packages.of")}{" "}
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
                {t("packages.prev")}
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
                {t("packages.next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
