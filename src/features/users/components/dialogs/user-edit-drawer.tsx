import { useTranslation } from "react-i18next";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("users.editUser")}</DrawerTitle>
          <DrawerDescription>{t("users.editUserInfo")}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <UserForm user={user} onSuccess={onSuccess} onCancel={onCancel} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
