import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  IconDotsVertical,
  IconDownload,
  IconPhoto,
  IconTrash,
  IconVideo,
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
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteMedia } from "../hooks/use-media";
import { Media, MediaQueryParams } from "../types";

type MediaTableProps = {
  data: Media[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: MediaQueryParams;
  onFiltersChange?: (filters: MediaQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const MediaTable = memo(function MediaTable({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: MediaTableProps) {
  const { t } = useTranslation("common");
  const deleteMedia = useDeleteMedia();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [typeFilter, setTypeFilter] = useState<"all" | "IMAGE" | "VIDEO">(
    (filters.type as "all" | "IMAGE" | "VIDEO") || "all"
  );

  // Keep latest filters in ref to avoid infinite loops
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setSearchQuery(filters.q || "");
    setTypeFilter((filters.type as "all" | "IMAGE" | "VIDEO") || "all");
  }, [filters]);

  const applyFilters = useCallback(
    (newFilters: Partial<MediaQueryParams>) => {
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

  const columns: ColumnDef<Media>[] = useMemo(
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
        accessorKey: "key",
        header: t("media.table.name"),
        cell: ({ row }) => {
          const media = row.original;
          return (
            <div className="flex items-center gap-2">
              {media.type === "IMAGE" ? (
                <IconPhoto className="size-5 text-blue-500" />
              ) : (
                <IconVideo className="size-5 text-red-500" />
              )}
              <span className="font-mono text-sm">{media.key}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: t("media.table.type"),
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant={type === "IMAGE" ? "default" : "destructive"}>
              {type === "IMAGE"
                ? t("media.types.image")
                : t("media.types.video")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "extension",
        header: t("media.table.extension"),
        cell: ({ row }) => (
          <span className="font-mono text-sm uppercase">
            {row.original.extension}
          </span>
        ),
      },
      {
        accessorKey: "size",
        header: t("media.table.size"),
        cell: ({ row }) => formatFileSize(row.original.size),
      },
      {
        accessorKey: "bucket",
        header: t("media.table.bucket"),
        cell: ({ row }) => row.original.bucket,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const media = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {media.url && (
                  <DropdownMenuItem
                    onClick={() => window.open(media.url, "_blank")}
                  >
                    <IconDownload className="mr-2 size-4" />
                    {t("media.actions.download")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(t("media.confirmDelete"))) {
                      deleteMedia.mutate(media.id, {
                        onSuccess: () => onRefresh?.(),
                      });
                    }
                  }}
                  className="text-destructive"
                >
                  <IconTrash className="mr-2 size-4" />
                  {t("media.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, deleteMedia, onRefresh]
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
          placeholder={t("media.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              const typedValue = value as "all" | "IMAGE" | "VIDEO";
              setTypeFilter(typedValue);
              applyFilters({
                type:
                  typedValue === "all"
                    ? undefined
                    : (typedValue as Media["type"]),
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("media.allTypes")}</SelectItem>
              <SelectItem value="IMAGE">{t("media.types.image")}</SelectItem>
              <SelectItem value="VIDEO">{t("media.types.video")}</SelectItem>
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
                  {t("media.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-sm">
            {t("media.page")} {pagination.page} {t("media.of")}{" "}
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
              {t("media.prev")}
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
              {t("media.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
