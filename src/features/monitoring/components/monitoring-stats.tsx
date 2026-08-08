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
      <div className="grid grid-cols-4 gap-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-xl">
            <CardContent className="p-2.5">
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="h-5 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} className="rounded-xl">
          <CardContent className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0 text-start">
              <p className="text-muted-foreground truncate text-[11px] leading-tight font-medium">
                {card.label}
              </p>
              <p
                className="mt-0.5 py-1 text-lg leading-none font-black tabular-nums"
                dir="ltr"
              >
                {card.value.toLocaleString("fa-IR")}
              </p>
            </div>
            <card.icon
              className={`size-5 shrink-0 opacity-75 ${card.tone}`}
              aria-hidden
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
