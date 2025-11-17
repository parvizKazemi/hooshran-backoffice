import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { User } from "../../types";
import { getRoleLabel, getRoleVariant } from "../utils/user-helpers";

type UserRoleCellProps = {
  user: User;
};

export function UserRoleCell({ user }: UserRoleCellProps) {
  const { t } = useTranslation("common");
  const role = user.role || "user";
  const label = getRoleLabel(role, t);
  const variant = getRoleVariant(role);

  return <Badge variant={variant}>{label}</Badge>;
}
