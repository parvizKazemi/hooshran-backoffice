import {
  IconDotsVertical,
  IconEdit,
  IconLink,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
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
import { useDeleteApiService } from "../hooks/use-api-services";
import { mockCategories } from "../mock-data";
import { ApiService, ApiServicesQueryParams } from "../types";
import { ApiServiceForm } from "./api-service-form";

type ApiServicesTableProps = {
  data: ApiService[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: ApiServicesQueryParams;
  onFiltersChange?: (filters: ApiServicesQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const ApiServicesTable = memo(function ApiServicesTable({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: ApiServicesTableProps) {
  const { t } = useTranslation("common");
  const deleteApiService = useDeleteApiService();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editingService, setEditingService] = useState<ApiService | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Keep latest filters in ref to avoid infinite loops
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [categoryFilter, setCategoryFilter] = useState(
    filters.category_id || ""
  );
  const [isActiveFilter, setIsActiveFilter] = useState<string>(
    filters.is_active !== undefined ? String(filters.is_active) : ""
  );

  // Update filters when props change
  useEffect(() => {
    setSearchQuery(filters.q || "");
    setCategoryFilter(filters.category_id || "");
    setIsActiveFilter(
      filters.is_active !== undefined ? String(filters.is_active) : ""
    );
  }, [filters]);

  // Apply filters to API
  const applyFilters = useCallback(
    (newFilters: Partial<ApiServicesQueryParams>) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...filtersRef.current,
          ...newFilters,
          page: 1, // Reset to first page when filtering
        });
      }
    },
    [onFiltersChange]
  );

  // Handle search with debounce (apply after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ q: searchQuery || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, applyFilters]);

  // Convert sorting to order parameter
  const orderParam = useMemo(() => {
    if (sorting.length > 0) {
      const sort = sorting[0];
      return `${sort?.id}:${sort?.desc ? "DESC" : "ASC"}`;
    }
    return undefined;
  }, [sorting]);

  // Apply order when sorting changes
  useEffect(() => {
    if (onFiltersChange && orderParam !== undefined) {
      onFiltersChange({
        ...filtersRef.current,
        order: orderParam,
      });
    }
  }, [orderParam, onFiltersChange]);

  const columns: ColumnDef<ApiService>[] = useMemo(
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
        header: t("apiServices.table.name"),
        cell: ({ row }) => {
          const service = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{service.name}</span>
              {service.english_name && (
                <span className="text-muted-foreground text-xs">
                  {service.english_name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category_name",
        header: t("apiServices.table.category"),
        cell: ({ row }) => {
          const category = row.original.category_name;
          return category ? <Badge variant="secondary">{category}</Badge> : "-";
        },
      },
      {
        accessorKey: "endpoint",
        header: t("apiServices.table.endpoint"),
        cell: ({ row }) => {
          const endpoint = row.original.endpoint;
          return endpoint ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground max-w-[200px] truncate text-sm">
                {endpoint}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => window.open(endpoint, "_blank")}
              >
                <IconLink className="size-3" />
              </Button>
            </div>
          ) : (
            "-"
          );
        },
      },
      {
        accessorKey: "is_active",
        header: t("apiServices.table.status"),
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive
                ? t("apiServices.statuses.active")
                : t("apiServices.statuses.inactive")}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const service = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">
                    {t("apiServices.actions.openMenu")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingService(service);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  {t("apiServices.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(t("apiServices.confirmDelete"))) {
                      deleteApiService.mutate(service.id, {
                        onSuccess: () => {
                          onRefresh?.();
                        },
                      });
                    }
                  }}
                  className="text-destructive"
                >
                  <IconTrash className="mr-2 size-4" />
                  {t("apiServices.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, deleteApiService, onRefresh, setEditingService, setIsDrawerOpen]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleCreateService = () => {
    setEditingService(null);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingService(null);
  };

  const handleFormSuccess = () => {
    handleDrawerClose();
    onRefresh?.();
  };

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={t("apiServices.search")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => {
                setCategoryFilter(value === "all" ? "" : value);
                applyFilters({
                  category_id: value === "all" ? undefined : value,
                });
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("apiServices.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("apiServices.allCategories")}
                </SelectItem>
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
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
                <SelectValue placeholder={t("apiServices.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("apiServices.allStatuses")}
                </SelectItem>
                <SelectItem value="true">
                  {t("apiServices.statuses.active")}
                </SelectItem>
                <SelectItem value="false">
                  {t("apiServices.statuses.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button onClick={handleCreateService}>
                  <IconPlus className="mr-2 size-4" />
                  {t("apiServices.addService")}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    {editingService
                      ? t("apiServices.editService")
                      : t("apiServices.addNewService")}
                  </DrawerTitle>
                  <DrawerDescription>
                    {editingService
                      ? t("apiServices.editServiceInfo")
                      : t("apiServices.addServiceInfo")}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <ApiServiceForm
                    service={editingService || undefined}
                    onSuccess={handleFormSuccess}
                    onCancel={handleDrawerClose}
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
                    {t("apiServices.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground flex-1 text-sm">
            {t("apiServices.selectedRows", {
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
                  {t("apiServices.prev")}
                </Button>
                <div className="text-muted-foreground text-sm">
                  {t("apiServices.page")} {pagination.page}{" "}
                  {t("apiServices.of")} {pagination.totalPages} (
                  {pagination.total} {t("apiServices.items")})
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
                  {t("apiServices.next")}
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
            {!pagination && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {t("apiServices.prev")}
                </Button>
                <div className="text-muted-foreground text-sm">
                  {t("apiServices.page")}{" "}
                  {table.getState().pagination.pageIndex + 1}{" "}
                  {t("apiServices.of")} {table.getPageCount()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t("apiServices.next")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      {editingService && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("apiServices.editService")}</DrawerTitle>
              <DrawerDescription>
                {t("apiServices.editServiceInfo")}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <ApiServiceForm
                service={editingService}
                onSuccess={handleFormSuccess}
                onCancel={handleDrawerClose}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
});
