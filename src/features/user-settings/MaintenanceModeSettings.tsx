import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconActivity,
  IconAlertTriangle,
  IconLoader2,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SettingsPageHeader } from "./components/settings-page-header";
import {
  useApplyMaintenanceMode,
  useMaintenanceModeState,
} from "./hooks/use-maintenance-mode";
import type { MaintenanceModeFormState } from "./maintenance-mode/types";

const DEFAULT_FORM_STATE: MaintenanceModeFormState = {
  isEnabled: false,
  description: "",
  estimatedTime: "",
};

export default function MaintenanceModeSettings() {
  const { t } = useTranslation("common");
  const { data: persistedState, isLoading } = useMaintenanceModeState();
  const applyMaintenanceMode = useApplyMaintenanceMode();
  const [form, setForm] =
    useState<MaintenanceModeFormState>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (!persistedState) {
      setForm({
        isEnabled: false,
        description: t("userSettings.maintenancePage.defaults.description"),
        estimatedTime: t("userSettings.maintenancePage.defaults.estimatedTime"),
      });
      return;
    }

    setForm({
      isEnabled: persistedState.isActive,
      description: persistedState.description,
      estimatedTime: persistedState.estimatedTime,
    });
  }, [persistedState, t]);

  const handleSave = async () => {
    const normalizedDescription = form.description.trim();
    const normalizedEstimatedTime = form.estimatedTime.trim();

    if (form.isEnabled && !normalizedDescription) {
      toast.error(t("userSettings.maintenancePage.errors.descriptionRequired"));
      return;
    }

    await applyMaintenanceMode.mutateAsync({
      isEnabled: form.isEnabled,
      description: normalizedDescription,
      estimatedTime: normalizedEstimatedTime,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("userSettings.maintenancePage.header.title")}
          description={t("userSettings.maintenancePage.header.description")}
        />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  const isSaving = applyMaintenanceMode.isPending;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("userSettings.maintenancePage.header.title")}
        description={t("userSettings.maintenancePage.header.description")}
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <IconActivity className="size-5" />
            </div>
            <div>
              <CardTitle>
                {t("userSettings.maintenancePage.card.title")}
              </CardTitle>
              <CardDescription>
                {t("userSettings.maintenancePage.card.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border p-4 transition-colors hover:border-slate-300 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <IconAlertTriangle className="text-muted-foreground mt-1 size-5" />
              <div>
                <p className="text-base font-bold">
                  {t("userSettings.maintenancePage.toggle.title")}
                </p>
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                  {t("userSettings.maintenancePage.toggle.description")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Badge
                className={cn(
                  form.isEnabled
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}
              >
                {form.isEnabled
                  ? t("userSettings.maintenancePage.status.active")
                  : t("userSettings.maintenancePage.status.inactive")}
              </Badge>
              <Switch
                dir="ltr"
                checked={form.isEnabled}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isEnabled: checked }))
                }
                aria-label={t("userSettings.aria.toggleMaintenanceMode")}
              />
            </div>
          </div>

          <div
            className={cn(
              "grid transition-all duration-300 ease-out",
              form.isEnabled
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="mt-2 space-y-4 rounded-xl border border-amber-100 bg-gray-100 p-5 dark:bg-gray-800">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-description">
                    {t("userSettings.maintenancePage.form.descriptionLabel")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-muted-foreground text-[11px]">
                    {t("userSettings.maintenancePage.form.descriptionHint")}
                  </p>
                  <Textarea
                    id="maintenance-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-estimated-time">
                    {t("userSettings.maintenancePage.form.estimatedTimeLabel")}
                  </Label>
                  <Input
                    id="maintenance-estimated-time"
                    value={form.estimatedTime}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        estimatedTime: event.target.value,
                      }))
                    }
                    placeholder={t(
                      "userSettings.maintenancePage.form.estimatedTimePlaceholder"
                    )}
                    className="bg-white text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <IconLoader2 className="size-4 animate-spin" />}
              {t("userSettings.maintenancePage.actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
