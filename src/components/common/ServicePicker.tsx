import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

export type ServicePickerItem = {
  uuid: string;
  name: string;
  slug: string;
};

type ServicePickerProps = {
  services: ServicePickerItem[];
  selectedUuid?: string;
  onSelect: (uuid: string) => void;
  placeholder: string;
  title: string;
  searchPlaceholder: string;
  emptyMessage: string;
  noSearchResultsMessage: string;
  disabled?: boolean;
  className?: string;
  renderTrigger?: (args: {
    selectedLabel: string;
    isOpen: boolean;
    disabled: boolean;
  }) => ReactNode;
};

const filterServices = (services: ServicePickerItem[], query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return services;
  }

  return services.filter(
    (service) =>
      service.name.toLowerCase().includes(normalized) ||
      service.slug.toLowerCase().includes(normalized)
  );
};

export function ServicePicker({
  services,
  selectedUuid,
  onSelect,
  placeholder,
  title,
  searchPlaceholder,
  emptyMessage,
  noSearchResultsMessage,
  disabled = false,
  className,
  renderTrigger,
}: ServicePickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLabel = useMemo(
    () =>
      services.find((service) => service.uuid === selectedUuid)?.name ??
      placeholder,
    [placeholder, selectedUuid, services]
  );

  const filteredServices = useMemo(
    () => filterServices(services, searchQuery),
    [services, searchQuery]
  );

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger ? (
          renderTrigger({ selectedLabel, isOpen: open, disabled })
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between rounded-lg px-2.5 text-xs font-bold",
              className
            )}
          >
            <span className="truncate">{selectedLabel}</span>
            <IconChevronDown className="size-3.5 shrink-0 opacity-60" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <div className="border-b px-3 py-2">
          <span className="text-muted-foreground text-xs font-bold">
            {title}
          </span>
        </div>
        <div className="border-b px-3 py-2">
          <div className="relative">
            <IconSearch className="text-muted-foreground absolute top-1/2 right-3 size-3.5 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 rounded-lg pr-9 text-xs"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1.5">
          {services.length === 0 ? (
            <p className="text-muted-foreground p-3 text-center text-xs">
              {emptyMessage}
            </p>
          ) : filteredServices.length === 0 ? (
            <p className="text-muted-foreground p-3 text-center text-xs">
              {noSearchResultsMessage}
            </p>
          ) : (
            filteredServices.map((service) => {
              const isSelected = service.uuid === selectedUuid;
              return (
                <button
                  key={service.uuid}
                  type="button"
                  onClick={() => {
                    onSelect(service.uuid);
                    setOpen(false);
                  }}
                  className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-xs font-medium transition-colors"
                >
                  <span className="truncate">{service.name}</span>
                  {isSelected && (
                    <IconCheck className="text-primary size-3.5 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
