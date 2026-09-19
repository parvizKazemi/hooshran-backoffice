import {
  IconChevronLeft,
  IconChevronRight,
  IconCoins,
  IconEye,
  IconInfoCircle,
} from "@tabler/icons-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceRequestDetail } from "@/features/service-requests/components/service-request-detail";
import type { ServiceRequest } from "@/features/service-requests/types";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { fetchServiceRequestByUuid } from "../api/service";
import type { CreditLedgerEntry, CreditLedgerQueryParams } from "../types";
import {
  extractServiceRequestUuid,
  formatLedgerAmountForDisplay,
  getLedgerActionReason,
  getLedgerAmountClass,
  getLedgerDescriptionParts,
  getTransactionTypeBadgeClass,
  getTransactionTypeLabel,
  isRequestUsageEntry,
  resolveLedgerServiceTitle,
} from "../utils/credit-ledger.helpers";

type CreditLedgerTableProps = {
  data: CreditLedgerEntry[];
  isLoading?: boolean;
  filters: CreditLedgerQueryParams;
  onFiltersChange: (filters: CreditLedgerQueryParams) => void;
  serviceNameByUuid?: Map<string, string>;
  serviceNameByEndpoint?: Map<string, string>;
  serviceTitleByRequestUuid?: Map<string, string>;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
};

function TypeBadge({ entry }: { entry: CreditLedgerEntry }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-1 text-[10px] font-black",
        getTransactionTypeBadgeClass(entry)
      )}
    >
      {getTransactionTypeLabel(entry)}
    </Badge>
  );
}

function AmountCell({ entry }: { entry: CreditLedgerEntry }) {
  const formattedAmount = formatLedgerAmountForDisplay(entry);

  if (!formattedAmount) {
    return <span className="text-muted-foreground font-medium">—</span>;
  }

  return (
    <span
      className={cn("font-mono text-sm font-bold", getLedgerAmountClass(entry))}
      dir="ltr"
    >
      {formattedAmount}
    </span>
  );
}

function LedgerDescription({
  entry,
  serviceTitle,
}: {
  entry: CreditLedgerEntry;
  serviceTitle?: string;
}) {
  const { title, detail } = getLedgerDescriptionParts(entry, serviceTitle);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span>{title}</span>
      {detail && (
        <span className="bg-muted/70 text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] font-medium">
          {detail}
        </span>
      )}
    </span>
  );
}

function LedgerActionReasonInfo({ reason }: { reason: string }) {
  const { t } = useTranslation("common");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 gap-1 px-2 dark:text-rose-400 dark:hover:bg-rose-400/10 dark:hover:text-rose-400"
          aria-label={t("creditLedgerHistory.actions.viewReason")}
        >
          <IconInfoCircle className="size-4" />
          <span className="text-[11px] font-bold">
            {t("creditLedgerHistory.actions.reason")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={8}
        collisionPadding={16}
        dir="rtl"
        className="w-[min(20rem,calc(100vw-2rem))] max-h-64 overflow-y-auto p-3"
      >
        <p className="text-muted-foreground mb-1.5 text-[11px] font-bold">
          {t("creditLedgerHistory.actions.reason")}
        </p>
        <p className="text-destructive whitespace-pre-wrap break-words text-xs font-medium leading-relaxed dark:text-rose-400">
          {reason}
        </p>
      </PopoverContent>
    </Popover>
  );
}

function RequestActionButton({
  entry,
  isLoading,
  onView,
}: {
  entry: CreditLedgerEntry;
  isLoading: boolean;
  onView: (uuid: string) => void;
}) {
  const { t } = useTranslation("common");
  const actionReason = getLedgerActionReason(entry);

  if (actionReason) {
    return <LedgerActionReasonInfo reason={actionReason} />;
  }

  if (!isRequestUsageEntry(entry)) {
    return <span className="text-muted-foreground font-black">—</span>;
  }

  const requestUuid = extractServiceRequestUuid(entry);
  if (!requestUuid) {
    return <span className="text-muted-foreground font-black">—</span>;
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className="h-8 text-[11px]"
      disabled={isLoading}
      onClick={() => onView(requestUuid)}
    >
      <IconEye className="ml-1 size-3.5 text-blue-500" />
      {isLoading
        ? t("creditLedgerHistory.actions.loadingRequest")
        : t("creditLedgerHistory.actions.viewRequest")}
    </Button>
  );
}

export const CreditLedgerTable = memo(function CreditLedgerTable({
  data,
  isLoading = false,
  filters,
  onFiltersChange,
  serviceNameByUuid,
  serviceNameByEndpoint,
  serviceTitleByRequestUuid,
  pagination,
}: CreditLedgerTableProps) {
  const { t } = useTranslation("common");
  const filtersRef = useRef(filters);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [loadingRequestUuid, setLoadingRequestUuid] = useState<string | null>(
    null
  );

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const handleViewRequest = useCallback(
    async (uuid: string) => {
      try {
        setLoadingRequestUuid(uuid);
        const request = await fetchServiceRequestByUuid(uuid);
        setSelectedRequest(request);
        setIsDetailDialogOpen(true);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error(t("creditLedgerHistory.actions.loadRequestFailed"));
        }
      } finally {
        setLoadingRequestUuid(null);
      }
    },
    [t]
  );

  const startIndex = useMemo(() => {
    if (pagination.total === 0) return 0;
    return (pagination.page - 1) * pagination.limit + 1;
  }, [pagination.page, pagination.limit, pagination.total]);

  const endIndex = useMemo(() => {
    return Math.min(pagination.page * pagination.limit, pagination.total);
  }, [pagination.page, pagination.limit, pagination.total]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(-2);
    pages.push(total);

    return pages;
  }, [pagination.page, pagination.totalPages]);

  if (isLoading) {
    return (
      <div className="bg-card space-y-3 rounded-3xl border p-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card overflow-hidden rounded-3xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 text-center text-xs font-bold">
                  {t("creditLedgerHistory.table.row")}
                </TableHead>
                <TableHead className="w-32 text-xs font-bold">
                  {t("creditLedgerHistory.table.type")}
                </TableHead>
                <TableHead className="text-xs font-bold">
                  {t("creditLedgerHistory.table.description")}
                </TableHead>
                <TableHead className="text-center text-xs font-bold">
                  {t("creditLedgerHistory.table.amount")}
                </TableHead>
                <TableHead className="text-center text-xs font-bold">
                  {t("creditLedgerHistory.table.dateTime")}
                </TableHead>
                <TableHead className="bg-muted/20 text-center text-xs font-bold">
                  {t("creditLedgerHistory.table.balanceAfter")}
                </TableHead>
                <TableHead className="w-36 text-center text-xs font-bold">
                  {t("creditLedgerHistory.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    {t("creditLedgerHistory.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((entry, index) => {
                  const globalIndex = startIndex + index;
                  const balanceAfter = entry.balanceAfter ?? 0;
                  const requestUuid = extractServiceRequestUuid(entry);
                  const serviceTitle = resolveLedgerServiceTitle(entry, {
                    serviceNameByUuid,
                    serviceNameByEndpoint,
                    serviceTitleByRequestUuid,
                  });

                  return (
                    <TableRow key={entry.uuid} className="text-xs">
                      <TableCell className="text-muted-foreground text-center font-medium">
                        {globalIndex.toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell>
                        <TypeBadge entry={entry} />
                      </TableCell>
                      <TableCell className="font-bold">
                        <LedgerDescription
                          entry={entry}
                          serviceTitle={serviceTitle}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <AmountCell entry={entry} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center font-medium">
                        {new Date(entry.createdAt).toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell className="bg-muted/10 text-primary text-center font-black">
                        <span
                          dir="ltr"
                          className="inline-flex items-center gap-1"
                        >
                          {balanceAfter.toLocaleString("fa-IR", {
                            maximumFractionDigits: 2,
                          })}
                          <IconCoins className="size-3.5 fill-amber-500 text-amber-500" />
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <RequestActionButton
                          entry={entry}
                          isLoading={
                            !!requestUuid && loadingRequestUuid === requestUuid
                          }
                          onView={handleViewRequest}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination.total > 0 && (
        <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-3xl border p-4 sm:flex-row">
          <div className="text-muted-foreground text-xs">
            {t("creditLedgerHistory.pagination.showing", {
              start: startIndex.toLocaleString("fa-IR"),
              end: endIndex.toLocaleString("fa-IR"),
              total: pagination.total.toLocaleString("fa-IR"),
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => {
                  if (pagination.page > 1) {
                    onFiltersChange({
                      ...filtersRef.current,
                      page: pagination.page - 1,
                    });
                  }
                }}
                disabled={pagination.page <= 1}
              >
                <IconChevronRight className="size-4" />
              </Button>

              {pageNumbers.map((page, idx) =>
                page < 0 ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-muted-foreground px-1 text-xs"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "ghost"}
                    size="icon"
                    className="size-8 text-xs font-bold"
                    onClick={() => {
                      onFiltersChange({
                        ...filtersRef.current,
                        page,
                      });
                    }}
                  >
                    {page.toLocaleString("fa-IR")}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => {
                  if (pagination.page < pagination.totalPages) {
                    onFiltersChange({
                      ...filtersRef.current,
                      page: pagination.page + 1,
                    });
                  }
                }}
                disabled={pagination.page >= pagination.totalPages}
              >
                <IconChevronLeft className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
});
