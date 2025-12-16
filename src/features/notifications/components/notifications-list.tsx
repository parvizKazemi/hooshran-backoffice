import {
  IconBell,
  IconChevronDown,
  IconCopy,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconSend,
  IconSendOff,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  useDeleteNotification,
  useSendNotification,
} from "../hooks/use-notifications";
import {
  AdminNotification,
  NotificationType,
  NotificationsQueryParams,
  TEMPLATE_TYPES,
} from "../types";
import { NotificationForm } from "./notification-form";
import { NotificationsTableLoading } from "./notifications-table-loading";

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
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [userIdsToSend, setUserIdsToSend] = useState<string>("");

  const deleteNotification = useDeleteNotification();
  const sendNotification = useSendNotification();

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
    setIsEditDrawerOpen(false);
    setSelectedNotification(null);
    onRefresh?.();
  }, [onRefresh]);

  const handleEdit = useCallback((notification: AdminNotification) => {
    setSelectedNotification(notification);
    setIsEditDrawerOpen(true);
  }, []);

  const handleSend = useCallback((notification: AdminNotification) => {
    setSelectedNotification(notification);
    setIsSendDialogOpen(true);
  }, []);

  const handleSendConfirm = useCallback(async () => {
    if (selectedNotification && userIdsToSend.trim()) {
      try {
        const userIds = userIdsToSend
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        if (userIds.length === 0) {
          return;
        }

        await sendNotification.mutateAsync({
          notificationId: selectedNotification.uuid,
          userIds,
        });

        setIsSendDialogOpen(false);
        setSelectedNotification(null);
        setUserIdsToSend("");
        onRefresh?.();
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    }
  }, [selectedNotification, userIdsToSend, sendNotification, onRefresh]);

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
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => {
                  copyToClipboard(uuid);
                  // You can add a toast here
                }}
              >
                <IconCopy className="size-3" />
              </Button>
              <span className="font-mono text-xs">{uuid.slice(0, 8)}...</span>
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
              {/* <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:scale-105"
                onClick={() => {
                  // View notification details
                  // You can implement a detail view here
                }}
              >
                <IconEye className="size-4" />
              </Button> */}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:scale-105"
                onClick={() => handleEdit(notification)}
              >
                <IconEdit className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:scale-105"
                onClick={() => handleSend(notification)}
                disabled={notification.isPublic}
              >
                {!notification.isPublic ? (
                  <IconSend className="size-4 rotate-270" />
                ) : (
                  <IconSendOff className="size-4 rotate-270" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-8 hover:scale-105"
                onClick={() => handleDelete(notification)}
              >
                <IconTrash className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [handleDelete, handleEdit, handleSend, typeLabels, t]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

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
            <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DialogTrigger asChild>
                <Button className="mr-auto">
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t("notifications.sendNew")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    {t("notifications.sendNewTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {t("notifications.sendNewDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <NotificationForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsDrawerOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
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
                      value === "all" ? undefined : (value as NotificationType),
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

        {/* Table - Show loading or actual table */}
        {isLoading ? (
          <NotificationsTableLoading />
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
                      {t("notifications.noResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

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

      {/* Edit Dialog */}
      <Dialog open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notifications.editTitle")}</DialogTitle>
            <DialogDescription>
              {t("notifications.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedNotification && (
              <NotificationForm
                notification={selectedNotification}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsEditDrawerOpen(false);
                  setSelectedNotification(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Send Dialog */}
      <AlertDialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("notifications.sendDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("notifications.sendDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">
              {t("notifications.sendDialog.userIdsLabel")}
            </label>
            <Input
              value={userIdsToSend}
              onChange={(e) => setUserIdsToSend(e.target.value)}
              placeholder={t("notifications.sendDialog.userIdsPlaceholder")}
              className="mt-2"
            />
            <p className="text-muted-foreground mt-2 text-xs">
              {t("notifications.sendDialog.userIdsHelp")}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setUserIdsToSend("");
                setSelectedNotification(null);
              }}
            >
              {t("notifications.sendDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendConfirm}
              disabled={sendNotification.isPending || !userIdsToSend.trim()}
            >
              {sendNotification.isPending
                ? t("notifications.sendDialog.sending")
                : t("notifications.sendDialog.send")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
