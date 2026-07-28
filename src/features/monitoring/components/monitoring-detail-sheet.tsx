import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMonitoringErrorDetail } from "../hooks/use-monitoring";
import {
  formatMonitoringDate,
  getSeverityBadgeClass,
  getTypeBadgeClass,
} from "../utils/monitoring.helpers";

type MonitoringDetailSheetProps = {
  uuid: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MonitoringDetailSheet = memo(function MonitoringDetailSheet({
  uuid,
  open,
  onOpenChange,
}: MonitoringDetailSheetProps) {
  const { t } = useTranslation("common");
  const { data, isLoading } = useMonitoringErrorDetail(open ? uuid : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("monitoring.detail.title")}</SheetTitle>
          <SheetDescription dir="ltr">{uuid || "—"}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1 pb-6">
          {isLoading || !data ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-black",
                    getSeverityBadgeClass(data.severity)
                  )}
                >
                  {t(`monitoring.severity.${data.severity}`, {
                    defaultValue: data.severity,
                  })}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("font-black", getTypeBadgeClass(data.type))}
                >
                  {t(`monitoring.type.${data.type}`, {
                    defaultValue: data.type,
                  })}
                </Badge>
                <Badge variant="secondary">
                  {t(`monitoring.source.${data.source}`, {
                    defaultValue: data.source,
                  })}
                </Badge>
              </div>

              <DetailRow
                label={t("monitoring.detail.error")}
                value={data.error}
              />
              <DetailRow
                label={t("monitoring.detail.location")}
                value={data.location}
                ltr
              />
              <DetailRow
                label={t("monitoring.detail.createdAt")}
                value={formatMonitoringDate(data.createdAt)}
              />
              <DetailRow
                label={t("monitoring.detail.notif")}
                value={
                  data.isNotifSent
                    ? t("monitoring.detail.notifYes")
                    : t("monitoring.detail.notifNo")
                }
              />
              <DetailRow
                label={t("monitoring.detail.user")}
                value={
                  data.user?.phoneNumber ||
                  data.user?.email ||
                  (data.userId != null ? String(data.userId) : "—")
                }
                ltr
              />

              {data.details && (
                <div className="space-y-3 rounded-2xl border p-3">
                  <h3 className="text-sm font-black">
                    {t("monitoring.detail.details")}
                  </h3>
                  <DetailRow
                    label={t("monitoring.detail.apiUrl")}
                    value={data.details.apiUrl || "—"}
                    ltr
                  />
                  <DetailRow
                    label={t("monitoring.detail.httpStatus")}
                    value={
                      data.details.httpStatus != null
                        ? String(data.details.httpStatus)
                        : "—"
                    }
                    ltr
                  />
                  <DetailRow
                    label={t("monitoring.detail.browser")}
                    value={data.details.browser || "—"}
                  />
                  <DetailRow
                    label={t("monitoring.detail.os")}
                    value={data.details.os || "—"}
                  />
                  <DetailRow
                    label={t("monitoring.detail.viewport")}
                    value={data.details.viewport || "—"}
                    ltr
                  />
                  <DetailRow
                    label={t("monitoring.detail.ip")}
                    value={data.details.ip || "—"}
                    ltr
                  />
                  {data.details.stackTrace && (
                    <pre
                      dir="ltr"
                      className="bg-muted max-h-56 overflow-auto rounded-xl p-3 text-[11px] leading-relaxed"
                    >
                      {data.details.stackTrace}
                    </pre>
                  )}
                  {data.details.customData && (
                    <pre
                      dir="ltr"
                      className="bg-muted max-h-40 overflow-auto rounded-xl p-3 text-[11px] leading-relaxed"
                    >
                      {JSON.stringify(data.details.customData, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

function DetailRow({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span
        className="text-sm font-semibold break-all"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </span>
    </div>
  );
}
