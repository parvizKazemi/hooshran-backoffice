import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { CAMPAIGN_TIER_KEYS } from "../constants";
import type { CampaignTierKey, TierDiscountState } from "../types";

type CampaignTierDiscountGridProps = {
  tiers: TierDiscountState;
  onChange: (next: TierDiscountState) => void;
  compact?: boolean;
  disabled?: boolean;
};

export function CampaignTierDiscountGrid({
  tiers,
  onChange,
  compact = false,
  disabled = false,
}: CampaignTierDiscountGridProps) {
  const { t } = useTranslation("common");

  const updateTier = (
    tier: CampaignTierKey,
    patch: Partial<TierDiscountState[CampaignTierKey]>
  ) => {
    onChange({
      ...tiers,
      [tier]: {
        ...tiers[tier],
        ...patch,
      },
    });
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2",
        compact && "gap-2 sm:grid-cols-2"
      )}
    >
      {CAMPAIGN_TIER_KEYS.map((tier) => {
        const state = tiers[tier];
        const isHero = tier === "hero";

        return (
          <div
            key={tier}
            className={cn(
              "bg-card flex items-center justify-between rounded-xl border p-3 transition-all",
              compact && "rounded-lg p-2.5",
              state.enabled
                ? isHero
                  ? "border-amber-500 bg-amber-50/30 shadow-sm dark:border-amber-600 dark:bg-amber-950/30"
                  : "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                : "border-border hover:border-border/80"
            )}
          >
            <label className="flex cursor-pointer items-center gap-3 select-none">
              <Checkbox
                checked={state.enabled}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  updateTier(tier, { enabled: checked === true })
                }
                className={cn(
                  isHero && "border-amber-400 data-[state=checked]:bg-amber-500"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  isHero
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-foreground",
                  compact && "text-xs"
                )}
              >
                {t(`planCampaigns.tiers.${tier}`)}
              </span>
            </label>

            <div
              className={cn(
                "relative w-30 transition-opacity",
                compact && "w-26",
                !state.enabled && "pointer-events-none opacity-40"
              )}
            >
              <Input
                type="number"
                min={1}
                max={100}
                disabled={disabled || !state.enabled}
                value={state.percentage > 0 ? state.percentage : ""}
                placeholder={t("planCampaigns.form.percentPlaceholder")}
                onChange={(event) =>
                  updateTier(tier, {
                    percentage: Number(event.target.value) || 0,
                  })
                }
                className={cn(
                  "dir-ltr rounded-lg py-1.5 pr-3 pl-5 text-left text-sm font-bold text-emerald-700 dark:text-emerald-400",
                  "[appearance:textfield]",
                  compact && "rounded-md py-1.5 text-xs",
                  isHero &&
                    state.enabled &&
                    "bg-background border-amber-300 dark:border-amber-700"
                )}
              />
              <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold">
                %
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
