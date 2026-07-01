import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLoader2, IconShield, IconSparkles } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { PlatformService } from "../types";
import { ServiceAllowedSelector } from "./service-allowed-selector";
import { SettingsToggleSection } from "./settings-toggle-section";

type NewUserGiftSectionProps = {
  registrationGiftEnabled: boolean;
  registrationCredits: number;
  registrationExpiryDays: number;
  vipRestrictionEnabled: boolean;
  allowedServiceUuids: string[];
  services: PlatformService[];
  disabled?: boolean;
  isSaving?: boolean;
  onRegistrationGiftEnabledChange: (enabled: boolean) => void;
  onRegistrationCreditsChange: (credits: number) => void;
  onRegistrationExpiryDaysChange: (days: number) => void;
  onVipRestrictionEnabledChange: (enabled: boolean) => void;
  onAllowedServiceUuidsChange: (uuids: string[]) => void;
  onSave: () => void;
};

export function NewUserGiftSection({
  registrationGiftEnabled,
  registrationCredits,
  registrationExpiryDays,
  vipRestrictionEnabled,
  allowedServiceUuids,
  services,
  disabled = false,
  isSaving = false,
  onRegistrationGiftEnabledChange,
  onRegistrationCreditsChange,
  onRegistrationExpiryDaysChange,
  onVipRestrictionEnabledChange,
  onAllowedServiceUuidsChange,
  onSave,
}: NewUserGiftSectionProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-muted/20 space-y-4 rounded-xl border p-4">
      <SettingsToggleSection
        icon={IconSparkles}
        title={t("welcomePackages.registrationGift.title")}
        description={t("welcomePackages.registrationGift.description")}
        enabled={registrationGiftEnabled}
        onEnabledChange={onRegistrationGiftEnabledChange}
        ariaLabel={t("welcomePackages.aria.toggleRegistrationGift")}
        className="border-0 bg-transparent p-0"
      >
        <div className="bg-muted/40 grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="registration-credits">
              {t("welcomePackages.registrationGift.creditsLabel")}
            </Label>
            <Input
              id="registration-credits"
              type="number"
              min={0}
              value={registrationCredits}
              onChange={(event) =>
                onRegistrationCreditsChange(Number(event.target.value) || 0)
              }
              className="font-mono"
              disabled={disabled || isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration-expiry">
              {t("welcomePackages.registrationGift.expiryLabel")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="registration-expiry"
                type="number"
                min={1}
                value={registrationExpiryDays}
                onChange={(event) =>
                  onRegistrationExpiryDaysChange(
                    Number(event.target.value) || 1
                  )
                }
                className="font-mono"
                disabled={disabled || isSaving}
              />
              <span className="bg-muted text-muted-foreground flex items-center rounded-xl px-3 text-xs font-bold">
                {t("welcomePackages.registrationGift.dayUnit")}
              </span>
            </div>
          </div>
        </div>
      </SettingsToggleSection>

      <div className="border-t border-dashed" />

      <SettingsToggleSection
        icon={IconShield}
        title={t("welcomePackages.vipRestriction.title")}
        description={t("welcomePackages.vipRestriction.description")}
        enabled={vipRestrictionEnabled}
        onEnabledChange={onVipRestrictionEnabledChange}
        ariaLabel={t("welcomePackages.aria.toggleVipRestriction")}
        className="border-0 bg-transparent p-0"
      >
        <div className="bg-muted/40 space-y-3 rounded-xl border p-4">
          <div>
            <p className="text-xs font-bold">
              {t("welcomePackages.vipRestriction.selectorLabel")}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
              {t("welcomePackages.vipRestriction.selectorHint")}
            </p>
          </div>
          <ServiceAllowedSelector
            variant="chips"
            services={services}
            selectedUuids={allowedServiceUuids}
            onChange={onAllowedServiceUuidsChange}
            disabled={disabled || isSaving}
          />
        </div>
      </SettingsToggleSection>

      <div className="flex justify-end border-t pt-4">
        <Button type="button" onClick={onSave} disabled={disabled || isSaving}>
          {isSaving && <IconLoader2 className="size-4 animate-spin" />}
          {t("welcomePackages.actions.saveNewUserGift")}
        </Button>
      </div>
    </div>
  );
}
