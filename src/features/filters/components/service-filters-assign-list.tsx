import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type ServiceFiltersAssignListProps = {
  filters: string[];
  value: string[];
  onChange: (next: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  idPrefix?: string;
};

export function ServiceFiltersAssignList({
  filters,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  idPrefix = "service-filter",
}: ServiceFiltersAssignListProps) {
  const { t } = useTranslation("common");
  const selected = new Set(value);
  const displayFilters = useMemo(() => {
    const extras = value.filter((item) => !filters.includes(item));
    return [...filters, ...extras];
  }, [filters, value]);

  const toggle = (filter: string, checked: boolean) => {
    if (checked) {
      if (selected.has(filter)) return;
      onChange([...value, filter]);
      return;
    }
    onChange(value.filter((item) => item !== filter));
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
        <IconLoader2 className="size-4 animate-spin" />
        {t("serviceFilters.loading")}
      </div>
    );
  }

  if (displayFilters.length === 0) {
    return (
      <div className="text-muted-foreground rounded-2xl border border-dashed py-8 text-center text-xs">
        {t("serviceFilters.assignEmpty")}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayFilters.map((filter) => {
        const checked = selected.has(filter);
        const id = `${idPrefix}-${filter}`;

        return (
          <label
            key={filter}
            htmlFor={id}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition",
              checked
                ? "border-primary/30 bg-primary/10"
                : "bg-background hover:border-foreground/20",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <Checkbox
              id={id}
              dir="ltr"
              checked={checked}
              disabled={disabled}
              onCheckedChange={(next) => toggle(filter, next === true)}
            />
            <span className="font-mono text-xs font-bold" dir="ltr">
              {filter}
            </span>
          </label>
        );
      })}
    </div>
  );
}
