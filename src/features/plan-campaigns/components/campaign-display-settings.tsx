import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconEyeOff,
  IconInfoCircle,
  IconSpeakerphone,
  IconStack2,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ServiceDisplayConfig } from "../types";

type CampaignDisplaySettingsProps = {
  rows: ServiceDisplayConfig[];
  showAsBanner: boolean;
  onChangeRow: (
    serviceUuid: string,
    patch: Partial<ServiceDisplayConfig>
  ) => void;
  onRemoveFromDisplay: (serviceUuid: string) => void;
  onRestoreAll: () => void;
  onShowAsBannerChange: (checked: boolean) => void;
};

const VISIBILITY_FIELDS = [
  ["showOnPlanCard", "planCard"],
  ["showOnPlanComparison", "planComparison"],
  ["showInBanner", "banner"],
] as const;

export function CampaignDisplaySettings({
  rows,
  showAsBanner,
  onChangeRow,
  onRemoveFromDisplay,
  onRestoreAll,
  onShowAsBannerChange,
}: CampaignDisplaySettingsProps) {
  const { t } = useTranslation("common");
  const visibleRows = rows.filter((row) => !row.removedFromDisplay);
  const removedRows = rows.filter((row) => row.removedFromDisplay);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-bold">
            {t("planCampaigns.form.visibility")}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {t("planCampaigns.form.display.subtitle")}
          </p>
        </div>
        <span className="bg-primary/10 text-primary border-primary/15 w-fit shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold">
          {t("planCampaigns.form.display.queueCount", {
            count: visibleRows.length,
          })}
        </span>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <IconInfoCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{t("planCampaigns.form.display.removeNotice")}</span>
      </div>

      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        {visibleRows.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <IconStack2 className="text-muted-foreground/40 mx-auto mb-2 size-8" />
            <p className="text-xs font-medium">
              {t("planCampaigns.form.display.emptyTitle")}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {t("planCampaigns.form.display.emptyHint")}
            </p>
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="min-w-[200px] text-xs font-bold">
                  {t("planCampaigns.form.display.columns.displayName")}
                </TableHead>
                <TableHead className="w-24 min-w-[80px] text-center text-xs font-bold">
                  {t("planCampaigns.form.display.columns.priority")}
                </TableHead>
                {VISIBILITY_FIELDS.map(([, labelKey]) => (
                  <TableHead
                    key={labelKey}
                    className="min-w-[90px] text-center text-xs font-bold"
                  >
                    {t(`planCampaigns.form.display.columns.${labelKey}`)}
                  </TableHead>
                ))}
                <TableHead className="w-20 min-w-[70px] text-center text-xs font-bold">
                  {t("planCampaigns.form.display.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.serviceUuid}>
                  <TableCell className="p-2 sm:p-3">
                    <Input
                      value={row.displayName}
                      onChange={(event) =>
                        onChangeRow(row.serviceUuid, {
                          displayName: event.target.value,
                        })
                      }
                      placeholder={t(
                        "planCampaigns.form.display.displayNamePlaceholder"
                      )}
                      className="h-9 rounded-lg text-xs font-medium"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-center sm:p-3">
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={row.priority ?? ""}
                      onChange={(event) =>
                        onChangeRow(row.serviceUuid, {
                          priority: Math.max(
                            1,
                            Number.parseInt(event.target.value, 10) || 1
                          ),
                        })
                      }
                      aria-label={t(
                        "planCampaigns.form.display.columns.priority"
                      )}
                      className="mx-auto h-9 w-16 rounded-lg text-center text-xs"
                    />
                  </TableCell>
                  {VISIBILITY_FIELDS.map(([field, labelKey]) => (
                    <TableCell key={field} className="p-2 sm:p-3">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={row[field]}
                          onCheckedChange={(checked) =>
                            onChangeRow(row.serviceUuid, {
                              [field]: checked === true,
                            })
                          }
                          aria-label={t(
                            `planCampaigns.form.display.columns.${labelKey}`
                          )}
                        />
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="p-2 text-center sm:p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
                      title={t("planCampaigns.form.display.removeFromDisplay")}
                      onClick={() => onRemoveFromDisplay(row.serviceUuid)}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {removedRows.length > 0 ? (
        <div className="bg-muted/60 flex flex-col gap-2 rounded-lg border p-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex min-w-0 items-start gap-2">
            <IconEyeOff className="mt-0.5 size-3.5 shrink-0" />
            <span className="leading-relaxed">
              {t("planCampaigns.form.display.removedLabel")}{" "}
              <span className="text-foreground font-bold">
                {removedRows
                  .map((row) => row.displayName.trim() || row.serviceUuid)
                  .join("، ")}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onRestoreAll}
            className="text-primary shrink-0 text-xs font-bold underline"
          >
            {t("planCampaigns.form.display.restoreAll")}
          </button>
        </div>
      ) : null}

      <div className="border-t pt-4">
        <label className="bg-muted/40 hover:bg-muted/60 flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border">
              <IconSpeakerphone className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold">
                {t("planCampaigns.form.display.globalBannerTitle")}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                {t("planCampaigns.form.display.globalBannerHint")}
              </span>
            </div>
          </div>
          <Switch
            dir="ltr"
            checked={showAsBanner}
            onCheckedChange={onShowAsBannerChange}
            aria-label={t("planCampaigns.form.display.globalBannerTitle")}
          />
        </label>
      </div>
    </div>
  );
}
