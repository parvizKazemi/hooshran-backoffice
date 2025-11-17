import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { User } from "../../types";
import {
  getStatusLabel,
  getStatusVariant,
  getUserStatus,
} from "../utils/user-helpers";

type UserStatusCellProps = {
  user: User;
};

export function UserStatusCell({ user }: UserStatusCellProps) {
  const { t } = useTranslation("common");
  const status = getUserStatus(user);
  const label = getStatusLabel(status, t);
  const variant = getStatusVariant(status);

  return <Badge variant={variant}>{label}</Badge>;
}
