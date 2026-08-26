import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MethodSectionHeaderProps = {
  icon: ReactNode;
  iconClassName?: string;
  headerClassName?: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  switchAriaLabel: string;
  switchClassName?: string;
};

export function MethodSectionHeader({
  icon,
  iconClassName,
  headerClassName,
  title,
  description,
  checked,
  onCheckedChange,
  switchAriaLabel,
  switchClassName,
}: MethodSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b p-6",
        headerClassName
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            iconClassName
          )}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-foreground text-lg font-bold">{title}</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        </div>
      </div>
      <Switch
        dir="ltr"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={switchAriaLabel}
        className={switchClassName}
      />
    </div>
  );
}
