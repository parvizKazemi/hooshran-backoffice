import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useDeleteModelDiscount,
  useModelDiscountServices,
  useModelDiscounts,
} from "../hooks/use-model-discounts";
import type {
  ModelDiscount,
  ModelDiscountStatusFilter,
} from "../types";
import { MODEL_DISCOUNT_STATUS_FILTERS } from "../constants";
import { ModelDiscountFormDialog } from "./model-discount-form-dialog";
import { ModelDiscountsTable } from "./model-discounts-table";

export function ModelDiscountsTab() {
  const { t } = useTranslation("common");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<ModelDiscount | null>(
    null
  );
  const [deletingDiscount, setDeletingDiscount] = useState<ModelDiscount | null>(
    null
  );
  const [status, setStatus] = useState<ModelDiscountStatusFilter>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useModelDiscounts({
    page: 1,
    limit: 200,
    status,
    search,
  });
  const { data: serviceData, isLoading: isServicesLoading } =
    useModelDiscountServices();
  const deleteDiscount = useDeleteModelDiscount();

  const discounts = data?.data ?? [];
  const services = useMemo(
    () =>
      (serviceData?.services ?? []).map((service) => ({
        uuid: service.uuid,
        name: service.name,
      })),
    [serviceData?.services]
  );

  const handleCreate = () => {
    setEditingDiscount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (discount: ModelDiscount) => {
    setEditingDiscount(discount);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDiscount) return;
    await deleteDiscount.mutateAsync(deletingDiscount.uuid);
    setDeletingDiscount(null);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border p-4 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">
              {t("modelDiscounts.rulesTitle")}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t("modelDiscounts.rulesDescription")}
            </p>
          </div>

          <Button
            onClick={handleCreate}
            className="w-full rounded-xl shadow-md sm:w-auto"
            disabled={isServicesLoading}
          >
            <IconPlus className="size-4" />
            {t("modelDiscounts.actions.create")}
          </Button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("modelDiscounts.filters.searchPlaceholder")}
              className="rounded-xl"
            />
          </div>
          <div>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ModelDiscountStatusFilter)
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue
                  placeholder={t("modelDiscounts.filters.statusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {MODEL_DISCOUNT_STATUS_FILTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`modelDiscounts.filters.status.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ModelDiscountsTable
          discounts={discounts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeletingDiscount}
        />
      </div>

      <ModelDiscountFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        services={services}
        discount={editingDiscount}
      />

      <AlertDialog
        open={Boolean(deletingDiscount)}
        onOpenChange={(open) => {
          if (!open) setDeletingDiscount(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("modelDiscounts.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("modelDiscounts.delete.description", {
                name:
                  deletingDiscount?.modelName?.trim() ||
                  deletingDiscount?.service?.name ||
                  "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("modelDiscounts.form.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("modelDiscounts.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
