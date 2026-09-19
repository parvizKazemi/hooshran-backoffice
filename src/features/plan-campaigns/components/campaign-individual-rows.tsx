import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { CampaignPlatformService, IndividualDiscountRow } from "../types";
import { CampaignSingleServiceSelector } from "./campaign-single-service-selector";
import { CampaignTierDiscountGrid } from "./campaign-tier-discount-grid";

type CampaignIndividualRowsProps = {
  rows: IndividualDiscountRow[];
  services: CampaignPlatformService[];
  onChange: (rows: IndividualDiscountRow[]) => void;
  onAddRow: () => void;
  disabled?: boolean;
};

export function CampaignIndividualRows({
  rows,
  services,
  onChange,
  onAddRow,
  disabled = false,
}: CampaignIndividualRowsProps) {
  const { t } = useTranslation("common");

  const usedUuids = rows.map((row) => row.serviceUuid).filter(Boolean);

  const updateRow = (id: string, patch: Partial<IndividualDiscountRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div
          key={row.id}
          className="group bg-card relative rounded-2xl border p-4 shadow-sm sm:p-5"
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeRow(row.id)}
            className="text-muted-foreground absolute top-4 left-4 rounded-md p-1 transition-colors hover:bg-destructive/10 hover:text-destructive"
            title={t("planCampaigns.form.removeRow")}
          >
            <IconTrash className="size-4" />
          </button>

          <div className="mb-4 pr-6 sm:pr-0">
            <label className="mb-1.5 block text-xs font-bold">
              {t("planCampaigns.form.selectDedicatedService")}
            </label>
            <CampaignSingleServiceSelector
              services={services}
              selectedUuid={row.serviceUuid}
              usedUuids={usedUuids}
              disabled={disabled}
              onChange={(uuid) => updateRow(row.id, { serviceUuid: uuid })}
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-[11px] font-bold">
              {t("planCampaigns.form.rowTierLabel")}
            </label>
            <CampaignTierDiscountGrid
              compact
              tiers={row.tiers}
              disabled={disabled}
              onChange={(tiers) => updateRow(row.id, { tiers })}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={onAddRow}
        className={cn(
          "border-primary/40 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10 h-auto w-full rounded-2xl border-2 border-dashed py-4 text-sm font-bold shadow-sm dark:bg-primary/10"
        )}
      >
        <IconPlus className="size-5" />
        {t("planCampaigns.form.addIndividualRow")}
      </Button>
    </div>
  );
}
