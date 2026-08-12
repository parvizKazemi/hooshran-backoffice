"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PROMPT_DISPLAY_KIND, PROMPT_DISPLAY_KIND_FILTER } from "../constants";
import { useBulkAssignCategoriesToServices } from "../hooks/use-prompt-assistant";
import type {
  PlatformServiceOption,
  PromptCategory,
  PromptDisplayKindFilter,
} from "../types";
import {
  filterActiveCategories,
  filterCategoriesByDisplayKind,
  getCategoryDisplayKind,
} from "../utils/prompt-assistant.helpers";

type BulkAssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: PlatformServiceOption[];
  categories: PromptCategory[];
};

export function BulkAssignDialog({
  open,
  onOpenChange,
  services,
  categories,
}: BulkAssignDialogProps) {
  const { t } = useTranslation("common");
  const bulkMutation = useBulkAssignCategoriesToServices();
  const [serviceSearch, setServiceSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [displayKindFilter, setDisplayKindFilter] =
    useState<PromptDisplayKindFilter>(PROMPT_DISPLAY_KIND_FILTER.ALL);
  const [selectedServiceUuids, setSelectedServiceUuids] = useState<string[]>(
    []
  );
  const [selectedCategoryUuids, setSelectedCategoryUuids] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (!open) return;
    setServiceSearch("");
    setCategorySearch("");
    setDisplayKindFilter(PROMPT_DISPLAY_KIND_FILTER.ALL);
    setSelectedServiceUuids([]);
    setSelectedCategoryUuids([]);
  }, [open]);

  const filteredServices = useMemo(() => {
    const query = serviceSearch.trim().toLowerCase();
    if (!query) return services;
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.slug.toLowerCase().includes(query)
    );
  }, [services, serviceSearch]);

  const activeCategories = useMemo(
    () => filterActiveCategories(categories),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const byKind = filterCategoriesByDisplayKind(
      activeCategories,
      displayKindFilter
    );
    const query = categorySearch.trim().toLowerCase();
    if (!query) return byKind;
    return byKind.filter(
      (category) =>
        category.title.toLowerCase().includes(query) ||
        (category.systemKey ?? "").toLowerCase().includes(query)
    );
  }, [activeCategories, displayKindFilter, categorySearch]);

  const toggleService = (uuid: string) => {
    setSelectedServiceUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const toggleCategory = (uuid: string) => {
    setSelectedCategoryUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const canSubmit =
    selectedServiceUuids.length > 0 && selectedCategoryUuids.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await bulkMutation.mutateAsync({
      serviceUuids: selectedServiceUuids,
      categoryUuids: selectedCategoryUuids,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{t("promptAssistant.bulkAssign.title")}</DialogTitle>
          <DialogDescription>
            {t("promptAssistant.bulkAssign.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-2">
          <section className="flex min-h-0 flex-col border-b md:border-e md:border-b-0">
            <div className="space-y-2 border-b p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold">
                  {t("promptAssistant.bulkAssign.services")}
                </h4>
                <span className="text-muted-foreground text-[11px]">
                  {t("promptAssistant.bulkAssign.selectedCount", {
                    count: selectedServiceUuids.length,
                  })}
                </span>
              </div>
              <div className="relative">
                <IconSearch className="text-muted-foreground absolute top-2.5 right-3 size-4" />
                <Input
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  placeholder={t("promptAssistant.services.searchPlaceholder")}
                  className="pr-9"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
              {filteredServices.map((service) => {
                const checked = selectedServiceUuids.includes(service.uuid);
                return (
                  <label
                    key={service.uuid}
                    className={cn(
                      "hover:bg-muted/40 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5",
                      checked && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleService(service.uuid)}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {service.name}
                      </p>
                      <p
                        className="text-muted-foreground truncate font-mono text-[10px]"
                        dir="ltr"
                      >
                        {service.slug || service.uuid}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-0 flex-col">
            <div className="space-y-2 border-b p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold">
                  {t("promptAssistant.bulkAssign.categories")}
                </h4>
                <span className="text-muted-foreground text-[11px]">
                  {t("promptAssistant.bulkAssign.selectedCount", {
                    count: selectedCategoryUuids.length,
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Select
                  value={displayKindFilter}
                  onValueChange={(value) =>
                    setDisplayKindFilter(value as PromptDisplayKindFilter)
                  }
                >
                  <SelectTrigger className="w-36 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PROMPT_DISPLAY_KIND_FILTER.ALL}>
                      {t("promptAssistant.displayKind.all")}
                    </SelectItem>
                    <SelectItem value={PROMPT_DISPLAY_KIND_FILTER.STYLE}>
                      {t("promptAssistant.displayKind.style")}
                    </SelectItem>
                    <SelectItem value={PROMPT_DISPLAY_KIND_FILTER.PROMPT}>
                      {t("promptAssistant.displayKind.prompt")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative min-w-0 flex-1">
                  <IconSearch className="text-muted-foreground absolute top-2.5 right-3 size-4" />
                  <Input
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder={t(
                      "promptAssistant.categories.searchPlaceholder"
                    )}
                    className="pr-9"
                  />
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
              {filteredCategories.map((category) => {
                const checked = selectedCategoryUuids.includes(category.uuid);
                const isStyle =
                  getCategoryDisplayKind(category.tags) ===
                  PROMPT_DISPLAY_KIND.STYLE;
                return (
                  <label
                    key={category.uuid}
                    className={cn(
                      "hover:bg-muted/40 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5",
                      checked && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleCategory(category.uuid)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {category.title}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                            isStyle
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "border-primary/20 bg-primary/10 text-primary"
                          )}
                        >
                          {isStyle
                            ? t("promptAssistant.displayKind.style")
                            : t("promptAssistant.displayKind.prompt")}
                        </span>
                      </div>
                      <p
                        className="text-muted-foreground truncate font-mono text-[10px]"
                        dir="ltr"
                      >
                        {category.systemKey || "—"}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={bulkMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("promptAssistant.actions.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || bulkMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {bulkMutation.isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : null}
            {t("promptAssistant.bulkAssign.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
