import { ServiceSelectorPanel } from "@/components/common/service-selector-panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CampaignPlatformService } from "../types";

type CampaignSingleServiceSelectorProps = {
  services: CampaignPlatformService[];
  selectedUuid: string;
  onChange: (uuid: string) => void;
  disabled?: boolean;
  usedUuids?: string[];
  labelByUuid?: Record<string, string>;
};

export function CampaignSingleServiceSelector({
  services,
  selectedUuid,
  onChange,
  disabled = false,
  usedUuids = [],
  labelByUuid = {},
}: CampaignSingleServiceSelectorProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (!selectedUuid) {
      return t("planCampaigns.form.selectServicePlaceholder");
    }
    const service = services.find((item) => item.uuid === selectedUuid);
    return (
      service?.name ??
      labelByUuid[selectedUuid] ??
      t("planCampaigns.form.selectServicePlaceholder")
    );
  }, [selectedUuid, services, labelByUuid, t]);

  const selectService = (uuid: string) => {
    onChange(uuid);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-xl px-3 text-sm font-bold",
            disabled && "opacity-60"
          )}
        >
          <span className="truncate">{label}</span>
          <IconChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <ServiceSelectorPanel
          open={open}
          title={t("planCampaigns.form.selectDedicatedService")}
          services={services}
          selectedUuids={selectedUuid ? [selectedUuid] : []}
          emptyMessage={t("welcomePackages.services.noSearchResults")}
        >
          {(filteredServices) => (
            <div className="space-y-1">
              {filteredServices.map((service) => {
                const isUsedElsewhere =
                  usedUuids.includes(service.uuid) &&
                  service.uuid !== selectedUuid;

                return (
                  <label
                    key={service.uuid}
                    className={cn(
                      "hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs",
                      isUsedElsewhere && "pointer-events-none opacity-40"
                    )}
                  >
                    <Checkbox
                      checked={selectedUuid === service.uuid}
                      disabled={isUsedElsewhere}
                      onCheckedChange={(value) => {
                        if (value === true) {
                          selectService(service.uuid);
                        }
                      }}
                    />
                    <span className="truncate">{service.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </ServiceSelectorPanel>
      </PopoverContent>
    </Popover>
  );
}
