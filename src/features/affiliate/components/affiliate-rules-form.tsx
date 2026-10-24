import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconDeviceFloppy,
  IconGift,
  IconPercentage,
  IconSettings,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AffiliateProgramRules } from "../types";

type AffiliateRulesFormProps = {
  rules: AffiliateProgramRules;
  isSaving?: boolean;
  onSave: (rules: AffiliateProgramRules) => void;
};

type NumericRuleKey =
  | "firstCommissionRate"
  | "capAmount"
  | "renewalCommissionRate"
  | "renewalSunsetDays"
  | "holdDays"
  | "minPayoutAmount"
  | "buyerDiscountPercentage"
  | "expirationHours"
  | "rewardCredit"
  | "rewardExpirationDays";

type NumericRuleField = {
  key: NumericRuleKey;
  labelKey: string;
  hintKey: string;
  toneClass: string;
  min?: number;
  max?: number;
  step?: number;
};

const AFFILIATE_RULE_FIELDS: NumericRuleField[] = [
  {
    key: "firstCommissionRate",
    labelKey: "affiliate.rules.firstCommissionRate",
    hintKey: "affiliate.rules.firstCommissionRateHint",
    toneClass: "text-emerald-600 dark:text-emerald-400",
    min: 1,
    max: 100,
  },
  {
    key: "capAmount",
    labelKey: "affiliate.rules.capAmount",
    hintKey: "affiliate.rules.capAmountHint",
    toneClass: "text-emerald-600 dark:text-emerald-400",
    step: 100_000,
  },
  {
    key: "renewalCommissionRate",
    labelKey: "affiliate.rules.renewalCommissionRate",
    hintKey: "affiliate.rules.renewalCommissionRateHint",
    toneClass: "text-indigo-600 dark:text-indigo-400",
    min: 1,
    max: 100,
  },
  {
    key: "renewalSunsetDays",
    labelKey: "affiliate.rules.renewalSunsetDays",
    hintKey: "affiliate.rules.renewalSunsetDaysHint",
    toneClass: "text-indigo-600 dark:text-indigo-400",
    min: 30,
    max: 365,
  },
  {
    key: "holdDays",
    labelKey: "affiliate.rules.holdDays",
    hintKey: "affiliate.rules.holdDaysHint",
    toneClass: "text-amber-600 dark:text-amber-400",
    min: 1,
    max: 90,
  },
  {
    key: "minPayoutAmount",
    labelKey: "affiliate.rules.minPayoutAmount",
    hintKey: "affiliate.rules.minPayoutAmountHint",
    toneClass: "text-amber-600 dark:text-amber-400",
    step: 50_000,
  },
  {
    key: "buyerDiscountPercentage",
    labelKey: "affiliate.rules.buyerDiscountPercentage",
    hintKey: "affiliate.rules.buyerDiscountPercentageHint",
    toneClass: "text-emerald-600 dark:text-emerald-400",
    min: 1,
    max: 100,
  },
];

const REFERRAL_RULE_FIELDS: NumericRuleField[] = [
  {
    key: "expirationHours",
    labelKey: "affiliate.rules.expirationHours",
    hintKey: "affiliate.rules.expirationHoursHint",
    toneClass: "text-amber-600 dark:text-amber-400",
    min: 1,
    max: 720,
    step: 1,
  },
  // {
  //   key: "rewardExpirationDays",
  //   labelKey: "affiliate.rules.rewardExpirationDays",
  //   hintKey: "affiliate.rules.rewardExpirationDaysHint",
  //   toneClass: "text-amber-600 dark:text-amber-400",
  //   min: 1,
  //   max: 365,
  //   step: 1,
  // },
];

export function AffiliateRulesForm({
  rules,
  isSaving,
  onSave,
}: AffiliateRulesFormProps) {
  const { t } = useTranslation("common");
  const [formValues, setFormValues] = useState<AffiliateProgramRules>(rules);

  useEffect(() => {
    setFormValues(rules);
  }, [rules]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(formValues);
  };

  const isReferralActive = formValues.isReferralEnabled !== false;

  return (
    <div className="bg-card space-y-8 rounded-3xl border p-6 shadow-sm">
      <div className="border-b pb-4">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <IconSettings className="size-5 text-amber-500" />
          {t("affiliate.rules.title")}
        </h3>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("affiliate.rules.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* Section 1: Affiliate Marketing Rules                         */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="border-border/60 flex items-center gap-2 border-b pb-2.5">
            <IconPercentage className="size-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h4 className="text-foreground text-xs font-bold">
                {t("affiliate.rules.affiliateSectionTitle")}
              </h4>
              <p className="text-muted-foreground text-[11px]">
                {t("affiliate.rules.affiliateSectionDescription")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {AFFILIATE_RULE_FIELDS.map((field) => (
              <div
                key={field.key}
                className="bg-muted/30 space-y-1.5 rounded-2xl border p-4 transition-colors"
              >
                <Label htmlFor={field.key} className="font-bold">
                  {t(field.labelKey)}
                </Label>
                <Input
                  id={field.key}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={
                    typeof formValues[field.key] === "number"
                      ? (formValues[field.key] as number)
                      : ""
                  }
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      [field.key]:
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                    }))
                  }
                  className={`h-11 rounded-xl font-mono font-bold ${field.toneClass}`}
                />
                <span className="text-muted-foreground text-[10px]">
                  {t(field.hintKey)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* Section 2: Dedicated Referral Program Settings              */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div className="space-y-4 rounded-2xl border border-amber-200/70 bg-amber-50/30 p-5 dark:border-amber-900/40 dark:bg-amber-950/15">
          <div className="flex flex-col gap-3 border-b border-amber-200/50 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/30">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <IconGift className="size-4" />
              </div>
              <div>
                <h4 className="text-foreground text-xs font-bold">
                  {t("affiliate.rules.referralSectionTitle")}
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  {t("affiliate.rules.referralSectionDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label
                htmlFor="isReferralEnabled"
                className="text-foreground cursor-pointer text-xs font-bold"
              >
                {t("affiliate.rules.isReferralEnabled")}
              </Label>
              <Switch
                dir="ltr"
                id="isReferralEnabled"
                checked={isReferralActive}
                onCheckedChange={(checked) =>
                  setFormValues((current) => ({
                    ...current,
                    isReferralEnabled: checked,
                  }))
                }
              />
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-1 ${
              isReferralActive
                ? "opacity-100"
                : "pointer-events-none opacity-50"
            }`}
          >
            {REFERRAL_RULE_FIELDS.map((field) => (
              <div
                key={field.key}
                className="bg-background/80 space-y-1.5 rounded-2xl border p-4 shadow-2xs"
              >
                <Label htmlFor={field.key} className="font-bold">
                  {t(field.labelKey)}
                </Label>
                <Input
                  id={field.key}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  disabled={!isReferralActive}
                  value={
                    typeof formValues[field.key] === "number"
                      ? (formValues[field.key] as number)
                      : ""
                  }
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      [field.key]:
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                    }))
                  }
                  className={`h-11 rounded-xl font-mono font-bold ${field.toneClass}`}
                />
                <span className="text-muted-foreground text-[10px]">
                  {t(field.hintKey)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-auto rounded-xl px-6 py-3.5 text-xs font-bold shadow-sm"
          >
            <IconDeviceFloppy className="size-4" />
            {t("affiliate.rules.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
