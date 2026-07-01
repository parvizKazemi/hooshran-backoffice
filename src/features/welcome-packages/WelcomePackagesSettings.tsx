import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import {
  IconGift,
  IconLink,
  IconLoader2,
  IconPlus,
  IconShoppingBag,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NewUserGiftSection } from "./components/new-user-gift-section";
import { SettingsToggleSection } from "./components/settings-toggle-section";
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
  buildRulesPayloadForNewUserSave,
  buildRulesPayloadForUtmSave,
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

  const validateNewUserGiftForm = (): boolean => {
    if (!formState.registrationGiftEnabled) {
      return true;
    }

    if (formState.registrationCredits < 0) {
      toast.error(t("welcomePackages.errors.invalidCredits"));
      return false;
    }

    if (formState.registrationExpiryDays < 1) {
      toast.error(t("welcomePackages.errors.invalidExpiryDays"));
      return false;
    }

    if (
      formState.vipRestrictionEnabled &&
      formState.allowedServiceUuids.length === 0
    ) {
      toast.error(t("welcomePackages.errors.vipServicesRequired"));
      return false;
    }

    return true;
  };

  const handleSaveNewUserGift = async () => {
    if (!validateNewUserGiftForm() || !rules) {
      return;
    }

    const payloadRules = buildRulesPayloadForNewUserSave(formState, rules);
    await saveSettings.mutateAsync({ rules: payloadRules });
  };

  const handleSaveUtmCampaigns = async () => {
    if (!rules) {
      return;
    }

    const payloadRules = buildRulesPayloadForUtmSave(formState, rules);
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

          <NewUserGiftSection
            registrationGiftEnabled={formState.registrationGiftEnabled}
            registrationCredits={formState.registrationCredits}
            registrationExpiryDays={formState.registrationExpiryDays}
            vipRestrictionEnabled={formState.vipRestrictionEnabled}
            allowedServiceUuids={formState.allowedServiceUuids}
            services={services}
            disabled={isSaving}
            isSaving={isSaving}
            onRegistrationGiftEnabledChange={(enabled) =>
              updateForm("registrationGiftEnabled", enabled)
            }
            onRegistrationCreditsChange={(credits) =>
              updateForm("registrationCredits", credits)
            }
            onRegistrationExpiryDaysChange={(days) =>
              updateForm("registrationExpiryDays", days)
            }
            onVipRestrictionEnabledChange={(enabled) =>
              updateForm("vipRestrictionEnabled", enabled)
            }
            onAllowedServiceUuidsChange={(uuids) =>
              updateForm("allowedServiceUuids", uuids)
            }
            onSave={handleSaveNewUserGift}
          />

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
            <Button onClick={handleSaveUtmCampaigns} disabled={isSaving}>
              {isSaving && <IconLoader2 className="size-4 animate-spin" />}
              {t("welcomePackages.actions.saveUtmCampaigns")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
