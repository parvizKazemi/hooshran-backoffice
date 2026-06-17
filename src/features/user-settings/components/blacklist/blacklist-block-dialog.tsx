import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconAlertTriangle,
  IconEdit,
  IconLoader2,
  IconPhone,
  IconUserMinus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BLACKLIST_REASON_SUGGESTIONS,
  isValidIranPhone,
} from "./blacklist-utils";
import type { BlacklistRecord } from "../../types";

type BlacklistBlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  record?: BlacklistRecord | null;
  isSubmitting: boolean;
  onSubmit: (payload: {
    phoneNumber: string;
    banningReason: string;
    uuid?: string;
  }) => Promise<void>;
};

export function BlacklistBlockDialog({
  open,
  onOpenChange,
  mode,
  record,
  isSubmitting,
  onSubmit,
}: BlacklistBlockDialogProps) {
  const { t } = useTranslation("common");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [banningReason, setBanningReason] = useState("");

  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && record) {
      setPhoneNumber(record.phoneNumber);
      setBanningReason(record.banningReason ?? "");
      return;
    }

    setPhoneNumber("");
    setBanningReason("");
  }, [open, isEditMode, record]);

  const handleSubmit = async () => {
    const trimmedPhone = phoneNumber.trim();
    const trimmedReason = banningReason.trim();

    if (!isEditMode && !isValidIranPhone(trimmedPhone)) {
      toast.error(t("userSettings.blacklistPage.toasts.invalidPhone"));
      return;
    }

    if (!trimmedReason) {
      toast.error(t("userSettings.blacklistPage.toasts.reasonRequired"));
      return;
    }

    await onSubmit({
      phoneNumber: trimmedPhone,
      banningReason: trimmedReason,
      uuid: record?.uuid,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md" showCloseButton>
        <div className="border-b py-5 pr-12">
          <DialogHeader className="space-y-3 text-right sm:text-right">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                {isEditMode ? (
                  <IconEdit className="size-5" />
                ) : (
                  <IconUserMinus className="size-5" />
                )}
              </div>
              <div className="flex flex-col items-start gap-1">
                <DialogTitle className="text-foreground text-sm font-bold">
                  {isEditMode
                    ? t("userSettings.blacklistPage.modal.editTitle")
                    : t("userSettings.blacklistPage.modal.addTitle")}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-[11px]">
                  {t("userSettings.blacklistPage.modal.description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="blacklist-phone" className="text-xs font-bold">
              {t("userSettings.blacklistPage.modal.phoneLabel")}{" "}
              <span className="text-rose-500 dark:text-rose-400">*</span>
            </Label>
            <div className="relative">
              <Input
                id="blacklist-phone"
                type="tel"
                dir="ltr"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                readOnly={isEditMode}
                placeholder={t(
                  "userSettings.blacklistPage.modal.phonePlaceholder"
                )}
                className={`rounded-xl py-5 pr-10 text-xs font-semibold ${
                  isEditMode ? "bg-muted cursor-not-allowed" : ""
                }`}
              />
              <IconPhone className="text-muted-foreground absolute top-3.5 right-3.5 size-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="blacklist-reason" className="text-xs font-bold">
              {t("userSettings.blacklistPage.modal.reasonLabel")}{" "}
              <span className="text-rose-500 dark:text-rose-400">*</span>
            </Label>
            <div className="relative">
              <Input
                id="blacklist-reason"
                value={banningReason}
                onChange={(event) => setBanningReason(event.target.value)}
                placeholder={t(
                  "userSettings.blacklistPage.modal.reasonPlaceholder"
                )}
                className="rounded-xl py-5 pr-10 text-xs font-bold"
              />
              <IconAlertTriangle className="text-muted-foreground absolute top-3.5 right-3.5 size-4" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-[10px] font-bold">
                {t("userSettings.blacklistPage.modal.suggestionsLabel")}
              </span>
              {BLACKLIST_REASON_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setBanningReason(suggestion)}
                  className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer rounded px-2 py-0.5 text-[10px] transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-3 border-t px-6 py-4 sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl text-xs font-bold"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("userSettings.blacklistPage.actions.cancel")}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-red-600 text-xs font-bold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <IconLoader2 className="size-4 animate-spin" />}
            {isEditMode
              ? t("userSettings.blacklistPage.actions.saveChanges")
              : t("userSettings.blacklistPage.actions.confirmBan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
