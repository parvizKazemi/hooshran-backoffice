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
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending = false,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive/30 sm:max-w-md">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto mb-2 flex size-14 items-center justify-center rounded-full border">
            <IconAlertTriangle className="size-7" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
          <AlertDialogCancel disabled={isPending}>
            {t("promptAssistant.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? <IconLoader2 className="size-4 animate-spin" /> : null}
            {t("promptAssistant.actions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
