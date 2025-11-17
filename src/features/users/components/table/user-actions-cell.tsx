import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "../../types";

type UserActionsCellProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UserActionsCell({
  user,
  onEdit,
  onDelete,
}: UserActionsCellProps) {
  const { t } = useTranslation("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">{t("users.actions.openMenu")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <IconEdit className="mr-2 size-4" />
          {t("users.actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(user)}
          className="text-destructive"
        >
          <IconTrash className="mr-2 size-4" />
          {t("users.actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
