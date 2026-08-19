import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck, IconWallet } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { AffiliatePayoutFilter, AffiliatePayoutRequest } from "../types";
import {
  filterAffiliatePayouts,
  formatToman,
  isPayoutPending,
} from "../utils/affiliate.helpers";

type AffiliatePayoutsTableProps = {
  payouts: AffiliatePayoutRequest[];
  isLoading?: boolean;
  onApprove: (payout: AffiliatePayoutRequest) => void;
  onReject: (payout: AffiliatePayoutRequest) => void;
};

export function AffiliatePayoutsTable({
  payouts,
  isLoading,
  onApprove,
  onReject,
}: AffiliatePayoutsTableProps) {
  const { t } = useTranslation("common");
  const [statusFilter, setStatusFilter] =
    useState<AffiliatePayoutFilter>("pending");

  const filteredPayouts = useMemo(
    () => filterAffiliatePayouts(payouts, statusFilter),
    [payouts, statusFilter]
  );

  return (
    <div className="bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <IconWallet className="size-4 text-emerald-500" />
            {t("affiliate.payouts.title")}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {t("affiliate.payouts.description")}
          </p>
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as AffiliatePayoutFilter)
          }
        >
          <SelectTrigger className="h-10 w-full rounded-xl text-xs sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("affiliate.payouts.filters.all")}
            </SelectItem>
            <SelectItem value="pending">
              {t("affiliate.payouts.filters.pending")}
            </SelectItem>
            <SelectItem value="paid">
              {t("affiliate.payouts.filters.paid")}
            </SelectItem>
            <SelectItem value="rejected">
              {t("affiliate.payouts.filters.rejected")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 *:text-start">
              <TableHead className="text-xs font-bold">
                {t("affiliate.payouts.table.affiliate")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.payouts.table.amount")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.payouts.table.sheba")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.payouts.table.nameMatch")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.payouts.table.status")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.payouts.table.requestedAt")}
              </TableHead>
              <TableHead className="text-center text-xs font-bold">
                {t("affiliate.payouts.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPayouts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {t("affiliate.payouts.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayouts.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="text-xs font-bold">
                      {item.affiliateName}
                    </div>
                    <div className="text-muted-foreground font-mono text-[10px]">
                      {item.affiliateCode}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatToman(item.amount)}
                  </TableCell>
                  <TableCell
                    className="text-primary font-mono text-xs"
                    dir="ltr"
                  >
                    {item.sheba}
                  </TableCell>
                  <TableCell>
                    {item.nameMatch ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <IconCheck className="size-3" />
                        {t("affiliate.payouts.nameMatch.ok")}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-500">
                        {t("affiliate.payouts.nameMatch.mismatch")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <PayoutStatusBadge payout={item} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {item.requestedAt}
                  </TableCell>
                  <TableCell className="text-center">
                    {isPayoutPending(item.status) ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-xl bg-emerald-600 text-[11px] font-bold hover:bg-emerald-500"
                          onClick={() => onApprove(item)}
                        >
                          {t("affiliate.payouts.actions.approve")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-xl border-rose-500/30 text-[11px] font-bold text-rose-500 hover:bg-rose-500/10"
                          onClick={() => onReject(item)}
                        >
                          {t("affiliate.payouts.actions.reject")}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">
                        {t("affiliate.payouts.actions.completed")}
                      </span>
                    )}
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

function PayoutStatusBadge({ payout }: { payout: AffiliatePayoutRequest }) {
  const { t } = useTranslation("common");

  if (payout.status === "paid") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
      >
        {t("affiliate.payouts.status.paid", {
          code: payout.payaCode || "پایا",
        })}
      </Badge>
    );
  }

  if (payout.status === "rejected") {
    return (
      <Badge
        variant="outline"
        className="border-rose-500/30 bg-rose-500/10 text-[10px] text-rose-500"
      >
        {t("affiliate.payouts.status.rejected")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
    >
      {t("affiliate.payouts.status.pending")}
    </Badge>
  );
}
