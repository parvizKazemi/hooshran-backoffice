import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import { UserCreditsTable } from "./components/user-credits-table";
import { UserCreditsFilterDialog } from "./components/user-credits-filter-dialog";
import { UserCreditForm } from "./components/user-credit-form";
import { useUserCredits } from "./hooks/use-user-credits";
import { UserCreditsQueryParams } from "./types";

export default function UserCredits() {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<UserCreditsQueryParams>({
    page: 1,
    take: 10,
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useUserCredits(filters);
  const credits = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("userCredits.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("userCredits.description")}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsFilterDialogOpen(true)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <IconSearch className="mr-2 size-4" />
          {filters.phoneNumber
            ? t("userCredits.filter.changeFilter")
            : t("userCredits.filter.searchByPhone")}
        </Button>
        <div className="flex items-center gap-2">
          {filters.phoneNumber && (
            <div className="text-muted-foreground text-sm">
              {t("userCredits.filter.currentPhone")}: {filters.phoneNumber}
            </div>
          )}
          {filters.phoneNumber && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <IconPlus className="mr-2 size-4" />
              {t("userCredits.createCredit")}
            </Button>
          )}
        </div>
      </div>

      {!filters.phoneNumber ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <IconSearch className="text-muted-foreground mb-4 size-12" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("userCredits.emptyState.title")}
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {t("userCredits.emptyState.description")}
          </p>
          <Button onClick={() => setIsFilterDialogOpen(true)}>
            <IconSearch className="mr-2 size-4" />
            {t("userCredits.filter.searchByPhone")}
          </Button>
        </div>
      ) : (
        <UserCreditsTable
          data={credits}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={{
            page: meta.page,
            total: meta.itemCount,
            totalPages: meta.pageCount,
            take: meta.take,
          }}
        />
      )}

      <UserCreditsFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onFilter={setFilters}
        initialFilters={filters}
      />

      {/* Create Credit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("userCredits.create.title")}</DialogTitle>
            <DialogDescription>
              {t("userCredits.create.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <UserCreditForm
              phoneNumber={filters.phoneNumber}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetch();
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
