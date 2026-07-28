import { memo, useEffect, useState } from "react";
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
    <div className="bg-card rounded-3xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <IconFilter className="text-primary size-4" />
        <h2 className="text-sm font-black">{t("monitoring.filters.title")}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={draft.search}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, search: event.target.value }))
          }
          placeholder={t("monitoring.filters.searchPlaceholder")}
          onKeyDown={(event) => {
            if (event.key === "Enter") apply();
          }}
        />

        <Select
          value={draft.type}
          onValueChange={(value) =>
            setDraft((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
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

        <Select
          value={draft.severity}
          onValueChange={(value) =>
            setDraft((prev) => ({ ...prev, severity: value }))
          }
        >
          <SelectTrigger>
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

        <Select
          value={draft.source}
          onValueChange={(value) =>
            setDraft((prev) => ({ ...prev, source: value }))
          }
        >
          <SelectTrigger>
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

        <PersianDateInput
          value={draft.dateFrom}
          onChange={(value) =>
            setDraft((prev) => ({ ...prev, dateFrom: value || "" }))
          }
          placeholder={t("monitoring.filters.dateFrom")}
        />

        <PersianDateInput
          value={draft.dateTo}
          onChange={(value) =>
            setDraft((prev) => ({ ...prev, dateTo: value || "" }))
          }
          placeholder={t("monitoring.filters.dateTo")}
        />

        <Select
          value={String(draft.take)}
          onValueChange={(value) =>
            setDraft((prev) => ({ ...prev, take: Number(value) }))
          }
        >
          <SelectTrigger>
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

        <div className="flex gap-2">
          <Button className="flex-1" onClick={apply}>
            {t("monitoring.filters.apply")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            aria-label={t("monitoring.filters.reset")}
          >
            <IconX className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
