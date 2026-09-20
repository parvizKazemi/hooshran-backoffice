import { ServiceSelectorPanel } from "@/components/common/service-selector-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconPlus, IconX } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CampaignPlatformService } from "../types";

type CampaignGroupServiceSelectorProps = {
  services: CampaignPlatformService[];
  selectedUuids: string[];
  onChange: (uuids: string[]) => void;
  disabled?: boolean;
  /** Fallback labels when uuid is not in `services` (e.g. edit mode) */
  labelByUuid?: Record<string, string>;
};

export function CampaignGroupServiceSelector({
  services,
  selectedUuids,
  onChange,
  disabled = false,
  labelByUuid = {},
}: CampaignGroupServiceSelectorProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const selectedServices = useMemo(() => {
    return selectedUuids.map((uuid) => {
      const fromCatalog = services.find((service) => service.uuid === uuid);
      if (fromCatalog) return fromCatalog;
      return {
        uuid,
        name: labelByUuid[uuid] || uuid,
        slug: "",
        isActive: true,
      } satisfies CampaignPlatformService;
    });
  }, [selectedUuids, services, labelByUuid]);

  const toggleService = (uuid: string, checked: boolean) => {
    if (checked) {
      if (!selectedUuids.includes(uuid)) {
        onChange([...selectedUuids, uuid]);
      }
      return;
    }
    onChange(selectedUuids.filter((item) => item !== uuid));
  };

  const removeService = (uuid: string) => {
    onChange(selectedUuids.filter((item) => item !== uuid));
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-input bg-background flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border p-3",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {selectedServices.map((service) => (
          <Badge
            key={service.uuid}
            variant="secondary"
            className="gap-1.5 rounded-xl bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-100"
          >
            <span className="max-w-48 truncate">{service.name}</span>
            <button
              type="button"
              onClick={() => removeService(service.uuid)}
              className="text-violet-500 hover:text-violet-800 dark:hover:text-violet-200"
              aria-label={t("welcomePackages.services.removeService", {
                name: service.name,
              })}
            >
              <IconX className="size-3" />
            </button>
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || services.length === 0}
              className="h-8 rounded-xl text-xs font-bold"
            >
              <IconPlus className="size-3.5" />
              {t("planCampaigns.form.addService")}
              <IconChevronDown className="size-3.5 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[min(24rem,calc(100vw-2rem))] p-0"
          >
            <ServiceSelectorPanel
              open={open}
              title={t("welcomePackages.services.selectAllowed")}
              services={services}
              selectedUuids={selectedUuids}
              emptyMessage={t("welcomePackages.services.noSearchResults")}
            >
              {(filteredServices) => (
                <div className="space-y-1">
                  {filteredServices.map((service) => {
                    const checked = selectedUuids.includes(service.uuid);
                    return (
                      <label
                        key={service.uuid}
                        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleService(service.uuid, value === true)
                          }
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
      </div>
    </div>
  );
}
