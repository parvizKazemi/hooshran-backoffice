import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { UserForm } from "../user-form";

type UserCreateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
  onCreateClick: () => void;
};

export function UserCreateDrawer({
  open,
  onOpenChange,
  onSuccess,
  onCancel,
  onCreateClick,
}: UserCreateDrawerProps) {
  const { t } = useTranslation("common");

  return (
    <>
      <Button onClick={onCreateClick} className="self-start">
        <IconPlus className="mr-2 size-4" />
        {t("users.addUser")}
      </Button>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("users.addNewUser")}</DrawerTitle>
            <DrawerDescription>{t("users.addUserInfo")}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <UserForm onSuccess={onSuccess} onCancel={onCancel} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
