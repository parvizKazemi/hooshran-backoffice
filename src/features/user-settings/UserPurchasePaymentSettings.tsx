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
import { toast } from "sonner";
import { SettingsPageHeader } from "./components/settings-page-header";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  usePaymentGateConfig,
  useUpdatePaymentGateConfig,
} from "./hooks/use-user-settings";

export default function UserRegistrationSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = usePaymentGateConfig();
  const updatePaymentGateConfig = useUpdatePaymentGateConfig();
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);
  const [paymentDisabledMessage, setPaymentDisabledMessage] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }
    setIsPaymentEnabled(!data.isPurchaseDisabled);
    setPaymentDisabledMessage(data.purchaseDisabledMessage ?? "");
  }, [data]);

  const handleSave = async () => {
    const normalizedMessage = paymentDisabledMessage.trim();
    const isPurchaseDisabled = !isPaymentEnabled;

    if (isPurchaseDisabled && normalizedMessage.length === 0) {
      toast.error(t("userSettings.errors.purchaseMessageRequiredWhenDisabled"));
      return;
    }

    await updatePaymentGateConfig.mutateAsync({
      isPurchaseDisabled,
      purchaseDisabledMessage: normalizedMessage,
    });
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("userSettings.purchasePage.header.title")}
          description={t("userSettings.purchasePage.header.description")}
        />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("userSettings.purchasePage.header.title")}
        description={t("userSettings.purchasePage.header.description")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("userSettings.purchasePage.card.title")}</CardTitle>
          <CardDescription>
            {t("userSettings.purchasePage.card.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm font-semibold">
                {isPaymentEnabled
                  ? t("userSettings.purchasePage.status.enabled")
                  : t("userSettings.purchasePage.status.disabled")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("userSettings.purchasePage.status.hint")}
              </p>
            </div>
            <Switch
              dir="ltr"
              checked={isPaymentEnabled}
              onCheckedChange={setIsPaymentEnabled}
              aria-label={t("userSettings.aria.togglePurchaseStatus")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-disabled-custom-message">
              {t("userSettings.purchasePage.customMessage.label")}
            </Label>
            <Textarea
              id="payment-disabled-custom-message"
              value={paymentDisabledMessage}
              onChange={(event) =>
                setPaymentDisabledMessage(event.target.value)
              }
              placeholder={t(
                "userSettings.purchasePage.customMessage.placeholder"
              )}
              className="min-h-24"
            />
            <p className="text-muted-foreground text-xs">
              {t("userSettings.purchasePage.customMessage.hint")}
            </p>
            <p className="text-muted-foreground text-xs">
              {t("userSettings.purchasePage.customMessage.fallbackLabel")}{" "}
              <span className="font-medium">
                {t("userSettings.defaults.purchaseDisabledFallbackMessage")}
              </span>
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updatePaymentGateConfig.isPending}
            >
              {updatePaymentGateConfig.isPending && (
                <IconLoader2 className="size-4 animate-spin" />
              )}
              {t("userSettings.actions.savePurchase")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
