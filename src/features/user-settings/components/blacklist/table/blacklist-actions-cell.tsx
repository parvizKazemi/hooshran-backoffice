import { Button } from "@/components/ui/button";
import { IconEdit, IconLockOpen } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { BlacklistRecord } from "../../../types";

type BlacklistActionsCellProps = {
  record: BlacklistRecord;
  onEdit: (record: BlacklistRecord) => void;
  onUnblock: (record: BlacklistRecord) => void;
};

export function BlacklistActionsCell({
  record,
  onEdit,
  onUnblock,
}: BlacklistActionsCellProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onEdit(record)}
        title={t("userSettings.blacklistPage.actions.edit")}
      >
        <IconEdit className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        onClick={() => onUnblock(record)}
        title={t("userSettings.blacklistPage.actions.unban")}
      >
        <IconLockOpen className="size-4" />
      </Button>
    </div>
  );
}
