import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AffiliatePayoutRequest } from "../types";
import { formatToman } from "../utils/affiliate.helpers";

type ApprovePayoutDialogProps = {
  payout: AffiliatePayoutRequest | null;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payaTrackingCode: string) => void;
};

export function ApprovePayoutDialog({
  payout,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: ApprovePayoutDialogProps) {
  const { t } = useTranslation("common");
  const [payaTrackingCode, setPayaTrackingCode] = useState("");

  useEffect(() => {
    if (open) setPayaTrackingCode("");
  }, [open, payout?.id]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payaTrackingCode.trim()) return;
    onConfirm(payaTrackingCode.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <span className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <IconCheck className="size-5" />
            </span>
            {t("affiliate.approveDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-[10px]">
            {payout
              ? t("affiliate.approveDialog.subtitle", {
                  name: payout.affiliateName,
                })
              : ""}
          </DialogDescription>
        </DialogHeader>

        {payout ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-muted/40 space-y-1 rounded-xl border p-3">
              <span className="text-muted-foreground text-[11px]">
                {t("affiliate.approveDialog.amountLabel")}
              </span>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatToman(payout.amount)}
              </div>
              <span
                className="text-primary block font-mono text-[10px]"
                dir="ltr"
              >
                {payout.sheba}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paya-tracking-code" className="font-bold">
                {t("affiliate.approveDialog.trackingLabel")}
              </Label>
              <Input
                id="paya-tracking-code"
                value={payaTrackingCode}
                onChange={(event) => setPayaTrackingCode(event.target.value)}
                placeholder={t("affiliate.approveDialog.trackingPlaceholder")}
                className="text-primary h-11 rounded-xl font-mono text-xs"
                dir="ltr"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-auto w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold hover:bg-emerald-500"
            >
              {t("affiliate.approveDialog.submit")}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
