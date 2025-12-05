import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { User } from "../../types";
import { UserForm } from "../user-form";

type UserEditDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function UserEditDrawer({
  open,
  onOpenChange,
  user,
  onSuccess,
  onCancel,
}: UserEditDrawerProps) {
  const { t } = useTranslation("common");

  if (!user) return null;

  // convert drawer to dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("users.editUser")}</DialogTitle>
          <DialogDescription>{t("users.editUserInfo")}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <UserForm user={user} onSuccess={onSuccess} onCancel={onCancel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
