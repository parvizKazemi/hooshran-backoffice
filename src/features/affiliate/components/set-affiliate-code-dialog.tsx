import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconLoader2, IconSearch, IconTicket } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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
import { useSearchAffiliatePartner } from "../hooks/use-affiliate-admin";
import { AFFILIATE_CODE_PATTERN } from "../constants";
import type { AffiliatePartner, SetAffiliateCodePayload } from "../types";
import {
  buildAffiliateDiscountCodePreview,
  isPartnerActive,
  isValidAffiliatePhone,
  toAffiliatePhoneLookup,
} from "../utils/affiliate.helpers";

export type AffiliateCodeDialogMode = "edit" | "manage";

type SetAffiliateCodeDialogProps = {
  open: boolean;
  mode: AffiliateCodeDialogMode;
  partner: AffiliatePartner | null;
  isSubmitting?: boolean;
  isToggling?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: SetAffiliateCodePayload) => void;
  onToggleStatus: (partner: AffiliatePartner) => void;
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

function hasCustomDiscountCode(target: AffiliatePartner): boolean {
  return (
    Boolean(target.discountCode) &&
    Boolean(target.affiliateCode) &&
    target.discountPercentage !== null &&
    target.discountPercentage !== undefined &&
    target.discountCode !==
      `${target.affiliateCode}${target.discountPercentage}`
  );
}

export function SetAffiliateCodeDialog({
  open,
  mode,
  partner,
  isSubmitting,
  isToggling,
  onOpenChange,
  onConfirm,
  onToggleStatus,
}: SetAffiliateCodeDialogProps) {
  const { t } = useTranslation("common");
  const searchMutation = useSearchAffiliatePartner();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [useCustomDiscountCode, setUseCustomDiscountCode] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [notFound, setNotFound] = useState(false);
  const [manageSearched, setManageSearched] = useState(false);
  // Local live copy of the partner being edited (prop snapshot goes stale
  // after status/code mutations, so the dialog owns its display state).
  const [localPartner, setLocalPartner] = useState<AffiliatePartner | null>(
    null
  );

  const activePartner = localPartner;
  const showCodeForm =
    mode === "edit" || activePartner !== null || (manageSearched && notFound);

  const applyPartnerToForm = (target: AffiliatePartner) => {
    setAffiliateCode(target.affiliateCode || "");
    setDiscountPercentage(
      target.discountPercentage === null ||
        target.discountPercentage === undefined
        ? ""
        : String(target.discountPercentage)
    );
    const hasCustom = hasCustomDiscountCode(target);
    setUseCustomDiscountCode(hasCustom);
    setDiscountCode(hasCustom ? target.discountCode : "");
  };

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setNotFound(false);
    setManageSearched(false);
    setLocalPartner(null);
    searchMutation.reset();

    if (mode === "edit" && partner) {
      setPhoneNumber("");
      setLocalPartner(partner);
      applyPartnerToForm(partner);
      return;
    }

    // manage mode: start with empty search + empty form
    setPhoneNumber("");
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

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!isValidAffiliatePhone(phoneNumber)) {
      setErrors({
        phoneNumber: t("affiliate.codeDialog.errors.phoneNumberInvalid"),
      });
      return;
    }
    setErrors({});
    setNotFound(false);
    try {
      const lookup = toAffiliatePhoneLookup(phoneNumber);
      const results = await searchMutation.mutateAsync(lookup);
      const exact =
        results.find((item) => item.phone.replace(/[\s-]/g, "") === lookup) ??
        results[0] ??
        null;
      setManageSearched(true);
      if (!exact) {
        setLocalPartner(null);
        setNotFound(true);
        return;
      }
      setLocalPartner(exact);
      applyPartnerToForm(exact);
    } catch {
      setManageSearched(true);
      setLocalPartner(null);
      setNotFound(true);
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

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

    // Manage mode without a found partner → create affiliate for the searched number.
    if (!activePartner) {
      onConfirm({
        mode: "create",
        phoneNumber: toAffiliatePhoneLookup(phoneNumber),
        body,
      });
      return;
    }

    // Keep dialog view in sync (parent dashboard refetch updates the table).
    setLocalPartner({
      ...activePartner,
      affiliateCode: body.affiliateCode,
      discountCode:
        body.discountCode ??
        (body.discountPercentage !== undefined
          ? `${body.affiliateCode}${body.discountPercentage}`
          : activePartner.discountCode),
      discountPercentage:
        body.discountPercentage ?? activePartner.discountPercentage,
      code: body.affiliateCode,
    });

    onConfirm({
      mode: "edit",
      accountUuid: activePartner.id,
      body,
    });
  };

  const handleToggleStatus = () => {
    if (!activePartner) return;
    setLocalPartner({
      ...activePartner,
      status: isPartnerActive(activePartner.status) ? "suspended" : "active",
    });
    onToggleStatus(activePartner);
  };

  const title =
    mode === "manage"
      ? t("affiliate.manageDialog.title")
      : t("affiliate.codeDialog.editTitle");

  const description =
    mode === "manage"
      ? t("affiliate.manageDialog.description")
      : t("affiliate.codeDialog.editDescription", {
          name: partner?.name ?? "—",
        });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <span className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              <IconTicket className="size-5" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-[10px]">
            {description}
          </DialogDescription>
        </DialogHeader>

        {mode === "manage" ? (
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder={t("affiliate.codeDialog.phoneNumberPlaceholder")}
              className="h-11 flex-1 rounded-xl text-xs"
              dir="ltr"
              autoComplete="tel"
            />
            <Button
              type="submit"
              disabled={searchMutation.isPending}
              className="h-11 shrink-0 rounded-xl bg-blue-600 px-4 text-xs font-bold hover:bg-blue-500"
            >
              {searchMutation.isPending ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconSearch className="size-4" />
              )}
              {t("affiliate.manageDialog.search")}
            </Button>
          </form>
        ) : null}

        {mode === "manage" && errors.phoneNumber ? (
          <p className="-mt-2 text-[11px] text-rose-500">
            {errors.phoneNumber}
          </p>
        ) : null}

        {mode === "manage" && notFound && !activePartner ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
            {t("affiliate.manageDialog.notFound")}
          </div>
        ) : null}

        {activePartner ? (
          <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-xl border p-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">
                {activePartner.name}
              </div>
              <div
                className="text-muted-foreground font-mono text-[11px]"
                dir="ltr"
              >
                {activePartner.phone}
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                isPartnerActive(activePartner.status)
                  ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-[10px] text-rose-500"
              }
            >
              {isPartnerActive(activePartner.status)
                ? t("affiliate.partners.status.active")
                : t("affiliate.partners.status.suspended")}
            </Badge>
          </div>
        ) : null}

        {showCodeForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                  <Label
                    htmlFor="affiliate-discount-code"
                    className="font-bold"
                  >
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

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-auto flex-1 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold hover:bg-emerald-500"
              >
                {isSubmitting
                  ? t("affiliate.codeDialog.submitting")
                  : t("affiliate.codeDialog.submit")}
              </Button>
              {activePartner ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isToggling}
                  onClick={handleToggleStatus}
                  className="h-auto shrink-0 rounded-xl px-4 text-xs font-bold"
                >
                  {isPartnerActive(activePartner.status)
                    ? t("affiliate.partners.actions.suspend")
                    : t("affiliate.partners.actions.activate")}
                </Button>
              ) : null}
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
