import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconEdit, IconStack2, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ModelDiscount } from "../types";
import { toModelDiscountWindowLabel } from "../utils/model-discount-form.helpers";

type ModelDiscountsTableProps = {
  discounts: ModelDiscount[];
  isLoading?: boolean;
  onEdit: (discount: ModelDiscount) => void;
  onDelete: (discount: ModelDiscount) => void;
};

function getWindowBadgeClass(status: "upcoming" | "active" | "expired"): string {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "upcoming") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
  }
  return "border-border bg-muted text-muted-foreground";
}

export function ModelDiscountsTable({
  discounts,
  isLoading = false,
  onEdit,
  onDelete,
}: ModelDiscountsTableProps) {
  const { t } = useTranslation("common");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          {t("modelDiscounts.table.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table className="min-w-[780px]">
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-bold">
              {t("modelDiscounts.table.targetModel")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("modelDiscounts.table.discountPercent")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("modelDiscounts.table.validity")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("modelDiscounts.table.state")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("modelDiscounts.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount) => {
            const windowInfo = toModelDiscountWindowLabel(
              discount.startsAt,
              discount.endsAt
            );

            return (
              <TableRow key={discount.uuid} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                      <IconStack2 className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {discount.modelName?.trim() ||
                          t("modelDiscounts.table.allServiceModels")}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {discount.service?.name || t("modelDiscounts.table.unknownService")}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {discount.discountPercentage.toLocaleString("fa-IR")}٪
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1 text-xs">
                    <Badge
                      variant="outline"
                      className={getWindowBadgeClass(windowInfo.status)}
                    >
                      {t(`modelDiscounts.table.windowStatus.${windowInfo.status}`)}
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">
                      {windowInfo.startsLabel} ← {windowInfo.endsLabel}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      discount.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-border bg-muted text-muted-foreground"
                    }
                  >
                    {discount.isActive
                      ? t("modelDiscounts.table.enabled")
                      : t("modelDiscounts.table.disabled")}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-primary/10 hover:text-primary size-8"
                      onClick={() => onEdit(discount)}
                    >
                      <IconEdit className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
                      onClick={() => onDelete(discount)}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
