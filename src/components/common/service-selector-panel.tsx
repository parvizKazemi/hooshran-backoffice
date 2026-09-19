import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  filterServicesByQuery,
  sortServicesWithSelectedFirst,
  type SelectableService,
} from "@/utils/service-selector.helpers";

export type ServiceSelectorSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ServiceSelectorSearch({
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

export type ServiceSelectorPanelProps<T extends SelectableService> = {
  open: boolean;
  title: string;
  headerActions?: ReactNode;
  services: T[];
  selectedUuids?: string[];
  emptyMessage: string;
  children: (filteredServices: T[]) => ReactNode;
};

export function ServiceSelectorPanel<T extends SelectableService>({
  open,
  title,
  headerActions,
  services,
  selectedUuids = [],
  emptyMessage,
  children,
}: ServiceSelectorPanelProps<T>) {
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
      <div
        className="max-h-60 overflow-y-auto overscroll-contain p-1.5"
        onWheel={(event) => {
          event.currentTarget.scrollTop += event.deltaY;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
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
