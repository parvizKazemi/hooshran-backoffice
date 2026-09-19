import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconCreditCard,
  IconEdit,
  IconSpeakerphone,
  IconStack2,
  IconTemplate,
  IconTrash,
} from "@tabler/icons-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { PlanCampaign } from "../types";
import { toCampaignEndDateLabel } from "../utils/campaign-form.helpers";

type CampaignsTableProps = {
  campaigns: PlanCampaign[];
  isLoading?: boolean;
  onEdit: (campaign: PlanCampaign) => void;
  onDelete: (campaign: PlanCampaign) => void;
};

function countUniqueServices(campaign: PlanCampaign): number {
  const ids = new Set(
    (campaign.serviceDiscounts ?? []).map((item) => item.apiServiceId)
  );
  return ids.size;
}

function getCampaignSubtitle(
  campaign: PlanCampaign,
  t: TFunction<"common">
) {
  const count = countUniqueServices(campaign);
  if (count === 0) {
    return t("planCampaigns.table.noServices");
  }
  if (count === 1) {
    const name =
      campaign.serviceDiscounts?.[0]?.serviceName ??
      t("planCampaigns.table.oneService");
    return name;
  }
  return t("planCampaigns.table.serviceCount", { count });
}

export function CampaignsTable({
  campaigns,
  isLoading = false,
  onEdit,
  onDelete,
}: CampaignsTableProps) {
  const { t } = useTranslation("common");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          {t("planCampaigns.table.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-bold">
              {t("planCampaigns.table.targetService")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("planCampaigns.table.endStatus")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("planCampaigns.table.visibility")}
            </TableHead>
            <TableHead className="text-center font-bold">
              {t("planCampaigns.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const endInfo = toCampaignEndDateLabel(campaign.endsAt);
            const serviceCount = countUniqueServices(campaign);
            const isGroup = serviceCount > 1;

            return (
              <TableRow key={campaign.uuid} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                      <IconStack2 className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{campaign.title}</span>
                      <span className="text-muted-foreground font-mono text-[10px]">
                        {isGroup
                          ? t("planCampaigns.table.groupLabel", {
                              subtitle: getCampaignSubtitle(campaign, t),
                            })
                          : getCampaignSubtitle(campaign, t)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      endInfo.isExpired
                        ? "border-border bg-muted text-muted-foreground"
                        : endInfo.isIndefinite
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    }
                  >
                    {endInfo.isIndefinite
                      ? t("planCampaigns.table.indefiniteEnd")
                      : endInfo.isExpired
                        ? t("planCampaigns.table.expired")
                        : t("planCampaigns.table.untilDate", {
                            date: endInfo.label,
                          })}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1.5">
                    <IconTemplate
                      className={
                        campaign.showOnPlanPage
                          ? "size-4 text-emerald-500"
                          : "text-muted-foreground/40 size-4"
                      }
                      title={t(
                        "planCampaigns.form.visibilityOptions.planPage.title"
                      )}
                    />
                    <IconCreditCard
                      className={
                        campaign.showOnPlanCard
                          ? "size-4 text-indigo-500"
                          : "text-muted-foreground/40 size-4"
                      }
                      title={t(
                        "planCampaigns.form.visibilityOptions.planCard.title"
                      )}
                    />
                    <IconSpeakerphone
                      className={
                        campaign.showAsBanner
                          ? "size-4 text-blue-500"
                          : "text-muted-foreground/40 size-4"
                      }
                      title={t(
                        "planCampaigns.form.visibilityOptions.banner.title"
                      )}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-primary/10 hover:text-primary size-8"
                      onClick={() => onEdit(campaign)}
                    >
                      <IconEdit className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
                      onClick={() => onDelete(campaign)}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
