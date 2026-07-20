import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { ServiceBadge } from "../types";

type ServiceBadgePillProps = {
  badge: ServiceBadge;
  className?: string;
};

export function ServiceBadgePill({ badge, className }: ServiceBadgePillProps) {
  const { t } = useTranslation("common");

  if (!badge) {
    return (
      <span
        className={cn("text-muted-foreground text-[10px] font-bold", className)}
      >
        {t("manageServices.badges.none")}
      </span>
    );
  }

  const styles: Record<Exclude<ServiceBadge, null>, string> = {
    popular:
      "border-pink-100 bg-pink-50 text-pink-600 dark:border-pink-900/50 dark:bg-pink-950/40 dark:text-pink-300",
    most_used:
      "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
    newest:
      "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  };

  return (
    <span
      className={cn(
        "rounded border px-2 py-0.5 text-[10px] font-black",
        styles[badge],
        className
      )}
    >
      {t(`manageServices.badges.${badge}`)}
    </span>
  );
}
