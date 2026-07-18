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
import type { PurgeOptionId } from "../types";

type ClearUserConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  selectedOptions: PurgeOptionId[];
  isPending: boolean;
  onConfirm: () => void;
};

export function ClearUserConfirmDialog({
  open,
  onOpenChange,
  phoneNumber,
  selectedOptions,
  isPending,
  onConfirm,
}: ClearUserConfirmDialogProps) {
  const { t } = useTranslation("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive/30 sm:max-w-md">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto mb-2 flex size-16 items-center justify-center rounded-full border shadow-sm">
            <IconAlertTriangle className="size-8 animate-pulse" />
          </div>
          <AlertDialogTitle className="text-destructive">
            {t("clearUserData.confirmDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-relaxed">
            {t("clearUserData.confirmDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-destructive/5 border-destructive/15 space-y-1 rounded-2xl border p-3 text-xs">
          <p className="border-destructive/15 text-destructive mb-1 border-b pb-1 text-center font-bold">
            {t("clearUserData.confirmDialog.summaryTitle")}
          </p>
          <p className="text-muted-foreground mb-2 text-center font-mono text-[11px]">
            {phoneNumber}
          </p>
          <ul className="text-destructive/90 list-inside list-disc space-y-0.5 text-right font-semibold">
            {selectedOptions.map((optionId) => (
              <li key={optionId}>
                {t(`clearUserData.confirmDialog.items.${optionId}`)}
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
          <AlertDialogCancel disabled={isPending}>
            {t("clearUserData.actions.cancel")}
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
            {t("clearUserData.actions.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
