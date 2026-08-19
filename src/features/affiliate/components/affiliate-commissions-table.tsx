import { useTranslation } from "react-i18next";
import { IconReceipt } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AffiliateCommissionLog, AffiliateProgramRules } from "../types";
import {
  formatToman,
  getPurchaseTypePercentLabel,
  isCommissionAvailable,
} from "../utils/affiliate.helpers";

type AffiliateCommissionsTableProps = {
  commissions: AffiliateCommissionLog[];
  rules: AffiliateProgramRules;
  isLoading?: boolean;
};

export function AffiliateCommissionsTable({
  commissions,
  rules,
  isLoading,
}: AffiliateCommissionsTableProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
      <div className="border-b pb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <IconReceipt className="size-4 text-indigo-500" />
          {t("affiliate.commissions.title")}
        </h3>
        <p className="text-muted-foreground mt-0.5 text-[11px]">
          {t("affiliate.commissions.description")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 *:text-start">
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.invoiceId")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.affiliate")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.buyer")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.purchaseType")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.paidAmount")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.commission")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.releaseStatus")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.commissions.table.unlockDate")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : commissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {t("affiliate.commissions.empty")}
                </TableCell>
              </TableRow>
            ) : (
              commissions.map((item) => (
                <TableRow key={item.invoiceId} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {item.invoiceId}
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    {item.affiliateName}
                  </TableCell>
                  <TableCell className="text-xs">{item.buyerName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.purchaseType === "first_purchase"
                          ? "border-primary/30 bg-primary/10 text-primary text-[10px]"
                          : "border-indigo-500/30 bg-indigo-500/10 text-[10px] text-indigo-600 dark:text-indigo-400"
                      }
                    >
                      {item.purchaseType === "first_purchase"
                        ? t("affiliate.commissions.types.firstPurchase", {
                            percent: getPurchaseTypePercentLabel(
                              item.purchaseType,
                              rules
                            ),
                          })
                        : t("affiliate.commissions.types.renewal", {
                            percent: getPurchaseTypePercentLabel(
                              item.purchaseType,
                              rules
                            ),
                          })}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatToman(item.paidAmount)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatToman(item.commissionAmount)}
                    {item.isCapped ? (
                      <span className="ms-1 text-[9px] text-amber-500">
                        ({t("affiliate.commissions.capped")})
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isCommissionAvailable(item.status)
                          ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
                      }
                    >
                      {isCommissionAvailable(item.status)
                        ? t("affiliate.commissions.status.available")
                        : t("affiliate.commissions.status.pending")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {item.unlockDate}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
