import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconDeviceFloppy, IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AffiliateProgramRules } from "../types";

type AffiliateRulesFormProps = {
  rules: AffiliateProgramRules;
  isSaving?: boolean;
  onSave: (rules: AffiliateProgramRules) => void;
};

type RuleField = {
  key: keyof AffiliateProgramRules;
  labelKey: string;
  hintKey: string;
  toneClass: string;
  min?: number;
  max?: number;
  step?: number;
};

const RULE_FIELDS: RuleField[] = [
  {
    key: "firstCommissionRate",
    labelKey: "affiliate.rules.firstCommissionRate",
    hintKey: "affiliate.rules.firstCommissionRateHint",
    toneClass: "text-emerald-600 dark:text-emerald-400",
    min: 1,
    max: 50,
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
    max: 30,
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
    max: 30,
  },
  {
    key: "minPayoutAmount",
    labelKey: "affiliate.rules.minPayoutAmount",
    hintKey: "affiliate.rules.minPayoutAmountHint",
    toneClass: "text-amber-600 dark:text-amber-400",
    step: 50_000,
  },
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

  return (
    <div className="bg-card space-y-6 rounded-3xl border p-6 shadow-sm">
      <div className="border-b pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <IconSettings className="size-4 text-amber-500" />
          {t("affiliate.rules.title")}
        </h3>
        <p className="text-muted-foreground mt-0.5 text-[11px]">
          {t("affiliate.rules.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {RULE_FIELDS.map((field) => (
            <div
              key={field.key}
              className="bg-muted/30 space-y-1.5 rounded-2xl border p-4"
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
                value={formValues[field.key]}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    [field.key]: Number(event.target.value),
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

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-auto rounded-xl px-6 py-3.5 text-xs font-bold"
          >
            <IconDeviceFloppy className="size-4" />
            {t("affiliate.rules.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
