import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { UTM_CAMPAIGN_TYPES } from "../constants";
import type { PlatformService, UtmCampaignFormRow } from "../types";
import { ServiceAllowedSelector } from "./service-allowed-selector";

type UtmCampaignRowProps = {
  row: UtmCampaignFormRow;
  services: PlatformService[];
  onChange: (row: UtmCampaignFormRow) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function UtmCampaignRow({
  row,
  services,
  onChange,
  onRemove,
  disabled = false,
}: UtmCampaignRowProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-card grid grid-cols-1 items-center gap-2 rounded-xl border p-2.5 md:grid-cols-12">
      <div className="md:col-span-3">
        <Select
          value={row.type}
          onValueChange={(value) =>
            onChange({
              ...row,
              type: value as UtmCampaignFormRow["type"],
            })
          }
          disabled={disabled}
        >
          <SelectTrigger className="h-9 rounded-lg text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UTM_CAMPAIGN_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="text-xs">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-3">
        <Input
          value={row.value}
          onChange={(event) => onChange({ ...row, value: event.target.value })}
          placeholder={t("welcomePackages.utmCampaigns.valuePlaceholder")}
          className="h-9 rounded-lg font-mono text-xs"
          dir="ltr"
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-1 md:col-span-2">
        <Input
          type="number"
          min={0}
          value={row.credits}
          onChange={(event) =>
            onChange({
              ...row,
              credits: Number(event.target.value) || 0,
            })
          }
          className="h-9 rounded-lg font-mono text-xs"
          disabled={disabled}
        />
        <span className="text-muted-foreground shrink-0 text-[10px] font-bold">
          🪙
        </span>
      </div>

      <div className="md:col-span-3">
        <ServiceAllowedSelector
          variant="dropdown"
          services={services}
          selectedUuids={row.selectedServiceUuids}
          allServicesSelected={row.allServicesSelected}
          onChange={({ selectedUuids, allServicesSelected }) =>
            onChange({
              ...row,
              selectedServiceUuids: selectedUuids,
              allServicesSelected,
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end md:col-span-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          className="text-destructive hover:text-destructive h-8 w-8"
          aria-label={t("welcomePackages.utmCampaigns.removeRow")}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </div>
  );
}
