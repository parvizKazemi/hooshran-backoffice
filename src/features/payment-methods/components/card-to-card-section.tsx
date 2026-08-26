import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconArrowsExchange, IconRobot } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { CardToCardMethodConfig } from "../types";
import { MethodSectionHeader } from "./method-section-header";

type CardToCardSectionProps = {
  value: CardToCardMethodConfig;
  onChange: (next: CardToCardMethodConfig) => void;
};

export function CardToCardSection({ value, onChange }: CardToCardSectionProps) {
  const { t } = useTranslation("common");

  const updateCardInfo = (
    patch: Partial<CardToCardMethodConfig["cardInfo"]>
  ) => {
    onChange({
      ...value,
      cardInfo: {
        ...value.cardInfo,
        ...patch,
      },
    });
  };

  const updateNotifier = (
    patch: Partial<CardToCardMethodConfig["notifier"]>
  ) => {
    onChange({
      ...value,
      notifier: {
        ...value.notifier,
        ...patch,
      },
    });
  };

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
      <MethodSectionHeader
        icon={<IconArrowsExchange className="size-5" />}
        iconClassName="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
        headerClassName="bg-indigo-500/5"
        title={t("paymentMethods.cardToCard.title")}
        description={t("paymentMethods.cardToCard.description")}
        checked={value.isEnabled}
        onCheckedChange={(isEnabled) => onChange({ ...value, isEnabled })}
        switchAriaLabel={t("paymentMethods.aria.toggleCardToCard")}
      />

      {value.isEnabled && (
        <div className="space-y-6 p-6">
          <div className="bg-muted/40 space-y-4 rounded-2xl border p-5">
            <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              {t("paymentMethods.cardToCard.bankInfoTitle")}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.cardNumber")}
                </Label>
                <Input
                  dir="ltr"
                  className="bg-background font-mono text-xs font-bold"
                  value={value.cardInfo.cardNumber}
                  onChange={(event) =>
                    updateCardInfo({ cardNumber: event.target.value })
                  }
                  placeholder={t(
                    "paymentMethods.cardToCard.cardNumberPlaceholder"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.cardHolder")}
                </Label>
                <Input
                  className="bg-background text-xs"
                  value={value.cardInfo.cardHolder}
                  onChange={(event) =>
                    updateCardInfo({ cardHolder: event.target.value })
                  }
                  placeholder={t(
                    "paymentMethods.cardToCard.cardHolderPlaceholder"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.bankName")}
                </Label>
                <Input
                  className="bg-background text-xs"
                  value={value.cardInfo.bankName}
                  onChange={(event) =>
                    updateCardInfo({ bankName: event.target.value })
                  }
                  placeholder={t(
                    "paymentMethods.cardToCard.bankNamePlaceholder"
                  )}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.iban")}
                </Label>
                <Input
                  dir="ltr"
                  className="bg-background font-mono text-xs"
                  value={value.cardInfo.iban}
                  onChange={(event) =>
                    updateCardInfo({ iban: event.target.value })
                  }
                  placeholder={t("paymentMethods.cardToCard.ibanPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-2">
              <IconRobot className="size-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-foreground text-sm font-bold">
                {t("paymentMethods.cardToCard.notifierTitle")}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("paymentMethods.cardToCard.notifierHint")}
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.appSecret")}
                </Label>
                <Input
                  dir="ltr"
                  type="password"
                  autoComplete="off"
                  className="bg-background font-mono text-xs"
                  value={value.notifier.appSecret ?? ""}
                  onChange={(event) =>
                    updateNotifier({ appSecret: event.target.value })
                  }
                  placeholder={t(
                    "paymentMethods.cardToCard.appSecretPlaceholder"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.recipient")}
                </Label>
                <Input
                  dir="ltr"
                  className="bg-background font-mono text-xs"
                  value={value.notifier.recipient}
                  onChange={(event) =>
                    updateNotifier({ recipient: event.target.value })
                  }
                  placeholder={t(
                    "paymentMethods.cardToCard.recipientPlaceholder"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">
                  {t("paymentMethods.cardToCard.channel")}
                </Label>
                <Input
                  dir="ltr"
                  className="bg-background font-mono text-xs"
                  value={value.notifier.channel}
                  onChange={(event) =>
                    updateNotifier({ channel: event.target.value })
                  }
                  placeholder="TELEGRAM"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
