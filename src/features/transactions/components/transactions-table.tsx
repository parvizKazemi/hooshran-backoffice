// جدول نمایش تراکنش‌ها
// ستون‌ها: شناسه، رفرنس، کاربر، درگاه، مبلغ، وضعیت، تاریخ
// از Badge برای نمایش وضعیت با رنگ‌بندی استفاده می‌شود
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "../types";

export function TransactionsTable({ data }: { data: Transaction[] }) {
  const { t } = useTranslation("common");
  const statusLabel: Record<Transaction["status"], string> = {
    success: t("transactions.statuses.success"),
    failed: t("transactions.statuses.failed"),
    pending: t("transactions.statuses.pending"),
  };
  const statusVariant: Record<
    Transaction["status"],
    "default" | "secondary" | "destructive"
  > = {
    success: "default",
    failed: "destructive",
    pending: "secondary",
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">
              {t("transactions.table.id")}
            </TableHead>
            <TableHead className="text-start">
              {t("transactions.table.reference")}
            </TableHead>
            <TableHead className="text-start">
              {t("transactions.table.user")}
            </TableHead>
            <TableHead className="text-start">
              {t("transactions.table.gateway")}
            </TableHead>
            <TableHead className="text-start">
              {t("transactions.table.amount")}
            </TableHead>
            <TableHead className="text-start">
              {t("transactions.table.status")}
            </TableHead>
            <TableHead className="text-start">
              {t("transactions.table.date")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((trx) => (
              <TableRow key={trx.id}>
                <TableCell>{trx.id}</TableCell>
                <TableCell>{trx.refId || "-"}</TableCell>
                <TableCell>{trx.userPhone || "-"}</TableCell>
                <TableCell className="uppercase">{trx.gateway}</TableCell>
                <TableCell>{trx.amount.toLocaleString("fa-IR")}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[trx.status]}>
                    {statusLabel[trx.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(trx.createdAt).toLocaleString("fa-IR")}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t("transactions.noResults")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
