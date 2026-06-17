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
import { IconLoader2, IconLockOpen } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type BlacklistUnblockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber?: string;
  isSubmitting: boolean;
  onConfirm: () => Promise<void>;
};

export function BlacklistUnblockDialog({
  open,
  onOpenChange,
  phoneNumber,
  isSubmitting,
  onConfirm,
}: BlacklistUnblockDialogProps) {
  const { t } = useTranslation("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader className="items-center space-y-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-950/50 dark:text-emerald-400">
            <IconLockOpen className="size-6" />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle className="text-foreground text-sm font-bold">
              {t("userSettings.blacklistPage.unblock.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-[11px] leading-relaxed">
              {phoneNumber
                ? t("userSettings.blacklistPage.unblock.descriptionWithPhone", {
                    phone: phoneNumber,
                  })
                : t("userSettings.blacklistPage.unblock.description")}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2.5 sm:justify-stretch">
          <AlertDialogCancel
            className="h-10 flex-1 rounded-xl text-xs font-bold"
            disabled={isSubmitting}
          >
            {t("userSettings.blacklistPage.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-10 flex-1 rounded-xl bg-emerald-600 text-xs font-bold hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            {isSubmitting && <IconLoader2 className="size-4 animate-spin" />}
            {t("userSettings.blacklistPage.actions.confirmUnban")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
