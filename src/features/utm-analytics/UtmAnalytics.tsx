import { useTranslation } from "react-i18next";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { UtmContentRewardRulesCard } from "./components/utm-content-reward-rules-card";
import {
  usePresentTokenConfig,
  useUpdatePresentTokenConfig,
} from "./hooks/use-utm-analytics";

export default function UtmAnalytics() {
  const { t } = useTranslation("common");

  const { data: presentTokenConfig, isLoading: isConfigLoading } =
    usePresentTokenConfig();
  const updatePresentTokenConfig = useUpdatePresentTokenConfig();

  const isEnabled = presentTokenConfig?.isEnabled ?? false;
  const isUpdatingConfig = updatePresentTokenConfig.isPending;

  const handleTogglePresentToken = async () => {
    await updatePresentTokenConfig.mutateAsync({
      isEnabled: !isEnabled,
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("utmAnalytics.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("utmAnalytics.description")}
        </p>
      </div>

      <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            {t("utmAnalytics.presentToken.title")}
          </span>
          <span className="text-muted-foreground text-sm">
            {isConfigLoading
              ? t("utmAnalytics.presentToken.loading")
              : isEnabled
                ? t("utmAnalytics.presentToken.enabled")
                : t("utmAnalytics.presentToken.disabled")}
          </span>
        </div>
        <Button
          onClick={handleTogglePresentToken}
          disabled={isConfigLoading || isUpdatingConfig}
          variant={isEnabled ? "destructive" : "default"}
        >
          {isUpdatingConfig && (
            <IconLoader2 className="mr-2 size-4 animate-spin" />
          )}
          {isEnabled
            ? t("utmAnalytics.presentToken.deactivate")
            : t("utmAnalytics.presentToken.activate")}
        </Button>
      </div>

      <UtmContentRewardRulesCard />
    </div>
  );
}
