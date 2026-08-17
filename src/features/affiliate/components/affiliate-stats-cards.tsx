import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  IconCheck,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AffiliateAdminStats } from "../types";
import { formatCount, formatToman } from "../utils/affiliate.helpers";

type AffiliateStatsCardsProps = {
  stats?: AffiliateAdminStats;
  isLoading?: boolean;
};

const ACCENTS = {
  amber: "border-r-amber-500",
  emerald: "border-r-emerald-500",
  blue: "border-r-blue-500",
  indigo: "border-r-indigo-500",
} as const;

export const AffiliateStatsCards = memo(function AffiliateStatsCards({
  stats,
  isLoading,
}: AffiliateStatsCardsProps) {
  const { t } = useTranslation("common");

  const cards = [
    {
      key: "pending",
      label: t("affiliate.stats.pendingPayouts"),
      value: stats ? formatToman(stats.pendingPayoutAmount) : "—",
      hint: stats?.pendingPayoutHint ?? "",
      icon: IconClock,
      iconClass: "text-amber-500",
      accent: ACCENTS.amber,
      hintClass: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "paid",
      label: t("affiliate.stats.totalPaid"),
      value: stats ? formatToman(stats.totalPaidCommissions) : "—",
      hint: t("affiliate.stats.totalPaidHint"),
      icon: IconCheck,
      iconClass: "text-emerald-500",
      accent: ACCENTS.emerald,
      hintClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "sales",
      label: t("affiliate.stats.generatedSales"),
      value: stats ? formatToman(stats.affiliateGeneratedSales) : "—",
      hint: t("affiliate.stats.generatedSalesHint"),
      icon: IconTrendingUp,
      iconClass: "text-blue-500",
      accent: ACCENTS.blue,
      hintClass: "text-muted-foreground",
    },
    {
      key: "partners",
      label: t("affiliate.stats.activePartners"),
      value: stats ? formatCount(stats.activePartnersCount) : "—",
      unit: t("affiliate.stats.personUnit"),
      hint: stats
        ? t("affiliate.stats.marketersThisMonth", {
            count: stats.marketersWithSalesThisMonth.toLocaleString("fa-IR"),
          })
        : "",
      icon: IconUsers,
      iconClass: "text-indigo-500",
      accent: ACCENTS.indigo,
      hintClass: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-2xl">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn("rounded-2xl border-r-4 shadow-sm", card.accent)}
        >
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-xs font-bold">
                {card.label}
              </span>
              <div className="bg-muted/60 flex size-8 items-center justify-center rounded-lg border">
                <card.icon className={cn("size-4", card.iconClass)} />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-black tabular-nums">
                {card.value}
                {"unit" in card && card.unit ? (
                  <span className="text-muted-foreground ms-1 text-xs font-normal">
                    {card.unit}
                  </span>
                ) : null}
              </div>
              <span className={cn("text-[10px] font-bold", card.hintClass)}>
                {card.hint}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
