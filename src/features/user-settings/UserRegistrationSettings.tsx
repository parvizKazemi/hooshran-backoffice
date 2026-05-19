import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsPageHeader } from "./components/settings-page-header";
import {
  useUpdateRegistrationSettings,
  useUserSettings,
} from "./hooks/use-user-settings";

export default function UserRegistrationSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useUserSettings();
  const updateRegistration = useUpdateRegistrationSettings();
  const [isNewRegistrationBlocked, setIsNewRegistrationBlocked] =
    useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }
    setIsNewRegistrationBlocked(data.registration.isNewRegistrationBlocked);
  }, [data]);

  const handleSave = async () => {
    await updateRegistration.mutateAsync({
      isNewRegistrationBlocked,
    });
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("userSettings.registrationPage.header.title")}
          description={t("userSettings.registrationPage.header.description")}
        />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("userSettings.registrationPage.header.title")}
        description={t("userSettings.registrationPage.header.description")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("userSettings.registrationPage.card.title")}</CardTitle>
          <CardDescription>
            {t("userSettings.registrationPage.card.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm font-semibold">
                {isNewRegistrationBlocked
                  ? t("userSettings.registrationPage.status.blocked")
                  : t("userSettings.registrationPage.status.open")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("userSettings.registrationPage.status.hint")}
              </p>
            </div>
            <Switch
              dir="ltr"
              checked={isNewRegistrationBlocked}
              onCheckedChange={setIsNewRegistrationBlocked}
              aria-label={t("userSettings.aria.toggleRegistrationStatus")}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateRegistration.isPending}
            >
              {updateRegistration.isPending && (
                <IconLoader2 className="size-4 animate-spin" />
              )}
              {t("userSettings.actions.saveRegistration")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
