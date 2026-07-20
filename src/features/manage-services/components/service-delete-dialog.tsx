import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ManageService, ServiceDeleteMode } from "../types";

type ServiceDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ManageService | null;
  categoryName?: string | null;
  allowRemoveFromCategory: boolean;
  onConfirm: (mode: ServiceDeleteMode) => void;
};

export function ServiceDeleteDialog({
  open,
  onOpenChange,
  service,
  categoryName,
  allowRemoveFromCategory,
  onConfirm,
}: ServiceDeleteDialogProps) {
  const { t } = useTranslation("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive/30 sm:max-w-md">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto mb-2 flex size-14 items-center justify-center rounded-full border">
            <IconAlertTriangle className="size-7" />
          </div>
          <AlertDialogTitle>
            {t("manageServices.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-relaxed">
            {t("manageServices.deleteDialog.description", {
              name: service?.name ?? "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-2">
          {allowRemoveFromCategory ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onConfirm("fromCategory")}
            >
              {t("manageServices.deleteDialog.removeFromCategory", {
                category: categoryName ?? "",
              })}
            </Button>
          ) : null}
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={(event) => {
              event.preventDefault();
              onConfirm("entire");
            }}
          >
            {t("manageServices.deleteDialog.deleteEntire")}
          </AlertDialogAction>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="w-full">
            {t("manageServices.form.cancel")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
