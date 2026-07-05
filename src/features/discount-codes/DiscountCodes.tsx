import { Button } from "@/components/ui/button";

import { IconPlus, IconTicket } from "@tabler/icons-react";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { usePackages } from "@/features/packages/hooks/use-packages";

import { DiscountCodeFormDialog } from "./components/discount-code-form-dialog";

import { DiscountCodesStats } from "./components/discount-codes-stats";

import { DiscountCodesTable } from "./components/discount-codes-table";

import {
  useDiscountCodeOverallReport,
  useDiscountCodes,
} from "./hooks/use-discount-codes";

import type { DiscountCodesQueryParams } from "./types";

export default function DiscountCodes() {
  const { t } = useTranslation("common");

  const [filters, setFilters] = useState<DiscountCodesQueryParams>({
    page: 1,

    limit: 100,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading } = useDiscountCodes(filters);

  const { data: report, isLoading: isReportLoading } =
    useDiscountCodeOverallReport();

  const { data: packagesData, isLoading: isPackagesLoading } = usePackages({
    limit: 200,
  });

  const codes = data?.data ?? [];

  const meta = data?.meta;

  const packages = packagesData?.data ?? [];

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <IconTicket className="text-primary size-6" />

            {t("discountCodes.title")}
          </h1>

          <p className="text-muted-foreground mt-2 text-sm">
            {t("discountCodes.description")}
          </p>
        </div>

        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="shrink-0"
        >
          <IconPlus className="mr-2 size-4" />

          {t("discountCodes.actions.create")}
        </Button>
      </div>

      <DiscountCodesStats
        report={report}
        codes={codes}
        isLoading={isLoading || isReportLoading}
      />

      <DiscountCodesTable
        data={codes}
        packages={packages}
        isLoading={isLoading}
        filters={filters}
        onFiltersChange={setFilters}
        meta={
          meta
            ? {
                page: meta.page,

                pageCount: meta.pageCount,

                hasPreviousPage: meta.hasPreviousPage,

                hasNextPage: meta.hasNextPage,
              }
            : undefined
        }
      />

      <DiscountCodeFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        packages={packages}
        isPackagesLoading={isPackagesLoading}
      />
    </div>
  );
}
