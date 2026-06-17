import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BannedUsersQueryParams, BlacklistRecord } from "../../types";
import { BlacklistTablePagination } from "./pagination/blacklist-table-pagination";
import { useBlacklistTableColumns } from "./table/blacklist-table-columns";
import { BlacklistTableLoading } from "./table/blacklist-table-loading";

type BlacklistTableProps = {
  data: BlacklistRecord[];
  isLoading?: boolean;
  filters?: BannedUsersQueryParams;
  onFiltersChange?: (filters: BannedUsersQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
  onAdd: () => void;
  onEdit: (record: BlacklistRecord) => void;
  onUnblock: (record: BlacklistRecord) => void;
};

export function BlacklistTable({
  data,
  isLoading = false,
  filters = {},
  onFiltersChange,
  pagination,
  onAdd,
  onEdit,
  onUnblock,
}: BlacklistTableProps) {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setSearchQuery(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    if (!onFiltersChange) {
      return;
    }

    const normalizedSearch = debouncedSearch.trim();
    const currentSearch = filters.search?.trim() ?? "";

    if (normalizedSearch === currentSearch) {
      return;
    }

    onFiltersChange({
      ...filters,
      search: normalizedSearch || undefined,
      page: 1,
    });
  }, [debouncedSearch, filters, onFiltersChange]);

  const columns = useBlacklistTableColumns({ onEdit, onUnblock });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 1,
  });

  const handleSearchChange = useCallback(
    (value: string) => setSearchQuery(value),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Input
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={t("userSettings.blacklistPage.searchPlaceholder")}
            className="pr-10"
          />
          <IconSearch className="text-muted-foreground absolute top-2.5 right-3 size-4" />
        </div>

        <Button type="button" onClick={onAdd}>
          <IconPlus className="size-4" />
          {t("userSettings.blacklistPage.actions.addBan")}
        </Button>
      </div>

      {isLoading ? (
        <BlacklistTableLoading />
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                    {t("userSettings.blacklistPage.emptyState")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <BlacklistTablePagination
        pagination={pagination}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
}
