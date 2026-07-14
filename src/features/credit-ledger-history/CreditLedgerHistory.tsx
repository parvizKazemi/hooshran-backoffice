import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconDownload, IconHistory, IconSearch } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { fetchAllCreditLedgerByPhone } from "./api/service";
import { CreditLedgerFilterDialog } from "./components/credit-ledger-filter-dialog";
import { CreditLedgerTable } from "./components/credit-ledger-table";
import { CREDIT_LEDGER_DEFAULT_LIMIT } from "./constants";
import { useCreditLedgerHistory } from "./hooks/use-credit-ledger-history";
import type { CreditLedgerQueryParams } from "./types";
import { downloadCreditLedgerCsv } from "./utils/credit-ledger.helpers";

export default function CreditLedgerHistory() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<CreditLedgerQueryParams>({
    page: 1,
    limit: CREDIT_LEDGER_DEFAULT_LIMIT,
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useCreditLedgerHistory(filters);
  const entries = data?.data || [];
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: CREDIT_LEDGER_DEFAULT_LIMIT,
    pages: 0,
  };

  const handleExport = useCallback(async () => {
    if (!filters.phoneNumber) {
      toast.warning(t("creditLedgerHistory.export.phoneRequired"));
      return;
    }

    try {
      setIsExporting(true);
      const response = await fetchAllCreditLedgerByPhone({
        phoneNumber: filters.phoneNumber,
        type: filters.type,
        status: filters.status,
        from: filters.from,
        to: filters.to,
      });

      if (response.data.length === 0) {
        toast.warning(t("creditLedgerHistory.export.empty"));
        return;
      }

      downloadCreditLedgerCsv(response.data, filters.phoneNumber);
      toast.success(t("creditLedgerHistory.export.success"));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t("creditLedgerHistory.export.error"));
      }
    } finally {
      setIsExporting(false);
    }
  }, [filters, t]);

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">{t("creditLedgerHistory.title")}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("creditLedgerHistory.description")}
        </p>
      </div>

      <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-3xl border p-5 sm:flex-row">
        <div className="text-right">
          <h2 className="flex items-center gap-2 text-base font-black">
            <IconHistory className="text-primary size-5" />
            <span>{t("creditLedgerHistory.headerTitle")}</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-[10px]">
            {t("creditLedgerHistory.headerDescription")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filters.phoneNumber && (
            <div className="text-muted-foreground text-xs font-bold">
              {t("creditLedgerHistory.filter.currentPhone")}:{" "}
              <span className="text-primary font-mono font-bold" dir="ltr">
                {filters.phoneNumber}
              </span>
            </div>
          )}
          {filters.phoneNumber && (
            <div className="bg-muted/60 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold">
              <span className="text-muted-foreground">
                {t("creditLedgerHistory.totalTransactions")}:
              </span>
              <span className="text-primary font-mono font-black">
                {meta.total.toLocaleString("fa-IR")}
              </span>
            </div>
          )}
          <Button
            onClick={() => setIsFilterDialogOpen(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <IconSearch className="mr-2 size-4" />
            {filters.phoneNumber
              ? t("creditLedgerHistory.filter.changeFilter")
              : t("creditLedgerHistory.filter.searchByPhone")}
          </Button>
          {filters.phoneNumber && (
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
            >
              <IconDownload className="mr-2 size-4" />
              {isExporting
                ? t("creditLedgerHistory.export.loading")
                : t("creditLedgerHistory.export.button")}
            </Button>
          )}
        </div>
      </div>

      {!filters.phoneNumber ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
          <IconSearch className="text-muted-foreground mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("creditLedgerHistory.emptyState.title")}
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {t("creditLedgerHistory.emptyState.description")}
          </p>
          <Button onClick={() => setIsFilterDialogOpen(true)}>
            <IconSearch className="mr-2 size-4" />
            {t("creditLedgerHistory.filter.searchByPhone")}
          </Button>
        </div>
      ) : (
        <CreditLedgerTable
          data={entries}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={{
            page: meta.page,
            total: meta.total,
            totalPages: meta.pages,
            limit:
              meta.limit > 0
                ? meta.limit
                : filters.limit || CREDIT_LEDGER_DEFAULT_LIMIT,
          }}
        />
      )}

      <CreditLedgerFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onFilter={setFilters}
        initialFilters={filters}
      />
    </div>
  );
}
