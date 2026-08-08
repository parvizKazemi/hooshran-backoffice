import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MONITORING_SEVERITY_COLORS,
  MONITORING_TYPE_COLORS,
} from "../constants";
import {
  countByDay,
  countBySeverity,
  countByType,
  isKnownErrorType,
} from "../utils/monitoring.helpers";
import type { MonitoringErrorLog, MonitoringSeverity } from "../types";

type MonitoringChartsProps = {
  items: MonitoringErrorLog[];
  isLoading?: boolean;
};

const CHART_HEIGHT = 160;

export const MonitoringCharts = memo(function MonitoringCharts({
  items,
  isLoading,
}: MonitoringChartsProps) {
  const { t } = useTranslation("common");

  const severityData = useMemo(() => countBySeverity(items), [items]);
  const typeData = useMemo(() => countByType(items), [items]);
  const timelineData = useMemo(() => countByDay(items), [items]);

  const severityConfig = useMemo(
    () =>
      Object.fromEntries(
        severityData.map((item) => [
          item.key,
          {
            label: t(`monitoring.severity.${item.key}`),
            color: MONITORING_SEVERITY_COLORS[item.key as MonitoringSeverity],
          },
        ])
      ) satisfies ChartConfig,
    [severityData, t]
  );

  const typeConfig = {
    value: { label: t("monitoring.charts.count"), color: "var(--primary)" },
  } satisfies ChartConfig;

  const timelineConfig = {
    count: { label: t("monitoring.charts.count"), color: "var(--primary)" },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <div className="grid gap-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="rounded-xl">
            <CardHeader className="space-y-1 px-3 py-2.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Skeleton
                className="w-full rounded-xl"
                style={{ height: CHART_HEIGHT }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasData = items.length > 0;

  return (
    <div className="grid gap-2 lg:grid-cols-3">
      <Card className="rounded-xl">
        <CardHeader className="space-y-0.5 px-3 py-2.5 text-start">
          <CardTitle className="text-sm">
            {t("monitoring.charts.severityTitle")}
          </CardTitle>
          <CardDescription className="text-[11px]">
            {t("monitoring.charts.sampleHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {!hasData ? (
            <EmptyChart label={t("monitoring.charts.empty")} />
          ) : (
            <ChartContainer
              config={severityConfig}
              className="mx-auto aspect-auto h-[160px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="key" hideLabel />}
                />
                <Pie
                  data={severityData.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={36}
                  outerRadius={58}
                  strokeWidth={2}
                >
                  {severityData
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <Cell
                        key={item.key}
                        fill={
                          MONITORING_SEVERITY_COLORS[
                            item.key as MonitoringSeverity
                          ]
                        }
                      />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="space-y-0.5 px-3 py-2.5 text-start">
          <CardTitle className="text-sm">
            {t("monitoring.charts.typeTitle")}
          </CardTitle>
          <CardDescription className="text-[11px]">
            {t("monitoring.charts.sampleHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {!hasData ? (
            <EmptyChart label={t("monitoring.charts.empty")} />
          ) : (
            <ChartContainer
              config={typeConfig}
              dir="ltr"
              className="aspect-auto h-[160px] w-full"
            >
              <BarChart
                data={typeData}
                layout="vertical"
                margin={{ left: 4, right: 8, top: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="key"
                  type="category"
                  width={96}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) =>
                    t(`monitoring.type.${value}`, { defaultValue: value })
                  }
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4}>
                  {typeData.map((item) => (
                    <Cell
                      key={item.key}
                      fill={
                        isKnownErrorType(item.key)
                          ? MONITORING_TYPE_COLORS[item.key]
                          : "var(--primary)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="space-y-0.5 px-3 py-2.5 text-start">
          <CardTitle className="text-sm">
            {t("monitoring.charts.timelineTitle")}
          </CardTitle>
          <CardDescription className="text-[11px]">
            {t("monitoring.charts.sampleHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {!hasData ? (
            <EmptyChart label={t("monitoring.charts.empty")} />
          ) : (
            <ChartContainer
              config={timelineConfig}
              className="aspect-auto h-[160px] w-full"
            >
              <AreaChart data={timelineData} margin={{ top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) =>
                    new Date(value).toLocaleDateString("fa-IR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="var(--color-count)"
                  fillOpacity={0.25}
                  stroke="var(--color-count)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

function EmptyChart({ label }: { label: string }) {
  return (
    <div
      className="text-muted-foreground flex items-center justify-center text-xs"
      style={{ height: CHART_HEIGHT }}
    >
      {label}
    </div>
  );
}
