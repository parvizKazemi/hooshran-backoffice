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
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="rounded-3xl">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[220px] w-full rounded-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasData = items.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("monitoring.charts.severityTitle")}
          </CardTitle>
          <CardDescription>{t("monitoring.charts.sampleHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <EmptyChart label={t("monitoring.charts.empty")} />
          ) : (
            <ChartContainer
              config={severityConfig}
              className="mx-auto h-[220px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="key" hideLabel />}
                />
                <Pie
                  data={severityData.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={48}
                  outerRadius={78}
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

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("monitoring.charts.typeTitle")}
          </CardTitle>
          <CardDescription>{t("monitoring.charts.sampleHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <EmptyChart label={t("monitoring.charts.empty")} />
          ) : (
            <ChartContainer config={typeConfig} className="h-[220px] w-full">
              <BarChart
                data={typeData}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="key"
                  type="category"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) =>
                    t(`monitoring.type.${value}`, { defaultValue: value })
                  }
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={6}>
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

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("monitoring.charts.timelineTitle")}
          </CardTitle>
          <CardDescription>{t("monitoring.charts.sampleHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <EmptyChart label={t("monitoring.charts.empty")} />
          ) : (
            <ChartContainer
              config={timelineConfig}
              className="h-[220px] w-full"
            >
              <AreaChart data={timelineData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
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
    <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
      {label}
    </div>
  );
}
