import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IconChartPie } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { INSTALLMENT_PROVIDER_LABEL_KEYS } from "../constants";
import type { InstallmentMethodConfig } from "../types";
import { MethodSectionHeader } from "./method-section-header";

type InstallmentSectionProps = {
  value: InstallmentMethodConfig;
  onChange: (next: InstallmentMethodConfig) => void;
};

function resolveProviderLabel(
  providerId: string,
  title: string,
  t: (key: string) => string
): string {
  if (providerId in INSTALLMENT_PROVIDER_LABEL_KEYS) {
    return t(
      INSTALLMENT_PROVIDER_LABEL_KEYS[
        providerId as keyof typeof INSTALLMENT_PROVIDER_LABEL_KEYS
      ]
    );
  }
  return title || providerId;
}

export function InstallmentSection({
  value,
  onChange,
}: InstallmentSectionProps) {
  const { t } = useTranslation("common");
  const providerIds =
    value.priority.length > 0 ? value.priority : Object.keys(value.providers);

  const updateProvider = (
    providerId: string,
    patch: Partial<InstallmentMethodConfig["providers"][string]>
  ) => {
    const current = value.providers[providerId];
    if (!current) return;

    onChange({
      ...value,
      providers: {
        ...value.providers,
        [providerId]: {
          ...current,
          ...patch,
        },
      },
    });
  };

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
      <MethodSectionHeader
        icon={<IconChartPie className="size-5" />}
        iconClassName="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        headerClassName="bg-violet-500/5"
        title={t("paymentMethods.installment.title")}
        description={t("paymentMethods.installment.description")}
        checked={value.isEnabled}
        onCheckedChange={(isEnabled) => onChange({ ...value, isEnabled })}
        switchAriaLabel={t("paymentMethods.aria.toggleInstallment")}
      />

      {value.isEnabled && (
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">
                {t("paymentMethods.installment.defaultProvider")}
              </Label>
              <Select
                value={value.defaultProvider}
                onValueChange={(defaultProvider) =>
                  onChange({ ...value, defaultProvider })
                }
              >
                <SelectTrigger className="w-full text-xs font-bold">
                  <SelectValue
                    placeholder={t(
                      "paymentMethods.installment.providerPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {providerIds.map((providerId) => {
                    const provider = value.providers[providerId];
                    if (!provider) return null;
                    return (
                      <SelectItem key={providerId} value={providerId}>
                        {resolveProviderLabel(providerId, provider.title, t)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {providerIds.map((providerId) => {
              const provider = value.providers[providerId];
              if (!provider) return null;

              return (
                <div
                  key={providerId}
                  className="bg-muted/40 flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-bold">
                      {resolveProviderLabel(providerId, provider.title, t)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {providerId === value.defaultProvider
                        ? t("paymentMethods.installment.isDefault")
                        : t("paymentMethods.installment.providerHint")}
                    </p>
                  </div>
                  <Switch
                    dir="ltr"
                    checked={provider.isEnabled}
                    onCheckedChange={(isEnabled) =>
                      updateProvider(providerId, { isEnabled })
                    }
                    aria-label={t("paymentMethods.aria.toggleProvider", {
                      provider: resolveProviderLabel(
                        providerId,
                        provider.title,
                        t
                      ),
                    })}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
