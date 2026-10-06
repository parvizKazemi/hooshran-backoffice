import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconTicket } from "@tabler/icons-react";
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
import { AFFILIATE_CODE_PATTERN } from "../constants";
import type { AffiliatePartner, SetAffiliateCodePayload } from "../types";
import {
  buildAffiliateDiscountCodePreview,
  isValidAffiliatePhone,
  toAffiliatePhoneLookup,
} from "../utils/affiliate.helpers";

type SetAffiliateCodeDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  partner: AffiliatePartner | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: SetAffiliateCodePayload) => void;
};

type FormErrors = {
  phoneNumber?: string;
  affiliateCode?: string;
  discountPercentage?: string;
  discountCode?: string;
};

function normalizeCodeInput(value: string): string {
  return value.trim().toUpperCase();
}

export function SetAffiliateCodeDialog({
  open,
  mode,
  partner,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: SetAffiliateCodeDialogProps) {
  const { t } = useTranslation("common");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [useCustomDiscountCode, setUseCustomDiscountCode] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setPhoneNumber("");

    if (mode === "edit" && partner) {
      setAffiliateCode(partner.affiliateCode || "");
      setDiscountPercentage(
        partner.discountPercentage === null ||
          partner.discountPercentage === undefined
          ? ""
          : String(partner.discountPercentage)
      );
      const hasCustom =
        Boolean(partner.discountCode) &&
        Boolean(partner.affiliateCode) &&
        partner.discountPercentage !== null &&
        partner.discountPercentage !== undefined &&
        partner.discountCode !==
          `${partner.affiliateCode}${partner.discountPercentage}`;
      setUseCustomDiscountCode(hasCustom);
      setDiscountCode(hasCustom ? partner.discountCode : "");
      return;
    }

    setAffiliateCode("");
    setDiscountPercentage("");
    setUseCustomDiscountCode(false);
    setDiscountCode("");
  }, [open, mode, partner]);

  const previewCode = useMemo(() => {
    if (useCustomDiscountCode && discountCode.trim()) {
      return normalizeCodeInput(discountCode);
    }
    const percent = discountPercentage.trim()
      ? Number(discountPercentage)
      : null;
    return buildAffiliateDiscountCodePreview(
      affiliateCode,
      Number.isFinite(percent) ? percent : null
    );
  }, [affiliateCode, discountPercentage, discountCode, useCustomDiscountCode]);

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (mode === "create" && !isValidAffiliatePhone(phoneNumber)) {
      next.phoneNumber = t("affiliate.codeDialog.errors.phoneNumberInvalid");
    }

    const normalizedAffiliateCode = normalizeCodeInput(affiliateCode);
    if (!AFFILIATE_CODE_PATTERN.test(normalizedAffiliateCode)) {
      next.affiliateCode = t(
        "affiliate.codeDialog.errors.affiliateCodeInvalid"
      );
    }

    if (discountPercentage.trim()) {
      const percent = Number(discountPercentage);
      if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
        next.discountPercentage = t(
          "affiliate.codeDialog.errors.discountPercentageInvalid"
        );
      }
    }

    if (useCustomDiscountCode) {
      const normalizedDiscountCode = normalizeCodeInput(discountCode);
      if (!AFFILIATE_CODE_PATTERN.test(normalizedDiscountCode)) {
        next.discountCode = t(
          "affiliate.codeDialog.errors.discountCodeInvalid"
        );
      }
    }

    return next;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body: SetAffiliateCodePayload["body"] = {
      affiliateCode: normalizeCodeInput(affiliateCode),
    };

    if (discountPercentage.trim()) {
      body.discountPercentage = Number(discountPercentage);
    }

    if (useCustomDiscountCode && discountCode.trim()) {
      body.discountCode = normalizeCodeInput(discountCode);
    }

    if (mode === "create") {
      onConfirm({
        mode: "create",
        phoneNumber: toAffiliatePhoneLookup(phoneNumber),
        body,
      });
      return;
    }

    if (!partner) return;
    onConfirm({
      mode: "edit",
      accountUuid: partner.id,
      body,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <span className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <IconTicket className="size-5" />
            </span>
            {mode === "create"
              ? t("affiliate.codeDialog.createTitle")
              : t("affiliate.codeDialog.editTitle")}
          </DialogTitle>
          <DialogDescription className="text-[10px]">
            {mode === "create"
              ? t("affiliate.codeDialog.createDescription")
              : t("affiliate.codeDialog.editDescription", {
                  name: partner?.name ?? "—",
                })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "create" ? (
            <div className="space-y-1.5">
              <Label htmlFor="affiliate-phone-number" className="font-bold">
                {t("affiliate.codeDialog.phoneNumberLabel")}
              </Label>
              <Input
                id="affiliate-phone-number"
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder={t("affiliate.codeDialog.phoneNumberPlaceholder")}
                className="h-11 rounded-xl text-xs"
                dir="ltr"
                autoComplete="tel"
              />
              {errors.phoneNumber ? (
                <p className="text-[11px] text-rose-500">
                  {errors.phoneNumber}
                </p>
              ) : (
                <p className="text-muted-foreground text-[10px]">
                  {t("affiliate.codeDialog.phoneNumberHint")}
                </p>
              )}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="affiliate-code" className="font-bold">
              {t("affiliate.codeDialog.affiliateCodeLabel")}
            </Label>
            <Input
              id="affiliate-code"
              value={affiliateCode}
              onChange={(event) =>
                setAffiliateCode(event.target.value.toUpperCase())
              }
              placeholder={t("affiliate.codeDialog.affiliateCodePlaceholder")}
              className="text-primary h-11 rounded-xl !font-mono text-xs"
              dir="ltr"
              autoComplete="off"
            />
            {errors.affiliateCode ? (
              <p className="text-[11px] text-rose-500">
                {errors.affiliateCode}
              </p>
            ) : (
              <p className="text-muted-foreground text-[10px]">
                {t("affiliate.codeDialog.affiliateCodeHint")}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="affiliate-discount-percentage"
              className="font-bold"
            >
              {t("affiliate.codeDialog.discountPercentageLabel")}
            </Label>
            <Input
              id="affiliate-discount-percentage"
              type="number"
              min={0}
              max={100}
              step={1}
              value={discountPercentage}
              onChange={(event) => setDiscountPercentage(event.target.value)}
              placeholder={t(
                "affiliate.codeDialog.discountPercentagePlaceholder"
              )}
              className="h-11 rounded-xl text-xs"
              dir="ltr"
            />
            {errors.discountPercentage ? (
              <p className="text-[11px] text-rose-500">
                {errors.discountPercentage}
              </p>
            ) : (
              <p className="text-muted-foreground text-[10px]">
                {t("affiliate.codeDialog.discountPercentageHint")}
              </p>
            )}
          </div>

          <div className="bg-muted/40 space-y-3 rounded-xl border p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={useCustomDiscountCode}
                onChange={(event) =>
                  setUseCustomDiscountCode(event.target.checked)
                }
                className="size-3.5 accent-emerald-600"
              />
              <span className="text-[11px] font-bold">
                {t("affiliate.codeDialog.customDiscountCodeToggle")}
              </span>
            </label>

            {useCustomDiscountCode ? (
              <div className="space-y-1.5">
                <Label htmlFor="affiliate-discount-code" className="font-bold">
                  {t("affiliate.codeDialog.discountCodeLabel")}
                </Label>
                <Input
                  id="affiliate-discount-code"
                  value={discountCode}
                  onChange={(event) =>
                    setDiscountCode(event.target.value.toUpperCase())
                  }
                  placeholder={t(
                    "affiliate.codeDialog.discountCodePlaceholder"
                  )}
                  className="h-11 rounded-xl !font-mono text-xs"
                  dir="ltr"
                  autoComplete="off"
                />
                {errors.discountCode ? (
                  <p className="text-[11px] text-rose-500">
                    {errors.discountCode}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px]">
                  {t("affiliate.codeDialog.previewLabel")}
                </span>
                <div
                  className="!font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400"
                  dir="ltr"
                >
                  {previewCode || "—"}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold hover:bg-emerald-500"
          >
            {isSubmitting
              ? t("affiliate.codeDialog.submitting")
              : t("affiliate.codeDialog.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
