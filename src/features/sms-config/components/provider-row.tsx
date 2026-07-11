import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconMail,
  IconSettings,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { isKnownSmsProviderId, PROVIDER_LABEL_KEYS } from "../constants";
import type { SmsProviderConfigItem } from "../types";

type ProviderRowProps = {
  provider: SmsProviderConfigItem;
  priority: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: (isActive: boolean) => void;
  onOpenTemplates: () => void;
};

export function ProviderRow({
  provider,
  priority,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onOpenTemplates,
}: ProviderRowProps) {
  const { t } = useTranslation("common");
  const loginTemplateId = provider.templates.login?.templateId ?? "—";
  const providerLabel = isKnownSmsProviderId(provider.id)
    ? t(PROVIDER_LABEL_KEYS[provider.id])
    : provider.id;

  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
        "hover:border-border/80"
      )}
    >
      <div className="flex w-full items-center gap-4 sm:w-auto">
        <div className="flex shrink-0 flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            disabled={isFirst}
            onClick={onMoveUp}
            title={t("smsConfig.actions.moveUp")}
            aria-label={t("smsConfig.actions.moveUp")}
          >
            <IconChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            disabled={isLast}
            onClick={onMoveDown}
            title={t("smsConfig.actions.moveDown")}
            aria-label={t("smsConfig.actions.moveDown")}
          >
            <IconChevronDown className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary border-primary/20 flex size-10 shrink-0 items-center justify-center rounded-xl border">
            <IconMail className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold">{providerLabel}</h4>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {t("smsConfig.priority", { order: priority })}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
              {t("smsConfig.loginTemplateLabel")}:{" "}
              <span
                className="text-foreground font-mono font-semibold"
                dir="ltr"
              >
                {loginTemplateId || "—"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-border/50 flex w-full shrink-0 items-center justify-between gap-4 border-t pt-3 sm:w-auto sm:justify-end sm:border-none sm:pt-0">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold",
              provider.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            {provider.isActive
              ? t("smsConfig.status.active")
              : t("smsConfig.status.inactive")}
          </Badge>
          <Switch
            dir="ltr"
            checked={provider.isActive}
            onCheckedChange={onToggleActive}
            aria-label={t("smsConfig.aria.toggleProvider")}
          />
        </div>

        <div className="bg-border hidden h-6 w-px sm:block" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-bold"
          onClick={onOpenTemplates}
        >
          <IconSettings className="size-4" />
          {t("smsConfig.actions.editTemplates")}
        </Button>
      </div>
    </div>
  );
}
