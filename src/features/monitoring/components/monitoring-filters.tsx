import { memo, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconFilter, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MONITORING_DEFAULT_TAKE,
  MONITORING_PAGE_SIZES,
  MONITORING_SEVERITY_OPTIONS,
  MONITORING_SOURCE_OPTIONS,
  MONITORING_TYPE_OPTIONS,
} from "../constants";
import type { MonitoringErrorsQueryParams } from "../types";
import { toDayEndIso, toDayStartIso } from "../utils/monitoring.helpers";

type MonitoringFiltersProps = {
  filters: MonitoringErrorsQueryParams;
  onChange: (filters: MonitoringErrorsQueryParams) => void;
};

type DraftState = {
  search: string;
  type: string;
  severity: string;
  source: string;
  dateFrom: string;
  dateTo: string;
  take: number;
};

function toDraft(filters: MonitoringErrorsQueryParams): DraftState {
  return {
    search: filters.search || "",
    type: filters.type || "all",
    severity: filters.severity || "all",
    source: filters.source || "all",
    dateFrom: filters.dateFrom?.slice(0, 10) || "",
    dateTo: filters.dateTo?.slice(0, 10) || "",
    take: filters.take || MONITORING_DEFAULT_TAKE,
  };
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="text-muted-foreground text-[11px] leading-none font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export const MonitoringFilters = memo(function MonitoringFilters({
  filters,
  onChange,
}: MonitoringFiltersProps) {
  const { t } = useTranslation("common");
  const [draft, setDraft] = useState<DraftState>(() => toDraft(filters));

  useEffect(() => {
    setDraft(toDraft(filters));
  }, [filters]);

  const apply = () => {
    onChange({
      ...filters,
      page: 1,
      take: draft.take,
      search: draft.search.trim() || undefined,
      type:
        draft.type === "all"
          ? "all"
          : (draft.type as MonitoringErrorsQueryParams["type"]),
      severity:
        draft.severity === "all"
          ? "all"
          : (draft.severity as MonitoringErrorsQueryParams["severity"]),
      source:
        draft.source === "all"
          ? "all"
          : (draft.source as MonitoringErrorsQueryParams["source"]),
      dateFrom: draft.dateFrom ? toDayStartIso(draft.dateFrom) : undefined,
      dateTo: draft.dateTo ? toDayEndIso(draft.dateTo) : undefined,
    });
  };

  const reset = () => {
    const next: MonitoringErrorsQueryParams = {
      page: 1,
      take: MONITORING_DEFAULT_TAKE,
      order: "DESC",
    };
    setDraft(toDraft(next));
    onChange(next);
  };

  return (
    <div className="bg-card rounded-2xl border px-3 py-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <IconFilter className="text-primary size-3.5" />
        <h2 className="text-xs font-bold">{t("monitoring.filters.title")}</h2>
      </div>

      <div className="grid grid-cols-2 items-end gap-x-2 gap-y-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        <FilterField label={t("monitoring.filters.search")}>
          <Input
            value={draft.search}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, search: event.target.value }))
            }
            placeholder={t("monitoring.filters.searchPlaceholder")}
            className="h-8 text-xs"
            onKeyDown={(event) => {
              if (event.key === "Enter") apply();
            }}
          />
        </FilterField>

        <FilterField label={t("monitoring.filters.type")}>
          <Select
            value={draft.type}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder={t("monitoring.filters.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("monitoring.filters.all")}</SelectItem>
              {MONITORING_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`monitoring.type.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("monitoring.filters.severity")}>
          <Select
            value={draft.severity}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, severity: value }))
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder={t("monitoring.filters.severity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("monitoring.filters.all")}</SelectItem>
              {MONITORING_SEVERITY_OPTIONS.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {t(`monitoring.severity.${severity}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("monitoring.filters.source")}>
          <Select
            value={draft.source}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, source: value }))
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder={t("monitoring.filters.source")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("monitoring.filters.all")}</SelectItem>
              {MONITORING_SOURCE_OPTIONS.map((source) => (
                <SelectItem key={source} value={source}>
                  {t(`monitoring.source.${source}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label={t("monitoring.filters.dateFrom")}>
          <PersianDateInput
            value={draft.dateFrom}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, dateFrom: value || "" }))
            }
            placeholder={t("monitoring.filters.dateFrom")}
            className="h-8 text-xs"
          />
        </FilterField>

        <FilterField label={t("monitoring.filters.dateTo")}>
          <PersianDateInput
            value={draft.dateTo}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, dateTo: value || "" }))
            }
            placeholder={t("monitoring.filters.dateTo")}
            className="h-8 text-xs"
          />
        </FilterField>

        <FilterField label={t("monitoring.filters.pageSize")}>
          <Select
            value={String(draft.take)}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, take: Number(value) }))
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder={t("monitoring.filters.pageSize")} />
            </SelectTrigger>
            <SelectContent>
              {MONITORING_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size.toLocaleString("fa-IR")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <div className="flex items-end gap-1.5">
          <Button size="sm" className="h-8 flex-1 text-xs" onClick={apply}>
            {t("monitoring.filters.apply")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            onClick={reset}
            aria-label={t("monitoring.filters.reset")}
          >
            <IconX className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});
