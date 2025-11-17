import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteUser } from "../hooks/use-users";
import { User, UsersQueryParams } from "../types";
import { UserForm } from "./user-form";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Keep latest filters in ref to avoid infinite loops
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(
    filters.search || filters.q || ""
  );
  const [qQuery, setQQuery] = useState(filters.q || "");
  const [roleFilter, setRoleFilter] = useState(filters.role || "");
  const [phoneFilter, setPhoneFilter] = useState(filters.phoneNumber || "");
  const [isActiveFilter, setIsActiveFilter] = useState<string>(
    filters.isActive !== undefined ? String(filters.isActive) : ""
  );
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");
  const [sortBy, setSortBy] = useState(filters.sortBy || "");

  // Debounce search query (1 second)
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const debouncedQ = useDebounce(qQuery, 1000);

  // Update filters when props change
  useEffect(() => {
    setSearchQuery(filters.search || filters.q || "");
    setQQuery(filters.q || "");
    setRoleFilter(filters.role || "");
    setPhoneFilter(filters.phoneNumber || "");
    setIsActiveFilter(
      filters.isActive !== undefined ? String(filters.isActive) : ""
    );
    setDateFrom(filters.dateFrom || "");
    setDateTo(filters.dateTo || "");
    setSortBy(filters.sortBy || "");
  }, [filters]);

  // Apply filters to API
  const applyFilters = useCallback(
    (newFilters: Partial<UsersQueryParams>) => {
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

  // Handle debounced search
  useEffect(() => {
    applyFilters({ search: debouncedSearch || undefined });
  }, [debouncedSearch, applyFilters]);

  // Handle debounced q query
  useEffect(() => {
    applyFilters({ q: debouncedQ || undefined });
  }, [debouncedQ, applyFilters]);

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

  const columns: ColumnDef<User>[] = useMemo(
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
        accessorKey: "fullName",
        header: t("users.name"),
        cell: ({ row }) => {
          const user = row.original;
          const name =
            user.profile?.full_name ||
            user.fullName ||
            user.name ||
            user.phoneNumber ||
            t("users.noName");
          const initials =
            name
              .split(" ")
              .map((n) => n?.[0] || "")
              .filter(Boolean)
              .join("")
              .toUpperCase()
              .slice(0, 2) || "N/A";
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                {user.email && (
                  <span className="text-muted-foreground text-sm">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: t("users.phone"),
        cell: ({ row }) => {
          const phone = row.original.phoneNumber || row.original.phone;
          return phone || "-";
        },
      },
      {
        accessorKey: "role",
        header: t("users.role"),
        cell: ({ row }) => {
          const role = row.original.role || "user";
          const roleLabels: Record<string, string> = {
            admin: t("users.roles.admin"),
            ADMIN: t("users.roles.ADMIN"),
            moderator: t("users.roles.moderator"),
            user: t("users.roles.user"),
            USER: t("users.roles.USER"),
          };
          const roleVariants: Record<
            string,
            "default" | "secondary" | "outline"
          > = {
            admin: "default",
            ADMIN: "default",
            moderator: "secondary",
            user: "outline",
            USER: "outline",
          };
          return (
            <Badge variant={roleVariants[role] || "outline"}>
              {roleLabels[role] || role}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("users.status"),
        cell: ({ row }) => {
          const user = row.original;
          // Use isActive if available, otherwise fall back to status
          const isActive =
            user.isActive !== undefined
              ? user.isActive
              : user.status === "active";
          const status = user.status || (isActive ? "active" : "inactive");

          const statusLabels: Record<string, string> = {
            active: t("users.statuses.active"),
            inactive: t("users.statuses.inactive"),
            suspended: t("users.statuses.suspended"),
          };
          const statusVariants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
          > = {
            active: "default",
            inactive: "secondary",
            suspended: "destructive",
          };
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
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">{t("users.actions.openMenu")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingUser(user);
                    setIsDrawerOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  {t("users.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (!user.uuid) return;
                    setUserToDelete(user);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <IconTrash className="mr-2 size-4" />
                  {t("users.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, deleteUser, onRefresh, setEditingUser, setIsDrawerOpen]
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

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingUser(null);
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
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder={t("users.search")}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="max-w-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                جستجوی پیشرفته
                {showAdvancedFilters ? (
                  <IconChevronUp className="size-4" />
                ) : (
                  <IconChevronDown className="size-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button onClick={handleCreateUser}>
                    <IconPlus className="mr-2 size-4" />
                    {t("users.addUser")}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>
                      {editingUser
                        ? t("users.editUser")
                        : t("users.addNewUser")}
                    </DrawerTitle>
                    <DrawerDescription>
                      {editingUser
                        ? t("users.editUserInfo")
                        : t("users.addUserInfo")}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4">
                    <UserForm
                      user={editingUser || undefined}
                      onSuccess={handleFormSuccess}
                      onCancel={handleDrawerClose}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          {/* Advanced Filters Row - Collapsible */}
          {showAdvancedFilters && (
            <div className="bg-muted/30 animate-in slide-in-from-top-2 flex flex-col gap-4 rounded-md border p-4 duration-200">
              <div className="flex flex-wrap gap-4">
                <Input
                  type="text"
                  placeholder="جستجو (q)"
                  value={qQuery}
                  onChange={(event) => setQQuery(event.target.value)}
                  className="min-w-[200px] flex-1"
                />
                <Input
                  placeholder={t("users.phonePlaceholder")}
                  value={phoneFilter}
                  onChange={(event) => {
                    setPhoneFilter(event.target.value);
                    applyFilters({
                      phoneNumber: event.target.value || undefined,
                    });
                  }}
                  className="min-w-[200px] flex-1"
                />
                <Select
                  value={roleFilter || "all"}
                  onValueChange={(value) => {
                    setRoleFilter(value === "all" ? "" : value);
                    applyFilters({
                      role: value === "all" ? undefined : value,
                    });
                  }}
                >
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder={t("users.role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("users.allRoles")}</SelectItem>
                    <SelectItem value="USER">
                      {t("users.roles.USER")}
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      {t("users.roles.ADMIN")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {t("users.roles.admin")}
                    </SelectItem>
                    <SelectItem value="moderator">
                      {t("users.roles.moderator")}
                    </SelectItem>
                    <SelectItem value="user">
                      {t("users.roles.user")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={isActiveFilter || "all"}
                  onValueChange={(value) => {
                    setIsActiveFilter(value === "all" ? "" : value);
                    applyFilters({
                      isActive: value === "all" ? undefined : value === "true",
                    });
                  }}
                >
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder={t("users.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("users.allStatuses")}
                    </SelectItem>
                    <SelectItem value="true">
                      {t("users.statuses.active")}
                    </SelectItem>
                    <SelectItem value="false">
                      {t("users.statuses.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-4">
                <Input
                  type="date"
                  placeholder="از تاریخ"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    applyFilters({
                      dateFrom: event.target.value || undefined,
                    });
                  }}
                  className="min-w-[200px]"
                />
                <Input
                  type="date"
                  placeholder="تا تاریخ"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    applyFilters({
                      dateTo: event.target.value || undefined,
                    });
                  }}
                  className="min-w-[200px]"
                />
                <Select
                  value={sortBy || "all"}
                  onValueChange={(value) => {
                    setSortBy(value === "all" ? "" : value);
                    applyFilters({
                      sortBy: value === "all" ? undefined : value,
                    });
                  }}
                >
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="مرتب‌سازی بر اساس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="createdAt">تاریخ ایجاد</SelectItem>
                    <SelectItem value="updatedAt">تاریخ به‌روزرسانی</SelectItem>
                    <SelectItem value="phoneNumber">شماره تلفن</SelectItem>
                    <SelectItem value="full_name">نام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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
                    {t("users.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground flex-1 text-sm">
            {t("users.selectedRows", {
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
                        ...filters,
                        page: pagination.page - 1,
                      });
                    }
                  }}
                  disabled={pagination.page <= 1}
                >
                  {t("users.prev")}
                </Button>
                <div className="text-muted-foreground text-sm">
                  {t("users.page")} {pagination.page} {t("users.of")}{" "}
                  {pagination.totalPages} ({pagination.total} {t("users.items")}
                  )
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
                        ...filters,
                        page: pagination.page + 1,
                      });
                    }
                  }}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  {t("users.next")}
                </Button>
                <Select
                  value={String(pagination.take)}
                  onValueChange={(value) => {
                    if (onFiltersChange) {
                      onFiltersChange({
                        ...filters,
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
                  {t("users.prev")}
                </Button>
                <div className="text-muted-foreground text-sm">
                  {t("users.page")} {table.getState().pagination.pageIndex + 1}{" "}
                  {t("users.of")} {table.getPageCount()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t("users.next")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      {editingUser && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("users.editUser")}</DrawerTitle>
              <DrawerDescription>{t("users.editUserInfo")}</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <UserForm
                user={editingUser}
                onSuccess={handleFormSuccess}
                onCancel={handleDrawerClose}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف کاربر{" "}
              <strong>
                {userToDelete?.profile?.full_name ||
                  userToDelete?.fullName ||
                  userToDelete?.phoneNumber ||
                  "این کاربر"}
              </strong>{" "}
              اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete?.uuid) {
                  deleteUser.mutate(userToDelete.uuid, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setUserToDelete(null);
                      onRefresh?.();
                    },
                    onError: () => {
                      setDeleteDialogOpen(false);
                      setUserToDelete(null);
                    },
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
