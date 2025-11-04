import { memo } from "react";
import { useTranslation } from "react-i18next";
import { UserCreditLog } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserCreditLogsTableProps = {
  data: UserCreditLog[];
};

export const UserCreditLogsTable = memo(function UserCreditLogsTable({
  data,
}: UserCreditLogsTableProps) {
  const { t } = useTranslation("common");

  const typeLabels: Record<string, string> = {
    INCREASE: t("userCredits.types.increase"),
    DECREASE: t("userCredits.types.decrease"),
    SUBSCRIPTION: t("userCredits.types.subscription"),
  };

  const typeVariants: Record<string, "default" | "secondary" | "destructive"> =
    {
      INCREASE: "default",
      DECREASE: "destructive",
      SUBSCRIPTION: "secondary",
    };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("userCredits.logs.table.type")}</TableHead>
            <TableHead>{t("userCredits.logs.table.amount")}</TableHead>
            <TableHead>{t("userCredits.logs.table.source")}</TableHead>
            <TableHead>{t("userCredits.logs.table.description")}</TableHead>
            <TableHead>{t("userCredits.logs.table.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant={typeVariants[log.type] || "secondary"}>
                    {typeLabels[log.type] || log.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      log.type === "DECREASE"
                        ? "text-destructive"
                        : "text-green-600"
                    }
                  >
                    {log.type === "DECREASE" ? "-" : "+"}
                    {Math.abs(log.credit_amount)} {t("userCredits.credit")}
                  </span>
                </TableCell>
                <TableCell>{log.source || "-"}</TableCell>
                <TableCell>{log.description || "-"}</TableCell>
                <TableCell>
                  {new Date(log.createdAt).toLocaleString("fa-IR")}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("userCredits.logs.noResults")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});
