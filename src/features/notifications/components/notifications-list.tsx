import {
  IconBell,
  IconChevronDown,
  IconCopy,
  IconEdit,
  IconEye,
  IconInfoCircle,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { useDeleteNotification } from "../hooks/use-notifications";
import {
  AdminNotification,
  NotificationsQueryParams,
  TEMPLATE_TYPES,
} from "../types";
import { NotificationForm } from "./notification-form";

// Format date helper
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

// Copy UUID to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

type NotificationsListProps = {
  data: AdminNotification[];
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: NotificationsQueryParams;
  onFiltersChange?: (filters: NotificationsQueryParams) => void;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    take: number;
  };
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  system: IconSettings,
  notification: IconBell,
  information: IconInfoCircle,
};

const typeVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  system: "default",
  notification: "secondary",
  information: "outline",
};

export function NotificationsList({
  data,
  isLoading = false,
  onRefresh,
  filters = {},
  onFiltersChange,
  pagination,
}: NotificationsListProps) {
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const deleteNotification = useDeleteNotification();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [typeFilter, setTypeFilter] = useState(filters.type || "");
  const [templateTypeFilter, setTemplateTypeFilter] = useState(
    filters.templateType || ""
  );
  const [isPopupFilter, setIsPopupFilter] = useState<string>(
    filters.isPopup !== undefined ? String(filters.isPopup) : "all"
  );
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");
  const [sortBy, setSortBy] = useState(filters.sortBy || "createdAt");
  const [order, setOrder] = useState<"ASC" | "DESC">(filters.order || "DESC");

  const typeLabels: Record<string, string> = {
    system: t("notifications.types.system"),
    notification: t("notifications.types.notification"),
    information: t("notifications.types.information"),
  };

  const handleFilterChange = useCallback(
    (updates: Partial<NotificationsQueryParams>) => {
      if (onFiltersChange) {
        onFiltersChange({
          ...filters,
          ...updates,
          page: 1, // Reset to first page on filter change
        });
      }
    },
    [filters, onFiltersChange]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      handleFilterChange({ search: value || undefined });
    },
    [handleFilterChange]
  );

  const handleDelete = useCallback((notification: AdminNotification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedNotification) {
      try {
        await deleteNotification.mutateAsync(selectedNotification.uuid);
        setIsDeleteDialogOpen(false);
        setSelectedNotification(null);
        onRefresh?.();
      } catch {
        // Error handled in hook
      }
    }
  }, [selectedNotification, deleteNotification, onRefresh]);

  const handleFormSuccess = useCallback(() => {
    setIsDrawerOpen(false);
    onRefresh?.();
  }, [onRefresh]);

  // Table columns
  const columns = useMemo<ColumnDef<AdminNotification>[]>(() => {
    const templateLabels: Record<string, string> = {};
    TEMPLATE_TYPES.forEach((type) => {
      const templateKey = `notifications.templates.${type}` as const;
      templateLabels[type] = t(templateKey);
    });

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label={t("notifications.table.selectAll")}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("notifications.table.selectRow")}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "uuid",
        header: t("notifications.table.uuid"),
        cell: ({ row }) => {
          const uuid = row.getValue("uuid") as string;
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{uuid.slice(0, 8)}...</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  copyToClipboard(uuid);
                  // You can add a toast here
                }}
              >
                <IconCopy className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: t("notifications.table.type"),
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          const Icon = typeIcons[type] || IconBell;
          return (
            <Badge variant={typeVariants[type] || "outline"}>
              <Icon className="mr-1 h-3 w-3" />
              {typeLabels[type] || type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "metaData.type",
        header: t("notifications.table.templateType"),
        cell: ({ row }) => {
          const metaData = row.original.metaData;
          const templateType = metaData.type || "simple";
          return (
            <Badge variant="outline" className="text-xs">
              {templateLabels[templateType] || templateType}
            </Badge>
          );
        },
      },
      {
        accessorKey: "title",
        header: t("notifications.table.title"),
        cell: ({ row }) => {
          const metaData = row.original.metaData;
          const title =
            (metaData.data as Record<string, unknown>)?.title ||
            (metaData.data as Record<string, unknown>)?.message ||
            t("notifications.table.noTitle");
          return <span className="text-sm">{String(title)}</span>;
        },
      },
      {
        accessorKey: "recipientCount",
        header: t("notifications.table.recipients"),
        cell: ({ row }) => {
          return (
            <span className="text-sm">{row.original.recipientCount || 0}</span>
          );
        },
      },
      {
        accessorKey: "readStatus",
        header: t("notifications.table.readUnread"),
        cell: ({ row }) => {
          const notification = row.original;
          const total = notification.recipientCount || 0;
          const read = notification.readCount || 0;
          const unread = notification.unreadCount || 0;
          const readPercentage = total > 0 ? (read / total) * 100 : 0;

          return (
            <div className="flex min-w-[150px] flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {read}/{total}
                </span>
                <span className="text-muted-foreground">
                  {unread} {t("notifications.table.unread")}
                </span>
              </div>
              <Progress value={readPercentage} className="h-2" />
            </div>
          );
        },
      },
      {
        accessorKey: "isPopup",
        header: t("notifications.popup"),
        cell: ({ row }) => {
          const isPopup = row.getValue("isPopup") as boolean;
          return (
            <Badge variant={isPopup ? "default" : "outline"}>
              {isPopup
                ? t("notifications.table.yes")
                : t("notifications.table.no")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("notifications.table.createdAt"),
        cell: ({ row }) => {
          return (
            <span className="text-muted-foreground text-sm">
              {formatDate(row.original.createdAt)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: t("notifications.table.actions"),
        cell: ({ row }) => {
          const notification = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  // View notification details
                  // You can implement a detail view here
                }}
              >
                <IconEye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  // Edit notification
                  // You can implement edit functionality here
                }}
              >
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDelete(notification)}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [handleDelete, typeLabels, t]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
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
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder={t("notifications.filters.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <>
                {t("notifications.filters.showAdvanced")}
                <IconChevronDown
                  className={cn(
                    "size-4",
                    showAdvancedFilters ? "rotate-180" : ""
                  )}
                />
              </>
            </Button>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button className="mr-auto">
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t("notifications.sendNew")}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{t("notifications.sendNewTitle")}</DrawerTitle>
                  <DrawerDescription>
                    {t("notifications.sendNewDescription")}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <NotificationForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsDrawerOpen(false)}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-muted/30 animate-in slide-in-from-top-2 flex flex-wrap gap-4 rounded-md border p-4 duration-200">
              <Select
                value={typeFilter || "all"}
                onValueChange={(value) => {
                  setTypeFilter(value === "all" ? "" : value);
                  handleFilterChange({
                    type:
                      value === "all"
                        ? undefined
                        : (value as "system" | "notification" | "information"),
                  });
                }}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder={t("notifications.filters.type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("notifications.filters.allTypes")}
                  </SelectItem>
                  <SelectItem value="system">
                    {t("notifications.types.system")}
                  </SelectItem>
                  <SelectItem value="notification">
                    {t("notifications.types.notification")}
                  </SelectItem>
                  <SelectItem value="information">
                    {t("notifications.types.information")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={templateTypeFilter || "all"}
                onValueChange={(value) => {
                  setTemplateTypeFilter(value === "all" ? "" : value);
                  handleFilterChange({
                    templateType: value === "all" ? undefined : value,
                  });
                }}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue
                    placeholder={t("notifications.filters.templateType")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("notifications.filters.allTemplates")}
                  </SelectItem>
                  {TEMPLATE_TYPES.map((type: string) => {
                    const templateKey =
                      `notifications.templates.${type}` as const;
                    return (
                      <SelectItem key={type} value={type}>
                        {t(templateKey)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={isPopupFilter}
                onValueChange={(value) => {
                  setIsPopupFilter(value);
                  handleFilterChange({
                    isPopup: value === "all" ? undefined : value === "true",
                  });
                }}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder={t("notifications.filters.popup")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("notifications.filters.all")}
                  </SelectItem>
                  <SelectItem value="true">
                    {t("notifications.table.yes")}
                  </SelectItem>
                  <SelectItem value="false">
                    {t("notifications.table.no")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder={t("notifications.filters.dateFrom")}
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  handleFilterChange({
                    dateFrom: e.target.value || undefined,
                  });
                }}
                className="w-fit min-w-[200px]"
              />

              <Input
                type="date"
                placeholder={t("notifications.filters.dateTo")}
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  handleFilterChange({
                    dateTo: e.target.value || undefined,
                  });
                }}
                className="w-fit min-w-[200px]"
              />

              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  handleFilterChange({ sortBy: value });
                }}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue
                    placeholder={t("notifications.filters.sortBy")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">
                    {t("notifications.filters.sortCreatedAt")}
                  </SelectItem>
                  <SelectItem value="updatedAt">
                    {t("notifications.filters.sortUpdatedAt")}
                  </SelectItem>
                  <SelectItem value="type">
                    {t("notifications.filters.sortType")}
                  </SelectItem>
                  <SelectItem value="recipientCount">
                    {t("notifications.filters.sortRecipients")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={order}
                onValueChange={(value) => {
                  setOrder(value as "ASC" | "DESC");
                  handleFilterChange({ order: value as "ASC" | "DESC" });
                }}
              >
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">
                    {t("notifications.filters.ascending")}
                  </SelectItem>
                  <SelectItem value="DESC">
                    {t("notifications.filters.descending")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Table */}
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
                    {t("notifications.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-muted-foreground text-sm">
              {t("notifications.page")} {pagination.page}{" "}
              {t("notifications.of")} {pagination.totalPages} (
              {pagination.total} {t("notifications.items")})
            </div>
            <div className="flex items-center gap-2">
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
                {t("notifications.prev")}
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
                      ...filters,
                      page: pagination.page + 1,
                    });
                  }
                }}
                disabled={pagination.page >= pagination.totalPages}
              >
                {t("notifications.next")}
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
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("notifications.deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("notifications.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("notifications.deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteNotification.isPending}
            >
              {deleteNotification.isPending
                ? t("notifications.deleteDialog.deleting")
                : t("notifications.deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
