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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsPageHeader } from "./components/settings-page-header";
import {
  useUpdateFreezeEndSettings,
  useUpdateFreezeStartSettings,
  useUserSettings,
} from "./hooks/use-user-settings";
import type { FreezeEndSettings, FreezeStartSettings } from "./types";

const defaultFreezeStart: FreezeStartSettings = {
  isFreezeEnabled: false,
  outageTitle: "",
  outageDescription: "",
};

const defaultFreezeEnd: FreezeEndSettings = {
  manualUnfreezeGraceDays: 0,
  compensationGiftDays: 0,
  sendRecoverySms: false,
};

const clampToNonNegativeInteger = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
};

export default function UserFreezeSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useUserSettings();
  const updateFreezeStart = useUpdateFreezeStartSettings();
  const updateFreezeEnd = useUpdateFreezeEndSettings();

  const [freezeStart, setFreezeStart] =
    useState<FreezeStartSettings>(defaultFreezeStart);
  const [freezeEnd, setFreezeEnd] =
    useState<FreezeEndSettings>(defaultFreezeEnd);

  useEffect(() => {
    if (!data) {
      return;
    }
    setFreezeStart(data.freezeStart);
    setFreezeEnd(data.freezeEnd);
  }, [data]);

  const handleSaveFreezeStart = async () => {
    await updateFreezeStart.mutateAsync(freezeStart);
  };

  const handleSaveFreezeEnd = async () => {
    await updateFreezeEnd.mutateAsync({
      ...freezeEnd,
      manualUnfreezeGraceDays: clampToNonNegativeInteger(
        freezeEnd.manualUnfreezeGraceDays
      ),
      compensationGiftDays: clampToNonNegativeInteger(
        freezeEnd.compensationGiftDays
      ),
    });
  };

  const isSavingStart = updateFreezeStart.isPending;
  const isSavingEnd = updateFreezeEnd.isPending;

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
            <TabsList className="grid w-full grid-cols-2 gap-2">
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
            </TabsList>

            <TabsContent value="freeze-on">
              <div className="space-y-5 rounded-lg border p-4">
                <div className="bg-muted/40 flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {t("userSettings.freezePage.freezeOn.toggleTitle")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("userSettings.freezePage.freezeOn.toggleDescription")}
                    </p>
                  </div>
                  <Switch
                    dir="ltr"
                    checked={freezeStart.isFreezeEnabled}
                    onCheckedChange={(value) =>
                      setFreezeStart((prev) => ({
                        ...prev,
                        isFreezeEnabled: value,
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
                    value={freezeStart.outageTitle}
                    onChange={(event) =>
                      setFreezeStart((prev) => ({
                        ...prev,
                        outageTitle: event.target.value,
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
                    value={freezeStart.outageDescription}
                    onChange={(event) =>
                      setFreezeStart((prev) => ({
                        ...prev,
                        outageDescription: event.target.value,
                      }))
                    }
                    className="min-h-28"
                    placeholder={t(
                      "userSettings.freezePage.freezeOn.outageDescriptionPlaceholder"
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveFreezeStart}
                    disabled={isSavingStart}
                  >
                    {isSavingStart && (
                      <IconLoader2 className="size-4 animate-spin" />
                    )}
                    {t("userSettings.actions.saveFreeze")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="freeze-off">
              <div className="space-y-5 rounded-lg border p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manual-unfreeze-grace-period">
                      {t("userSettings.freezePage.freezeOff.gracePeriodLabel")}
                    </Label>
                    <Input
                      id="manual-unfreeze-grace-period"
                      type="number"
                      min={0}
                      value={freezeEnd.manualUnfreezeGraceDays}
                      onChange={(event) =>
                        setFreezeEnd((prev) => ({
                          ...prev,
                          manualUnfreezeGraceDays:
                            Number.parseInt(event.target.value, 10) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation-gift-days">
                      {t(
                        "userSettings.freezePage.freezeOff.compensationDaysLabel"
                      )}
                    </Label>
                    <Input
                      id="compensation-gift-days"
                      type="number"
                      min={0}
                      value={freezeEnd.compensationGiftDays}
                      onChange={(event) =>
                        setFreezeEnd((prev) => ({
                          ...prev,
                          compensationGiftDays:
                            Number.parseInt(event.target.value, 10) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-md border p-4">
                  <Checkbox
                    id="send-recovery-sms"
                    checked={freezeEnd.sendRecoverySms}
                    onCheckedChange={(checked) =>
                      setFreezeEnd((prev) => ({
                        ...prev,
                        sendRecoverySms: checked === true,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="send-recovery-sms">
                      {t("userSettings.freezePage.freezeOff.recoverySmsLabel")}
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      {t("userSettings.freezePage.freezeOff.recoverySmsHint")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveFreezeEnd} disabled={isSavingEnd}>
                    {isSavingEnd && (
                      <IconLoader2 className="size-4 animate-spin" />
                    )}
                    {t("userSettings.actions.saveUnfreeze")}
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
