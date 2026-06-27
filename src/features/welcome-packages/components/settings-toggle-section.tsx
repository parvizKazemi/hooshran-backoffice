import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

type SettingsToggleSectionProps = {
  icon: Icon;
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  ariaLabel: string;
  children?: ReactNode;
  className?: string;
};

export function SettingsToggleSection({
  icon: Icon,
  title,
  description,
  enabled,
  onEnabledChange,
  ariaLabel,
  children,
  className,
}: SettingsToggleSectionProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border p-4", className)}>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <Switch
          dir="ltr"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          aria-label={ariaLabel}
          className="shrink-0"
        />
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          enabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          {enabled ? <div className="pt-1">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
