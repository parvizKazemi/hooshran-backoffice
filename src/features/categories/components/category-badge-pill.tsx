import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { CategoryBadge } from "../types";

type CategoryBadgePillProps = {
  badge: CategoryBadge;
  className?: string;
};

export function CategoryBadgePill({
  badge,
  className,
}: CategoryBadgePillProps) {
  const { t } = useTranslation("common");

  if (!badge) {
    return (
      <span
        className={cn("text-muted-foreground text-[10px] font-bold", className)}
      >
        {t("categories.badges.none")}
      </span>
    );
  }

  if (badge === "soon") {
    return (
      <span
        className={cn(
          "rounded border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
          className
        )}
      >
        {t("categories.badges.soon")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
        className
      )}
    >
      {t("categories.badges.new")}
    </span>
  );
}
