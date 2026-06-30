import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import {
  IconGift,
  IconLink,
  IconLoader2,
  IconPlus,
  IconShield,
  IconShoppingBag,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SettingsToggleSection } from "./components/settings-toggle-section";
import { ServiceAllowedSelector } from "./components/service-allowed-selector";
import { TrialPackagesSection } from "./components/trial-packages-section";
import { UtmCampaignRow } from "./components/utm-campaign-row";
import {
  usePlatformServices,
  usePresentTokenConfig,
  useSaveWelcomePackagesSettings,
  useUpdatePresentTokenConfig,
  useUtmContentRewardRules,
} from "./hooks/use-welcome-packages";
import type { WelcomePackagesFormState } from "./types";
import {
  buildRulesFromFormState,
  createEmptyUtmCampaignRow,
  mapRulesToFormState,
} from "./utils/rules";

const DEFAULT_FORM_STATE: WelcomePackagesFormState = {
  registrationGiftEnabled: true,
  registrationCredits: 15,
  registrationExpiryDays: 7,
  vipRestrictionEnabled: true,
  allowedServiceUuids: [],
  trialPackagesSectionEnabled: true,
  utmCampaignsSectionEnabled: true,
  utmCampaigns: [],
};

export default function WelcomePackagesSettings() {
  const { t } = useTranslation("common");
  const { data: rules, isLoading: isRulesLoading } = useUtmContentRewardRules();
  const { data: services = [], isLoading: isServicesLoading } =
    usePlatformServices();
  const { data: presentTokenConfig, isLoading: isPresentTokenLoading } =
    usePresentTokenConfig();
  const updatePresentTokenConfig = useUpdatePresentTokenConfig();
  const saveSettings = useSaveWelcomePackagesSettings();
  const [formState, setFormState] =
    useState<WelcomePackagesFormState>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (!rules) {
      return;
    }

    setFormState((prev) => ({
      ...prev,
      ...mapRulesToFormState(rules),
    }));
  }, [rules]);

  const isPresentTokenEnabled = presentTokenConfig?.isEnabled ?? false;
  const isLoading =
    isRulesLoading || isServicesLoading || isPresentTokenLoading;
  const isSaving = saveSettings.isPending;
  const isUpdatingPresentToken = updatePresentTokenConfig.isPending;

  const handleTogglePresentToken = async () => {
    await updatePresentTokenConfig.mutateAsync({
      isEnabled: !isPresentTokenEnabled,
    });
  };

  const updateForm = <K extends keyof WelcomePackagesFormState>(
    key: K,
    value: WelcomePackagesFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (formState.registrationGiftEnabled) {
      if (formState.registrationCredits < 0) {
        toast.error(t("welcomePackages.errors.invalidCredits"));
        return;
      }
      if (formState.registrationExpiryDays < 1) {
        toast.error(t("welcomePackages.errors.invalidExpiryDays"));
        return;
      }
      if (
        formState.vipRestrictionEnabled &&
        formState.allowedServiceUuids.length === 0
      ) {
        toast.error(t("welcomePackages.errors.vipServicesRequired"));
        return;
      }
    }

    const payloadRules = buildRulesFromFormState(formState);

    await saveSettings.mutateAsync({ rules: payloadRules });
  };

  if (isLoading && !rules) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("welcomePackages.header.title")}
          description={t("welcomePackages.header.description")}
        />
        <Skeleton className="h-128 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("welcomePackages.header.title")}
        description={t("welcomePackages.header.description")}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
              <IconGift className="size-5" />
            </div>
            <div>
              <CardTitle>{t("welcomePackages.card.title")}</CardTitle>
              <CardDescription>
                {t("welcomePackages.card.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/40 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold">
                {t("welcomePackages.presentToken.title")}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {isPresentTokenLoading
                  ? t("welcomePackages.presentToken.loading")
                  : isPresentTokenEnabled
                    ? t("welcomePackages.presentToken.enabled")
                    : t("welcomePackages.presentToken.disabled")}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleTogglePresentToken}
              disabled={isPresentTokenLoading || isUpdatingPresentToken}
              variant={isPresentTokenEnabled ? "destructive" : "default"}
            >
              {isUpdatingPresentToken && (
                <IconLoader2 className="size-4 animate-spin" />
              )}
              {isPresentTokenEnabled
                ? t("welcomePackages.presentToken.deactivate")
                : t("welcomePackages.presentToken.activate")}
            </Button>
          </div>

          <SettingsToggleSection
            icon={IconSparkles}
            title={t("welcomePackages.registrationGift.title")}
            description={t("welcomePackages.registrationGift.description")}
            enabled={formState.registrationGiftEnabled}
            onEnabledChange={(enabled) =>
              updateForm("registrationGiftEnabled", enabled)
            }
            ariaLabel={t("welcomePackages.aria.toggleRegistrationGift")}
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
                  value={formState.registrationCredits}
                  onChange={(event) =>
                    updateForm(
                      "registrationCredits",
                      Number(event.target.value) || 0
                    )
                  }
                  className="font-mono"
                  disabled={isSaving}
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
                    value={formState.registrationExpiryDays}
                    onChange={(event) =>
                      updateForm(
                        "registrationExpiryDays",
                        Number(event.target.value) || 1
                      )
                    }
                    className="font-mono"
                    disabled={isSaving}
                  />
                  <span className="bg-muted text-muted-foreground flex items-center rounded-xl px-3 text-xs font-bold">
                    {t("welcomePackages.registrationGift.dayUnit")}
                  </span>
                </div>
              </div>
            </div>
          </SettingsToggleSection>

          <SettingsToggleSection
            icon={IconShield}
            title={t("welcomePackages.vipRestriction.title")}
            description={t("welcomePackages.vipRestriction.description")}
            enabled={formState.vipRestrictionEnabled}
            onEnabledChange={(enabled) =>
              updateForm("vipRestrictionEnabled", enabled)
            }
            ariaLabel={t("welcomePackages.aria.toggleVipRestriction")}
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
                selectedUuids={formState.allowedServiceUuids}
                onChange={(uuids) => updateForm("allowedServiceUuids", uuids)}
                disabled={isSaving}
              />
            </div>
          </SettingsToggleSection>

          <SettingsToggleSection
            icon={IconShoppingBag}
            title={t("welcomePackages.trialPackages.title")}
            description={t("welcomePackages.trialPackages.description")}
            enabled={formState.trialPackagesSectionEnabled}
            onEnabledChange={(enabled) =>
              updateForm("trialPackagesSectionEnabled", enabled)
            }
            ariaLabel={t("welcomePackages.aria.toggleTrialPackages")}
          >
            <TrialPackagesSection
              enabled={formState.trialPackagesSectionEnabled}
            />
          </SettingsToggleSection>

          <SettingsToggleSection
            icon={IconLink}
            title={t("welcomePackages.utmCampaigns.title")}
            description={t("welcomePackages.utmCampaigns.description")}
            enabled={formState.utmCampaignsSectionEnabled}
            onEnabledChange={(enabled) =>
              updateForm("utmCampaignsSectionEnabled", enabled)
            }
            ariaLabel={t("welcomePackages.aria.toggleUtmCampaigns")}
          >
            <div className="bg-muted/40 space-y-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold">
                  {t("welcomePackages.utmCampaigns.listTitle")}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
                  onClick={() =>
                    updateForm("utmCampaigns", [
                      ...formState.utmCampaigns,
                      createEmptyUtmCampaignRow(),
                    ])
                  }
                  disabled={isSaving}
                >
                  <IconPlus className="size-3.5" />
                  {t("welcomePackages.utmCampaigns.addCampaign")}
                </Button>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {formState.utmCampaigns.length === 0 ? (
                  <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-center text-sm">
                    {t("welcomePackages.utmCampaigns.empty")}
                  </p>
                ) : (
                  formState.utmCampaigns.map((row) => (
                    <UtmCampaignRow
                      key={row.id}
                      row={row}
                      services={services}
                      disabled={isSaving}
                      onChange={(nextRow) =>
                        updateForm(
                          "utmCampaigns",
                          formState.utmCampaigns.map((item) =>
                            item.id === row.id ? nextRow : item
                          )
                        )
                      }
                      onRemove={() =>
                        updateForm(
                          "utmCampaigns",
                          formState.utmCampaigns.filter(
                            (item) => item.id !== row.id
                          )
                        )
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </SettingsToggleSection>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <IconLoader2 className="size-4 animate-spin" />}
              {t("welcomePackages.actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
