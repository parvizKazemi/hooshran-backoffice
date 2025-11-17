import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "../../types";
import { getUserDisplayName, getUserInitials } from "../utils/user-helpers";

type UserNameCellProps = {
  user: User;
};

export function UserNameCell({ user }: UserNameCellProps) {
  const { t } = useTranslation("common");
  const name = getUserDisplayName(user, t("users.noName"));
  const initials = getUserInitials(name);

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        {user.email && (
          <span className="text-muted-foreground text-sm">{user.email}</span>
        )}
      </div>
    </div>
  );
}
