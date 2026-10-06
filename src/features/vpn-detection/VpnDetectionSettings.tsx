import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { IconShield } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {
  useUpdateVpnDetectionConfig,
  useVpnDetectionConfig,
} from "./hooks/use-vpn-detection-config";

export default function VpnDetectionSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useVpnDetectionConfig();
  const updateConfig = useUpdateVpnDetectionConfig();

  const isEnabled = data?.isEnabled ?? false;
  const isUpdating = updateConfig.isPending;

  const handleToggle = (checked: boolean) => {
    void updateConfig.mutateAsync({ isEnabled: checked });
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">{t("vpnDetection.header.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("vpnDetection.header.description")}
        </p>
      </div>

      <Card className="mx-auto w-full max-w-2xl overflow-hidden">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400">
              <IconShield className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("vpnDetection.card.title")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t("vpnDetection.card.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-48" />
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">
                  {isEnabled
                    ? t("vpnDetection.statusEnabled")
                    : t("vpnDetection.statusDisabled")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("vpnDetection.hint")}
                </p>
              </>
            )}
          </div>

          <Switch
            dir="ltr"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || isUpdating}
            aria-label={t("vpnDetection.ariaLabel")}
            className="shrink-0"
          />
        </CardContent>
      </Card>
    </div>
  );
}
