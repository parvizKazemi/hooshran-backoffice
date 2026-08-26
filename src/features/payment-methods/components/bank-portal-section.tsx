import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { IconGlobe } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { BANK_PORTAL_PROVIDER_LABEL_KEYS } from "../constants";
import type { BankPortalMethodConfig } from "../types";
import { MethodSectionHeader } from "./method-section-header";

type BankPortalSectionProps = {
  value: BankPortalMethodConfig;
  onChange: (next: BankPortalMethodConfig) => void;
};

function resolveProviderLabel(
  providerId: string,
  title: string,
  t: (key: string) => string
): string {
  if (providerId in BANK_PORTAL_PROVIDER_LABEL_KEYS) {
    return t(
      BANK_PORTAL_PROVIDER_LABEL_KEYS[
        providerId as keyof typeof BANK_PORTAL_PROVIDER_LABEL_KEYS
      ]
    );
  }
  return title || providerId;
}

function resolveMerchantField(providerId: string): "merchantId" | "merchant" {
  return providerId === "zibal" ? "merchant" : "merchantId";
}

export function BankPortalSection({ value, onChange }: BankPortalSectionProps) {
  const { t } = useTranslation("common");
  const providerIds =
    value.priority.length > 0 ? value.priority : Object.keys(value.providers);

  const updateProvider = (
    providerId: string,
    patch: Partial<BankPortalMethodConfig["providers"][string]>
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

  const setAsDefault = (providerId: string) => {
    onChange({
      ...value,
      defaultProvider: providerId,
    });
  };

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
      <MethodSectionHeader
        icon={<IconGlobe className="size-5" />}
        iconClassName="bg-blue-500/15 text-blue-600 dark:text-blue-400"
        headerClassName="bg-blue-500/5"
        title={t("paymentMethods.bankPortal.title")}
        description={t("paymentMethods.bankPortal.description")}
        checked={value.isEnabled}
        onCheckedChange={(isEnabled) => onChange({ ...value, isEnabled })}
        switchAriaLabel={t("paymentMethods.aria.toggleBankPortal")}
      />

      {value.isEnabled && (
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {providerIds.map((providerId) => {
              const provider = value.providers[providerId];
              if (!provider) return null;

              const isDefault = value.defaultProvider === providerId;
              const merchantField = resolveMerchantField(providerId);
              const merchantValue =
                merchantField === "merchant"
                  ? (provider.merchant ?? "")
                  : (provider.merchantId ?? "");

              return (
                <div
                  key={providerId}
                  className="bg-muted/40 hover:border-primary/40 space-y-4 rounded-2xl border p-5 transition-colors"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg text-xs font-bold",
                          providerId === "zibal"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {providerId === "zibal" ? "ZB" : "ZP"}
                      </div>
                      <div>
                        <h3 className="text-foreground text-sm font-bold">
                          {resolveProviderLabel(providerId, provider.title, t)}
                        </h3>
                        <span
                          className={cn(
                            "text-[11px]",
                            isDefault
                              ? "font-medium text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {isDefault
                            ? t("paymentMethods.bankPortal.defaultProvider")
                            : t("paymentMethods.bankPortal.secondaryProvider")}
                        </span>
                      </div>
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

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-foreground text-xs font-bold">
                        {merchantField === "merchant"
                          ? t("paymentMethods.bankPortal.merchantKey")
                          : t("paymentMethods.bankPortal.merchantId")}
                      </Label>
                      <Input
                        dir="ltr"
                        className="bg-background font-mono text-xs"
                        value={merchantValue}
                        onChange={(event) =>
                          updateProvider(providerId, {
                            [merchantField]: event.target.value,
                          })
                        }
                        placeholder={
                          merchantField === "merchant"
                            ? t(
                                "paymentMethods.bankPortal.merchantKeyPlaceholder"
                              )
                            : t(
                                "paymentMethods.bankPortal.merchantIdPlaceholder"
                              )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          dir="ltr"
                          id={`sandbox-${providerId}`}
                          checked={Boolean(provider.sandbox)}
                          onCheckedChange={(sandbox) =>
                            updateProvider(providerId, { sandbox })
                          }
                        />
                        <Label
                          htmlFor={`sandbox-${providerId}`}
                          className="text-muted-foreground text-xs"
                        >
                          {t("paymentMethods.bankPortal.sandbox")}
                        </Label>
                      </div>

                      {isDefault ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        >
                          {t("paymentMethods.bankPortal.defaultBadge")}
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={!provider.isEnabled}
                          onClick={() => setAsDefault(providerId)}
                        >
                          {t("paymentMethods.bankPortal.setDefault")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
