import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AFFILIATE_REJECT_REASONS } from "../constants";

type RejectPayoutDialogProps = {
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
};

export function RejectPayoutDialog({
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: RejectPayoutDialogProps) {
  const { t } = useTranslation("common");
  const [reason, setReason] = useState<string>(AFFILIATE_REJECT_REASONS[0]);

  useEffect(() => {
    if (open) setReason(AFFILIATE_REJECT_REASONS[0]);
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <span className="flex size-9 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500">
              <IconX className="size-5" />
            </span>
            {t("affiliate.rejectDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-[10px]">
            {t("affiliate.rejectDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason" className="font-bold">
              {t("affiliate.rejectDialog.reasonLabel")}
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger
                id="reject-reason"
                className="h-11 rounded-xl text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AFFILIATE_REJECT_REASONS.map((item) => (
                  <SelectItem key={item} value={item} className="text-xs">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="destructive"
            className="h-auto w-full rounded-xl py-3.5 text-xs font-bold"
          >
            {t("affiliate.rejectDialog.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
