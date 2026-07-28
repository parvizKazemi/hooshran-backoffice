import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  IconAlertTriangle,
  IconBell,
  IconBug,
  IconStack2,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeErrors } from "../utils/monitoring.helpers";
import type { MonitoringErrorLog } from "../types";

type MonitoringStatsProps = {
  total: number;
  items: MonitoringErrorLog[];
  isLoading?: boolean;
};

export const MonitoringStats = memo(function MonitoringStats({
  total,
  items,
  isLoading,
}: MonitoringStatsProps) {
  const { t } = useTranslation("common");
  const summary = useMemo(() => summarizeErrors(items), [items]);

  const cards = [
    {
      key: "total",
      label: t("monitoring.stats.total"),
      value: total,
      icon: IconBug,
      tone: "text-primary",
    },
    {
      key: "critical",
      label: t("monitoring.stats.criticalOrHigh"),
      value: summary.criticalOrHigh,
      icon: IconAlertTriangle,
      tone: "text-orange-600",
    },
    {
      key: "types",
      label: t("monitoring.stats.uniqueTypes"),
      value: summary.uniqueTypes,
      icon: IconStack2,
      tone: "text-violet-600",
    },
    {
      key: "notif",
      label: t("monitoring.stats.notifSent"),
      value: summary.notifSent,
      icon: IconBell,
      tone: "text-emerald-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-3xl">
            <CardContent className="p-4">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} className="rounded-3xl">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                {card.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-black" dir="ltr">
                {card.value.toLocaleString("fa-IR")}
              </p>
            </div>
            <card.icon className={`size-8 opacity-80 ${card.tone}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
