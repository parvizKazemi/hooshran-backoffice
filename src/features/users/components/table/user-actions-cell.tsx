import { Button } from "@/components/ui/button";
import { IconEdit, IconKey, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { User } from "../../types";

type UserActionsCellProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
};

export function UserActionsCell({
  user,
  onEdit,
  onDelete,
  onResetPassword,
}: UserActionsCellProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onEdit(user)}
        title={t("users.actions.edit")}
      >
        <IconEdit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onResetPassword(user)}
        title={t("users.actions.resetPassword")}
      >
        <IconKey className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive size-8"
        onClick={() => onDelete(user)}
        title={t("users.actions.delete")}
      >
        <IconTrash className="h-4 w-4" />
      </Button>
    </div>
  );
}
