import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { useDiscountCodeSingleReport } from "../hooks/use-discount-codes";

type DiscountCodeReportDialogProps = {
  discountCodeId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DiscountCodeReportDialog({
  discountCodeId,
  open,
  onOpenChange,
}: DiscountCodeReportDialogProps) {
  const { t } = useTranslation("common");
  const { data, isLoading } = useDiscountCodeSingleReport(
    open ? discountCodeId : undefined
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("discountCodes.report.title")}</DialogTitle>
          <DialogDescription>
            {data?.code
              ? t("discountCodes.report.description", { code: data.code })
              : t("discountCodes.report.loadingDescription")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="bg-muted/40 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">
                  {t("discountCodes.report.capacity")}
                </p>
                <p className="text-lg font-bold">
                  {data.capacity.toLocaleString("fa-IR")}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">
                  {t("discountCodes.report.used")}
                </p>
                <p className="text-lg font-bold">
                  {data.usagesCount.toLocaleString("fa-IR")}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">
                  {t("discountCodes.report.remaining")}
                </p>
                <p className="text-lg font-bold">
                  {data.remainingCapacity.toLocaleString("fa-IR")}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">
                  {t("discountCodes.report.type")}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {t(`discountCodes.types.${data.type}`)}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("discountCodes.report.table.phone")}
                    </TableHead>
                    <TableHead>
                      {t("discountCodes.report.table.original")}
                    </TableHead>
                    <TableHead>
                      {t("discountCodes.report.table.discount")}
                    </TableHead>
                    <TableHead>
                      {t("discountCodes.report.table.usedAt")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.usages.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground py-8 text-center"
                      >
                        {t("discountCodes.report.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.usages.map((usage) => (
                      <TableRow key={`${usage.paymentId}-${usage.usedAt}`}>
                        <TableCell dir="ltr">{usage.userPhone}</TableCell>
                        <TableCell>
                          {usage.originalAmount.toLocaleString("fa-IR")}
                        </TableCell>
                        <TableCell>
                          {usage.discountAmountApplied.toLocaleString("fa-IR")}
                        </TableCell>
                        <TableCell>
                          {new Date(usage.usedAt).toLocaleString("fa-IR")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
