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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SettingsPageHeader } from "./components/settings-page-header";
import {
  useSubscriptionFreezeConfig,
  useUpdateSubscriptionFreezeConfig,
} from "./hooks/use-user-settings";
import type { SubscriptionFreezeConfig } from "./types";

const defaultFreezeConfig: SubscriptionFreezeConfig = {
  isFrozen: false,
  title: "",
  message: "",
};

export default function UserFreezeSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useSubscriptionFreezeConfig();
  const updateFreezeConfig = useUpdateSubscriptionFreezeConfig();
  const [freezeConfig, setFreezeConfig] =
    useState<SubscriptionFreezeConfig>(defaultFreezeConfig);

  useEffect(() => {
    if (!data) {
      return;
    }
    setFreezeConfig({
      isFrozen: Boolean(data.isFrozen),
      title: data.title ?? "",
      message: data.message ?? "",
    });
  }, [data]);

  const handleSaveFreezeConfig = async () => {
    const title = freezeConfig.title.trim();
    const message = freezeConfig.message.trim();

    if (freezeConfig.isFrozen && (!title || !message)) {
      toast.error("برای حالت فعال، عنوان و متن پیام را کامل کنید.");
      return;
    }

    await updateFreezeConfig.mutateAsync({
      ...freezeConfig,
      title,
      message,
    });
  };

  const handleDisableFreeze = async () => {
    await updateFreezeConfig.mutateAsync({
      ...freezeConfig,
      isFrozen: false,
      title: freezeConfig.title.trim(),
      message: freezeConfig.message.trim(),
    });
  };

  const isSavingConfig = updateFreezeConfig.isPending;

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("userSettings.freezePage.header.title")}
          description={t("userSettings.freezePage.header.description")}
        />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("userSettings.freezePage.header.title")}
        description={t("userSettings.freezePage.header.description")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("userSettings.freezePage.card.title")}</CardTitle>
          <CardDescription>
            {t("userSettings.freezePage.card.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="freeze-on" className="w-full gap-4">
            {/* <TabsList className="grid w-full grid-cols-2 gap-2">
              <TabsTrigger
                value="freeze-on"
                className="cursor-pointer hover:opacity-50"
              >
                {t("userSettings.freezePage.tabs.freezeOn")}
              </TabsTrigger>
              <TabsTrigger
                value="freeze-off"
                className="cursor-pointer hover:opacity-50"
              >
                {t("userSettings.freezePage.tabs.freezeOff")}
              </TabsTrigger>
            </TabsList> */}

            <TabsContent value="freeze-on">
              <div className="space-y-5 rounded-lg border p-4">
                <div className="bg-muted/40 flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {freezeConfig.isFrozen
                        ? t("userSettings.freezePage.freezeOn.statusActive")
                        : t("userSettings.freezePage.freezeOn.statusInactive")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("userSettings.freezePage.freezeOn.toggleDescription")}
                    </p>
                  </div>
                  <Switch
                    dir="ltr"
                    checked={freezeConfig.isFrozen}
                    onCheckedChange={(value) =>
                      setFreezeConfig((prev) => ({
                        ...prev,
                        isFrozen: value,
                      }))
                    }
                    aria-label={t("userSettings.aria.toggleFreezeStatus")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeze-outage-title">
                    {t("userSettings.freezePage.freezeOn.outageTitleLabel")}
                  </Label>
                  <Input
                    id="freeze-outage-title"
                    value={freezeConfig.title}
                    onChange={(event) =>
                      setFreezeConfig((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder={t(
                      "userSettings.freezePage.freezeOn.outageTitlePlaceholder"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeze-outage-description">
                    {t(
                      "userSettings.freezePage.freezeOn.outageDescriptionLabel"
                    )}
                  </Label>
                  <Textarea
                    id="freeze-outage-description"
                    value={freezeConfig.message}
                    onChange={(event) =>
                      setFreezeConfig((prev) => ({
                        ...prev,
                        message: event.target.value,
                      }))
                    }
                    className="min-h-28"
                    placeholder={t(
                      "userSettings.freezePage.freezeOn.outageDescriptionPlaceholder"
                    )}
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    onClick={handleSaveFreezeConfig}
                    disabled={isSavingConfig}
                  >
                    {isSavingConfig && (
                      <IconLoader2 className="size-4 animate-spin" />
                    )}
                    {t("userSettings.actions.saveFreeze")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="freeze-off">
              <div className="space-y-5 rounded-lg border p-4">
                <div className="bg-muted/40 space-y-2 rounded-md border p-4">
                  <p className="text-sm font-semibold">
                    {freezeConfig.isFrozen
                      ? t("userSettings.freezePage.freezeOff.statusFrozen")
                      : t("userSettings.freezePage.freezeOff.statusUnfrozen")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("userSettings.freezePage.freezeOff.statusHint")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeze-off-title">
                      {t("userSettings.freezePage.freezeOn.outageTitleLabel")}
                    </Label>
                    <Input
                      id="freeze-off-title"
                      value={freezeConfig.title}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freeze-off-message">
                      {t(
                        "userSettings.freezePage.freezeOn.outageDescriptionLabel"
                      )}
                    </Label>
                    <Textarea
                      id="freeze-off-message"
                      value={freezeConfig.message}
                      className="min-h-28"
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleDisableFreeze}
                    disabled={!freezeConfig.isFrozen || isSavingConfig}
                  >
                    {isSavingConfig && (
                      <IconLoader2 className="size-4 animate-spin" />
                    )}
                    {t("userSettings.actions.disableFreeze")}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
