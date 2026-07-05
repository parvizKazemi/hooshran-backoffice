import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCheck, IconShoppingBag, IconTicket } from "@tabler/icons-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { DiscountCode, DiscountCodeOverallReport } from "../types";

type DiscountCodesStatsProps = {
  report?: DiscountCodeOverallReport;
  codes: DiscountCode[];
  isLoading?: boolean;
};

export function DiscountCodesStats({
  report,
  codes,
  isLoading = false,
}: DiscountCodesStatsProps) {
  const { t } = useTranslation("common");

  const activeCount = useMemo(() => {
    const now = Date.now();
    return codes.filter((code) => {
      if (code.expiresAt && new Date(code.expiresAt).getTime() < now) {
        return false;
      }
      return true;
    }).length;
  }, [codes]);

  const personalCount = useMemo(
    () => codes.filter((code) => code.type === "personal").length,
    [codes]
  );

  const cards = [
    {
      key: "active",
      label: t("discountCodes.stats.active"),
      value: activeCount,
      icon: IconCheck,
      iconClassName: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      key: "usage",
      label: t("discountCodes.stats.totalUsage"),
      value: report?.totalSuccessfulRedemptions ?? 0,
      icon: IconShoppingBag,
      iconClassName: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      key: "personal",
      label: t("discountCodes.stats.personal"),
      value: personalCount,
      icon: IconTicket,
      iconClassName: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-full ${card.iconClassName}`}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <CardTitle className="text-muted-foreground text-xs font-semibold">
                  {card.label}
                </CardTitle>
                <p className="text-2xl font-black">
                  {card.value.toLocaleString("fa-IR")}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
