import { IconDotsVertical, IconEye } from "@tabler/icons-react";
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
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
import { ServiceRequest, ServiceRequestsQueryParams } from "../types";
import { ServiceRequestDetail } from "./service-request-detail";

type ServiceRequestsTableProps = {
  data: ServiceRequest[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: ServiceRequestsQueryParams;
  onFiltersChange?: (filters: ServiceRequestsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const ServiceRequestsTable = memo(function ServiceRequestsTable({
  data,
  isLoading = false,
  filters = {},
  onFiltersChange,
  pagination,
}: ServiceRequestsTableProps) {
  const { t } = useTranslation("common");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(filters.phoneNumber || "");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "PENDING" | "SUCCESS" | "FAILED" | "PROCESSING"
  >(
    (filters.status as
      | "all"
      | "PENDING"
      | "SUCCESS"
      | "FAILED"
      | "PROCESSING") || "all"
  );

  // Track the last applied search query to avoid resetting page unnecessarily
  const lastAppliedSearchRef = useRef<string>(filters.phoneNumber || "");
  // Keep a ref to latest filters to use in useEffect
  const filtersRef = useRef(filters);

  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Update filters when props change (but don't reset local search/status if only pagination changed)
  useEffect(() => {
    // Only update local state if the actual filter values changed (not pagination)
    if (filters.phoneNumber !== searchQuery) {
      setSearchQuery(filters.phoneNumber || "");
      lastAppliedSearchRef.current = filters.phoneNumber || "";
    }
    const newStatus =
      (filters.status as
        | "all"
        | "PENDING"
        | "SUCCESS"
        | "FAILED"
        | "PROCESSING") || "all";
    if (newStatus !== statusFilter) {
      setStatusFilter(newStatus);
    }
  }, [filters.phoneNumber, filters.status]); // Only depend on q and status, not entire filters object

  // Handle search with debounce - only reset page when search actually changes
  useEffect(() => {
    // Skip if searchQuery matches the last applied search (to avoid resetting page on pagination)
    if (searchQuery === lastAppliedSearchRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      if (onFiltersChange) {
        lastAppliedSearchRef.current = searchQuery;
        // Use filtersRef to get latest filters without causing re-renders
        onFiltersChange({
          ...filtersRef.current,
          phoneNumber: searchQuery || undefined,
          page: 1, // Reset page only when search changes
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, onFiltersChange]); // Only depend on searchQuery and onFiltersChange

  const statusLabels: Record<string, string> = {
    PENDING: t("serviceRequests.statuses.pending"),
    PROCESSING: t("serviceRequests.statuses.processing"),
    SUCCESS: t("serviceRequests.statuses.success"),
    FAILED: t("serviceRequests.statuses.failed"),
  };

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    PENDING: "outline",
    PROCESSING: "secondary",
    SUCCESS: "default",
    FAILED: "destructive",
  };

  const columns: ColumnDef<ServiceRequest>[] = useMemo(
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
        accessorKey: "user.phoneNumber",
        header: t("serviceRequests.table.userPhone"),
        cell: ({ row }) => {
          const req = row.original;
          return (
            <span className="font-mono text-sm">
              {req.user?.phoneNumber || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "apiService.name",
        header: t("serviceRequests.table.service"),
        cell: ({ row }) => {
          const req = row.original;
          return <span>{req.apiService?.name || "-"}</span>;
        },
      },
      {
        accessorKey: "status",
        header: t("serviceRequests.table.status"),
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
        accessorKey: "creditCost",
        header: t("serviceRequests.table.cost"),
        cell: ({ row }) => {
          const cost = row.original.creditCost;
          return cost ? `${cost} ${t("serviceRequests.credit")}` : "-";
        },
      },
      {
        accessorKey: "createdAt",
        header: t("serviceRequests.table.date"),
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
        id: "actions",
        cell: ({ row }) => {
          const request = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">
                    {t("serviceRequests.actions.openMenu")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <IconEye className="mr-2 size-4" />
                  {t("serviceRequests.actions.view")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t]
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
            placeholder={t("serviceRequests.search")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                const newStatus = value as
                  | "all"
                  | "PENDING"
                  | "SUCCESS"
                  | "FAILED"
                  | "PROCESSING";
                setStatusFilter(newStatus);
                if (onFiltersChange) {
                  onFiltersChange({
                    ...filters,
                    status:
                      value === "all"
                        ? undefined
                        : (value as ServiceRequest["status"]),
                    page: 1, // Reset page only when status changes
                  });
                }
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("serviceRequests.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("serviceRequests.allStatuses")}
                </SelectItem>
                <SelectItem value="PENDING">
                  {t("serviceRequests.statuses.pending")}
                </SelectItem>
                <SelectItem value="PROCESSING">
                  {t("serviceRequests.statuses.processing")}
                </SelectItem>
                <SelectItem value="SUCCESS">
                  {t("serviceRequests.statuses.success")}
                </SelectItem>
                <SelectItem value="FAILED">
                  {t("serviceRequests.statuses.failed")}
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
                    {t("serviceRequests.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground flex-1 text-sm">
            {t("serviceRequests.selectedRows", {
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
                  {t("serviceRequests.prev")}
                </Button>
                <div className="text-muted-foreground text-sm">
                  {t("serviceRequests.page")} {pagination.page}{" "}
                  {t("serviceRequests.of")} {pagination.totalPages} (
                  {pagination.total} {t("serviceRequests.items")})
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
                  {t("serviceRequests.next")}
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
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("serviceRequests.detail.title")}</DialogTitle>
            <DialogDescription>
              {selectedRequest?.uuid || selectedRequest?.taskId}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            {selectedRequest && (
              <ServiceRequestDetail request={selectedRequest} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
