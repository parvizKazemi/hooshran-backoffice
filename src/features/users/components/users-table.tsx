import {
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
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteUser } from "../hooks/use-users";
import { User, UsersQueryParams } from "../types";
import { UserCreateDrawer } from "./dialogs/user-create-drawer";
import { UserDeleteDialog } from "./dialogs/user-delete-dialog";
import { UserEditDrawer } from "./dialogs/user-edit-drawer";
import { UsersTableFilters } from "./filters/users-table-filters";
import { useUsersFilters } from "./hooks/use-users-filters";
import { useUsersTableState } from "./hooks/use-users-table-state";
import { UsersTablePagination } from "./pagination/users-table-pagination";
import { useUsersTableColumns } from "./table/users-table-columns";
import { UsersTableLoading } from "./table/users-table-loading";

type UsersTableProps = {
  data: User[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: UsersQueryParams;
  onFiltersChange?: (filters: UsersQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export function UsersTable({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: UsersTableProps) {
  const { t } = useTranslation("common");
  const deleteUser = useDeleteUser();

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Custom hooks
  const filtersState = useUsersFilters(filters, onFiltersChange);
  const tableState = useUsersTableState();

  // Convert sorting to order parameter
  const orderParam = useMemo(() => {
    if (sorting.length > 0) {
      const sort = sorting[0];
      return `${sort?.id}:${sort?.desc ? "DESC" : "ASC"}`;
    }
    return undefined;
  }, [sorting]);

  // Apply order when sorting changes
  useMemo(() => {
    if (onFiltersChange && orderParam !== undefined) {
      onFiltersChange({
        ...filters,
        order: orderParam,
      });
    }
  }, [orderParam, onFiltersChange, filters]);

  // Table columns
  const columns = useUsersTableColumns({
    onEdit: tableState.handleEditUser,
    onDelete: tableState.handleDeleteUser,
  });

  // React Table instance
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

  const handleFormSuccess = useCallback(() => {
    tableState.handleDrawerClose();
    onRefresh?.();
  }, [tableState, onRefresh]);

  const handleDeleteConfirm = useCallback(() => {
    if (tableState.userToDelete?.uuid) {
      deleteUser.mutate(tableState.userToDelete.uuid, {
        onSuccess: () => {
          tableState.handleDeleteDialogClose();
          onRefresh?.();
        },
        onError: () => {
          tableState.handleDeleteDialogClose();
        },
      });
    }
  }, [tableState, deleteUser, onRefresh]);

  const handleToggleAdvancedFilters = useCallback(() => {
    filtersState.setShowAdvancedFilters((prev) => !prev);
  }, [filtersState.setShowAdvancedFilters]);

  return (
    <>
      <div className="space-y-4">
        {/* Filters Section - Always visible */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <UsersTableFilters
            searchQuery={filtersState.searchQuery}
            onSearchChange={filtersState.setSearchQuery}
            showAdvancedFilters={filtersState.showAdvancedFilters}
            onToggleAdvancedFilters={handleToggleAdvancedFilters}
            phoneFilter={filtersState.phoneFilter}
            onPhoneFilterChange={filtersState.setPhoneFilter}
            roleFilter={filtersState.roleFilter}
            onRoleFilterChange={filtersState.setRoleFilter}
            isActiveFilter={filtersState.isActiveFilter}
            onIsActiveFilterChange={filtersState.setIsActiveFilter}
            dateFrom={filtersState.dateFrom}
            onDateFromChange={filtersState.setDateFrom}
            dateTo={filtersState.dateTo}
            onDateToChange={filtersState.setDateTo}
            sortBy={filtersState.sortBy}
            onSortByChange={filtersState.setSortBy}
            onApplyFilters={filtersState.applyFilters}
          />
          <UserCreateDrawer
            open={tableState.isDrawerOpen && !tableState.editingUser}
            onOpenChange={tableState.setIsDrawerOpen}
            onSuccess={handleFormSuccess}
            onCancel={tableState.handleDrawerClose}
            onCreateClick={tableState.handleCreateUser}
          />
        </div>

        {/* Table - Show loading or actual table */}
        {isLoading ? (
          <UsersTableLoading />
        ) : (
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
                      {t("users.noResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <UsersTablePagination
          table={table}
          pagination={pagination}
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* Dialogs */}
      <UserEditDrawer
        open={tableState.isDrawerOpen && !!tableState.editingUser}
        onOpenChange={tableState.setIsDrawerOpen}
        user={tableState.editingUser}
        onSuccess={handleFormSuccess}
        onCancel={tableState.handleDrawerClose}
      />

      <UserDeleteDialog
        open={tableState.deleteDialogOpen}
        onOpenChange={tableState.setDeleteDialogOpen}
        user={tableState.userToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
