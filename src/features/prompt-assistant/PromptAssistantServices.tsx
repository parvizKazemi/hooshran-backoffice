import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import {
  IconAlertCircle,
  IconFilter,
  IconLink,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiltersManagerDialog } from "@/features/filters";
import { BulkAssignDialog } from "./components/bulk-assign-dialog";
import { ServiceAssignDialog } from "./components/service-assign-dialog";
import { ServiceAssignmentsTable } from "./components/service-assignments-table";
import {
  usePlatformServices,
  usePromptCategories,
  useServiceAssignments,
} from "./hooks/use-prompt-assistant";
import type {
  PlatformServiceOption,
  PromptCategory,
  ServiceAssignmentRow,
  ServicePromptAssignment,
} from "./types";
import { filterActiveCategories } from "./utils/prompt-assistant.helpers";

const EMPTY_SERVICES: PlatformServiceOption[] = [];
const EMPTY_ASSIGNMENTS: ServicePromptAssignment[] = [];
const EMPTY_CATEGORIES: PromptCategory[] = [];

export default function PromptAssistantServices() {
  const { t } = useTranslation("common");
  const {
    data: services = EMPTY_SERVICES,
    isLoading: isServicesLoading,
    isError: isServicesError,
    refetch: refetchServices,
    isFetching: isServicesFetching,
  } = usePlatformServices();
  const {
    data: assignments = EMPTY_ASSIGNMENTS,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
    refetch: refetchAssignments,
    isFetching: isAssignmentsFetching,
  } = useServiceAssignments();
  const { data: categories = EMPTY_CATEGORIES } = usePromptCategories();

  const assignableCategories = useMemo(
    () => filterActiveCategories(categories),
    [categories]
  );

  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<ServiceAssignmentRow | null>(
    null
  );
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const rows = useMemo<ServiceAssignmentRow[]>(() => {
    const grouped = new Map<
      string,
      ServiceAssignmentRow["assignedCategories"]
    >();

    for (const assignment of assignments) {
      if (!assignment.serviceUuid || !assignment.categoryUuid) continue;
      const current = grouped.get(assignment.serviceUuid) ?? [];
      current.push({
        categoryUuid: assignment.categoryUuid,
        categoryTitle: assignment.categoryTitle,
        priority: assignment.priority,
      });
      grouped.set(assignment.serviceUuid, current);
    }

    return services
      .map((service) => {
        const assigned = (grouped.get(service.uuid) ?? []).sort(
          (a, b) => a.priority - b.priority
        );
        return { service, assignedCategories: assigned };
      })
      .filter((row) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
          row.service.name.toLowerCase().includes(query) ||
          row.service.slug.toLowerCase().includes(query)
        );
      });
  }, [services, assignments, search]);

  const isLoading = isServicesLoading || isAssignmentsLoading;
  const isError = isServicesError || isAssignmentsError;
  const isFetching = isServicesFetching || isAssignmentsFetching;

  return (
    <div className="mx-auto flex w-[96%] flex-col gap-4">
      <SettingsPageHeader
        title={t("promptAssistant.services.pageTitle")}
        description={t("promptAssistant.services.pageDescription")}
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative w-full sm:w-64">
          <IconSearch className="text-muted-foreground absolute top-2.5 right-3 size-4" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("promptAssistant.services.searchPlaceholder")}
            className="pr-9"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsFiltersOpen(true)}
        >
          <IconFilter className="size-4" />
          {t("promptAssistant.actions.manageFilters")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsBulkOpen(true)}
        >
          <IconLink className="size-4" />
          {t("promptAssistant.actions.bulkAssign")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFetching}
          onClick={() => {
            void refetchServices();
            void refetchAssignments();
          }}
        >
          <IconRefresh className="size-4" />
          {t("promptAssistant.actions.refresh")}
        </Button>
      </div>

      {isError ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
          <IconAlertCircle className="size-4" />
          {t("promptAssistant.errors.loadFailed")}
        </div>
      ) : null}

      <ServiceAssignmentsTable
        items={rows}
        isLoading={isLoading}
        onConfigure={setSelectedRow}
      />

      <ServiceAssignDialog
        open={Boolean(selectedRow)}
        onOpenChange={(open) => {
          if (!open) setSelectedRow(null);
        }}
        row={selectedRow}
        categories={assignableCategories}
      />

      <FiltersManagerDialog
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
      />

      <BulkAssignDialog
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        services={services}
        categories={assignableCategories}
      />
    </div>
  );
}
