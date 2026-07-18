import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconPhone, IconTrash, IconUserMinus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { DEFAULT_PURGE_OPTIONS, SELECTABLE_PURGE_OPTIONS } from "../constants";
import type { PurgeOptionId, PurgeOptionsState } from "../types";

type ClearUserDataFormProps = {
  phoneNumber: string;
  options: PurgeOptionsState;
  isPending: boolean;
  onPhoneChange: (value: string) => void;
  onOptionsChange: (next: PurgeOptionsState) => void;
  onSubmit: () => void;
};

export function ClearUserDataForm({
  phoneNumber,
  options,
  isPending,
  onPhoneChange,
  onOptionsChange,
  onSubmit,
}: ClearUserDataFormProps) {
  const { t } = useTranslation("common");

  const handleHardPurgeChange = (checked: boolean) => {
    if (checked) {
      onOptionsChange({
        subscriptions: true,
        prompts: true,
        coupons: true,
        notifications: true,
        hardPurge: true,
      });
      return;
    }

    onOptionsChange({ ...DEFAULT_PURGE_OPTIONS });
  };

  const handleOptionChange = (
    optionId: Exclude<PurgeOptionId, "hardPurge">,
    checked: boolean
  ) => {
    if (options.hardPurge) return;

    onOptionsChange({
      ...options,
      [optionId]: checked,
    });
  };

  return (
    <Card className="mx-auto w-full max-w-xl overflow-hidden shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex size-10 items-center justify-center rounded-xl border">
            <IconTrash className="size-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-black">
              {t("clearUserData.card.title")}
            </CardTitle>
            <CardDescription className="mt-0.5 text-[10px]">
              {t("clearUserData.card.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-1.5">
          <Label htmlFor="clear-user-phone" className="text-xs font-bold">
            {t("clearUserData.form.phoneLabel")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <IconPhone className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              id="clear-user-phone"
              value={phoneNumber}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder={t("clearUserData.form.phonePlaceholder")}
              className="h-11 pr-10 font-mono text-xs"
              inputMode="numeric"
              autoComplete="tel"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <span className="text-muted-foreground block text-[10px] font-black tracking-wider uppercase">
            {t("clearUserData.form.optionsTitle")}
          </span>

          {SELECTABLE_PURGE_OPTIONS.map((optionId, index) => (
            <label
              key={optionId}
              className={cn(
                "bg-muted/30 hover:border-border flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-colors",
                options.hardPurge && "cursor-not-allowed opacity-70"
              )}
            >
              <span className="text-xs font-bold">
                {index + 1}. {t(`clearUserData.options.${optionId}`)}
              </span>
              <Checkbox
                checked={options[optionId]}
                disabled={options.hardPurge || isPending}
                onCheckedChange={(checked) =>
                  handleOptionChange(optionId, checked === true)
                }
              />
            </label>
          ))}

          <div className="bg-border my-2 h-px w-full" />

          <label className="border-destructive/20 bg-destructive/5 hover:border-destructive/40 flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-colors">
            <div className="space-y-0.5 text-right">
              <span className="text-destructive block text-xs font-black">
                {t("clearUserData.options.hardPurge")}
              </span>
              <p className="text-muted-foreground text-[9px]">
                {t("clearUserData.options.hardPurgeHint")}
              </p>
            </div>
            <Checkbox
              checked={options.hardPurge}
              disabled={isPending}
              onCheckedChange={(checked) =>
                handleHardPurgeChange(checked === true)
              }
            />
          </label>
        </div>

        <Button
          type="button"
          disabled={isPending}
          onClick={onSubmit}
          className="from-destructive hover:from-destructive/90 h-12 w-full gap-2 rounded-2xl bg-gradient-to-r to-orange-600 text-xs font-black text-white shadow-lg hover:to-orange-500"
        >
          <IconUserMinus className="size-4" />
          {t("clearUserData.actions.submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
