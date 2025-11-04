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
import { useDeleteCategory } from "../hooks/use-categories";
import { Category, CategoriesQueryParams } from "../types";
import { CategoryForm } from "./category-form";

type CategoriesTableProps = {
  data: Category[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: CategoriesQueryParams;
  onFiltersChange?: (filters: CategoriesQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const CategoriesTable = memo(function CategoriesTable({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: CategoriesTableProps) {
  const { t } = useTranslation("common");
  const deleteCategory = useDeleteCategory();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [isActiveFilter, setIsActiveFilter] = useState<string>(
    filters.is_active !== undefined ? String(filters.is_active) : ""
  );

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setIsActiveFilter(
      filters.is_active !== undefined ? String(filters.is_active) : ""
    );
  }, [filters]);

  const applyFilters = useMemo(
    () => (newFilters: Partial<CategoriesQueryParams>) => {
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

  const columns: ColumnDef<Category>[] = useMemo(
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
        accessorKey: "name",
        header: t("categories.table.name"),
      },
      {
        accessorKey: "slug",
        header: t("categories.table.slug"),
        cell: ({ row }) => row.original.slug || "-",
      },
      {
        accessorKey: "description",
        header: t("categories.table.description"),
        cell: ({ row }) => row.original.description || "-",
      },
      {
        accessorKey: "is_active",
        header: t("categories.table.status"),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active
              ? t("categories.statuses.active")
              : t("categories.statuses.inactive")}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const category = row.original;
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
                    setEditingCategory(category);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  {t("categories.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(t("categories.confirmDelete"))) {
                      deleteCategory.mutate(category.id, {
                        onSuccess: () => onRefresh?.(),
                      });
                    }
                  }}
                  className="text-destructive"
                >
                  <IconTrash className="mr-2 size-4" />
                  {t("categories.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, deleteCategory, onRefresh]
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
            placeholder={t("categories.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
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
                <SelectItem value="all">
                  {t("categories.allStatuses")}
                </SelectItem>
                <SelectItem value="true">
                  {t("categories.statuses.active")}
                </SelectItem>
                <SelectItem value="false">
                  {t("categories.statuses.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconPlus className="mr-2 size-4" />
                  {t("categories.addCategory")}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    {editingCategory
                      ? t("categories.editCategory")
                      : t("categories.addNewCategory")}
                  </DrawerTitle>
                  <DrawerDescription>
                    {editingCategory
                      ? t("categories.editCategoryInfo")
                      : t("categories.addCategoryInfo")}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <CategoryForm
                    category={editingCategory || undefined}
                    onSuccess={() => {
                      setIsDrawerOpen(false);
                      setEditingCategory(null);
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
                    {t("categories.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground text-sm">
              {t("categories.page")} {pagination.page} {t("categories.of")}{" "}
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
                {t("categories.prev")}
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
                {t("categories.next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
