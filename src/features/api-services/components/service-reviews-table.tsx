import { IconDotsVertical, IconEdit } from "@tabler/icons-react";
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceReview, ServiceReviewsQueryParams } from "../types";
import { ServiceReviewEditDialog } from "./dialogs/service-review-edit-dialog";

type ServiceReviewsTableProps = {
  data: ServiceReview[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: ServiceReviewsQueryParams;
  onFiltersChange?: (filters: ServiceReviewsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

export const ServiceReviewsTable = memo(function ServiceReviewsTable({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: ServiceReviewsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [editingReview, setEditingReview] = useState<ServiceReview | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Keep latest filters in ref to avoid infinite loops
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(filters.q || "");

  // Update filters when props change
  useEffect(() => {
    setSearchQuery(filters.q || "");
  }, [filters]);

  // Apply filters to API
  const applyFilters = useCallback(
    (newFilters: Partial<ServiceReviewsQueryParams>) => {
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

  const columns: ColumnDef<ServiceReview>[] = useMemo(
    () => [
      {
        accessorKey: "uuid",
        header: "UUID",
        cell: ({ row }) => {
          const uuid = row.original.uuid;
          return (
            <span className="text-muted-foreground font-mono text-xs">
              {uuid.substring(0, 8)}...
            </span>
          );
        },
      },
      {
        accessorKey: "serviceRequestId",
        header: "شناسه درخواست",
        cell: ({ row }) => {
          return <span>{row.original.serviceRequestId}</span>;
        },
      },
      {
        accessorKey: "rating",
        header: "امتیاز",
        cell: ({ row }) => {
          const rating = row.original.rating;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  rating >= 4
                    ? "default"
                    : rating >= 3
                      ? "secondary"
                      : "destructive"
                }
              >
                {rating} / 5
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "comment",
        header: "نظر",
        cell: ({ row }) => {
          const comment = row.original.comment;
          return (
            <div className="max-w-[300px]">
              {comment ? (
                <p className="truncate text-sm">{comment}</p>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "reviewMetadata",
        header: "متادیتا",
        cell: ({ row }) => {
          const metadata = row.original.reviewMetadata;
          if (metadata?.result_url) {
            return (
              <a
                href={metadata.result_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline"
              >
                مشاهده نتیجه
              </a>
            );
          }
          return <span className="text-muted-foreground text-sm">-</span>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "تاریخ ایجاد",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-sm">
              {date.toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const review = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                  <span className="sr-only">باز کردن منو</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingReview(review);
                    setIsDialogOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  ویرایش
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [setEditingReview, setIsDialogOpen]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingReview(null);
  };

  const handleFormSuccess = () => {
    handleDialogClose();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
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
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
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
                    نتیجه‌ای یافت نشد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground flex-1 text-sm">
            نمایش {data.length} از {pagination?.total || data.length} مورد
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
                  قبلی
                </Button>
                <div className="text-muted-foreground text-sm">
                  صفحه {pagination.page} از {pagination.totalPages} (
                  {pagination.total} مورد)
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
                  بعدی
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <ServiceReviewEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        review={editingReview}
        onSuccess={handleFormSuccess}
        onCancel={handleDialogClose}
      />
    </>
  );
});
