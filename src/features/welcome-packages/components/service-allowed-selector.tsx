import { ServicePicker } from "@/components/common/ServicePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { PlatformService } from "../types";
import {
  filterServicesByQuery,
  sortServicesWithSelectedFirst,
} from "../utils/filter-services";

type BaseProps = {
  services: PlatformService[];
  disabled?: boolean;
};

type ChipVariantProps = BaseProps & {
  variant: "chips";
  selectedUuids: string[];
  onChange: (uuids: string[]) => void;
};

type DropdownVariantProps = BaseProps & {
  variant: "dropdown";
  selectedUuids: string[];
  allServicesSelected: boolean;
  onChange: (next: {
    selectedUuids: string[];
    allServicesSelected: boolean;
  }) => void;
};

export type ServiceAllowedSelectorProps =
  | ChipVariantProps
  | DropdownVariantProps;

type ServiceSelectorSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

function ServiceSelectorSearch({
  value,
  onChange,
}: ServiceSelectorSearchProps) {
  const { t } = useTranslation("common");

  return (
    <div className="border-b px-3 py-2">
      <div className="relative">
        <IconSearch className="text-muted-foreground absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("welcomePackages.services.searchPlaceholder")}
          className="h-8 rounded-lg pr-9 text-xs"
        />
      </div>
    </div>
  );
}

type ServiceSelectorPanelProps = {
  open: boolean;
  title: string;
  headerActions?: ReactNode;
  services: PlatformService[];
  selectedUuids?: string[];
  emptyMessage: string;
  children: (filteredServices: PlatformService[]) => ReactNode;
};

function ServiceSelectorPanel({
  open,
  title,
  headerActions,
  services,
  selectedUuids = [],
  emptyMessage,
  children,
}: ServiceSelectorPanelProps) {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    const filtered = filterServicesByQuery(services, searchQuery);
    return sortServicesWithSelectedFirst(filtered, selectedUuids);
  }, [services, searchQuery, selectedUuids]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <>
      <div className="border-b px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground font-bold">{title}</span>
          {headerActions}
        </div>
      </div>
      <ServiceSelectorSearch value={searchQuery} onChange={setSearchQuery} />
      <div className="max-h-60 overflow-y-auto p-1.5">
        {services.length === 0 ? (
          <p className="text-muted-foreground p-3 text-center text-xs">
            {emptyMessage}
          </p>
        ) : filteredServices.length === 0 ? (
          <p className="text-muted-foreground p-3 text-center text-xs">
            {t("welcomePackages.services.noSearchResults")}
          </p>
        ) : (
          children(filteredServices)
        )}
      </div>
    </>
  );
}

function ServiceAllowedSelectorChips({
  services,
  selectedUuids,
  onChange,
  disabled = false,
}: ChipVariantProps) {
  const { t } = useTranslation("common");

  const selectedServices = useMemo(
    () =>
      selectedUuids
        .map((uuid) => services.find((service) => service.uuid === uuid))
        .filter((service): service is PlatformService => Boolean(service)),
    [selectedUuids, services]
  );

  const addService = (uuid: string) => {
    if (!selectedUuids.includes(uuid)) {
      onChange([...selectedUuids, uuid]);
    }
  };

  const removeService = (uuid: string) => {
    onChange(selectedUuids.filter((item) => item !== uuid));
  };

  const selectAll = () => {
    onChange(services.map((service) => service.uuid));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
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

      <div className="flex items-center gap-2">
        <ServicePicker
          services={services}
          onSelect={addService}
          placeholder={t("welcomePackages.services.addService")}
          title={t("welcomePackages.services.availableServices")}
          searchPlaceholder={t("welcomePackages.services.searchPlaceholder")}
          emptyMessage={t("welcomePackages.services.allSelected")}
          noSearchResultsMessage={t("welcomePackages.services.noSearchResults")}
          disabled={disabled}
          renderTrigger={({ disabled: isDisabled }) => (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isDisabled}
              className="h-8 rounded-xl text-xs font-bold"
            >
              <IconPlus className="size-3.5" />
              {t("welcomePackages.services.addService")}
            </Button>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-xl text-[11px] font-bold"
          onClick={selectAll}
          disabled={disabled}
        >
          {t("welcomePackages.services.selectAll")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive h-8 rounded-xl text-[11px] font-bold"
          onClick={clearAll}
          disabled={disabled}
        >
          {t("welcomePackages.services.clearAll")}
        </Button>
      </div>
    </div>
  );
}

function ServiceAllowedSelectorDropdown({
  services,
  selectedUuids,
  allServicesSelected,
  onChange,
  disabled = false,
}: DropdownVariantProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (allServicesSelected) {
      return t("welcomePackages.services.allServicesCount", {
        count: services.length,
      });
    }

    if (selectedUuids.length === 0) {
      return t("welcomePackages.services.noneSelected");
    }

    if (selectedUuids.length === 1) {
      const service = services.find((item) => item.uuid === selectedUuids[0]);
      return service?.name ?? t("welcomePackages.services.oneSelected");
    }

    return t("welcomePackages.services.selectedCount", {
      count: selectedUuids.length,
    });
  }, [allServicesSelected, selectedUuids, services, t]);

  const toggleAll = (checked: boolean) => {
    onChange({
      allServicesSelected: checked,
      selectedUuids: checked ? [] : selectedUuids,
    });
  };

  const toggleService = (uuid: string, checked: boolean) => {
    if (checked) {
      const nextSelected = [...selectedUuids, uuid];
      const isAllSelected = nextSelected.length === services.length;
      onChange({
        allServicesSelected: isAllSelected,
        selectedUuids: isAllSelected ? [] : nextSelected,
      });
      return;
    }

    onChange({
      allServicesSelected: false,
      selectedUuids: selectedUuids.filter((item) => item !== uuid),
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between rounded-lg px-2.5 text-xs font-bold",
            disabled && "opacity-60"
          )}
        >
          <span className="truncate">{label}</span>
          <IconChevronDown className="size-3.5 shrink-0 opacity-60" />
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
              <label className="bg-muted/50 hover:bg-accent flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs font-bold">
                <Checkbox
                  checked={allServicesSelected}
                  onCheckedChange={(value) => toggleAll(value === true)}
                />
                <span>
                  {t("welcomePackages.services.allServicesCount", {
                    count: services.length,
                  })}
                </span>
              </label>
              {filteredServices.map((service) => {
                const checked =
                  allServicesSelected || selectedUuids.includes(service.uuid);

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
  );
}

export function ServiceAllowedSelector(props: ServiceAllowedSelectorProps) {
  if (props.variant === "chips") {
    return <ServiceAllowedSelectorChips {...props} />;
  }

  return <ServiceAllowedSelectorDropdown {...props} />;
}
