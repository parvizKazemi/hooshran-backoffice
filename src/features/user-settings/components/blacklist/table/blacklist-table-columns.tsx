import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import type { BlacklistRecord } from "../../../types";
import { formatBlacklistDate, getReasonBadgeClass } from "../blacklist-utils";
import { BlacklistActionsCell } from "./blacklist-actions-cell";

type UseBlacklistTableColumnsProps = {
  onEdit: (record: BlacklistRecord) => void;
  onUnblock: (record: BlacklistRecord) => void;
};

export function useBlacklistTableColumns({
  onEdit,
  onUnblock,
}: UseBlacklistTableColumnsProps): ColumnDef<BlacklistRecord>[] {
  const { t } = useTranslation("common");

  return [
    {
      accessorKey: "phoneNumber",
      header: t("userSettings.blacklistPage.table.phone"),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold">
          {row.original.phoneNumber}
        </span>
      ),
    },
    {
      accessorKey: "banningReason",
      header: t("userSettings.blacklistPage.table.reason"),
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-black ${getReasonBadgeClass(
            row.original.banningReason ?? ""
          )}`}
        >
          {row.original.banningReason || "—"}
        </span>
      ),
    },
    {
      id: "bannedAt",
      header: t("userSettings.blacklistPage.table.bannedAt"),
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-sm">
          {formatBlacklistDate(
            row.original.updatedAt ?? row.original.createdAt
          )}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center">
          {t("userSettings.blacklistPage.table.actions")}
        </div>
      ),
      cell: ({ row }) => (
        <BlacklistActionsCell
          record={row.original}
          onEdit={onEdit}
          onUnblock={onUnblock}
        />
      ),
    },
  ];
}
