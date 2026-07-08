import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Package } from "@/features/packages/types";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_DISCOUNT_PERCENTAGE } from "../constants";
import type { PackageSelectionState } from "../types";
import {
  extractPackageDisplayName,
  groupPackagesForDiscount,
} from "../utils/group-packages";

type TargetPackagesSelectorProps = {
  packages: Package[];
  isLoading?: boolean;
  selection: PackageSelectionState;
  onSelectionChange: (next: PackageSelectionState) => void;
  defaultDiscount?: number;
};

export function TargetPackagesSelector({
  packages,
  isLoading = false,
  selection,
  onSelectionChange,
  defaultDiscount = DEFAULT_DISCOUNT_PERCENTAGE,
}: TargetPackagesSelectorProps) {
  const { t } = useTranslation("common");
  const [bulkDiscount, setBulkDiscount] = useState(defaultDiscount);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const groups = useMemo(() => groupPackagesForDiscount(packages), [packages]);

  useEffect(() => {
    setExpandedGroups(new Set(groups.map((group) => group.key)));
  }, [groups]);

  const selectedCount = useMemo(
    () => Object.values(selection).filter((item) => item.selected).length,
    [selection]
  );

  const updatePackage = (
    packageUuid: string,
    patch: Partial<{ selected: boolean; discountPercentage: number }>
  ) => {
    const current = selection[packageUuid] ?? {
      selected: false,
      discountPercentage: bulkDiscount,
    };

    onSelectionChange({
      ...selection,
      [packageUuid]: {
        ...current,
        ...patch,
      },
    });
  };

  const toggleGroupExpanded = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const getGroupSelectionState = (groupPackages: Package[]) => {
    const selectedInGroup = groupPackages.filter(
      (pkg) => selection[pkg.uuid]?.selected
    ).length;

    if (selectedInGroup === 0) {
      return false;
    }

    if (selectedInGroup === groupPackages.length) {
      return true;
    }

    return "indeterminate" as const;
  };

  const toggleGroupSelection = (groupPackages: Package[], checked: boolean) => {
    const next = { ...selection };

    for (const pkg of groupPackages) {
      next[pkg.uuid] = {
        selected: checked,
        discountPercentage: next[pkg.uuid]?.discountPercentage ?? bulkDiscount,
      };
    }

    onSelectionChange(next);
  };

  const applyBulkDiscountToSelected = () => {
    const next = { ...selection };

    for (const [packageUuid, value] of Object.entries(next)) {
      if (value.selected) {
        next[packageUuid] = {
          ...value,
          discountPercentage: bulkDiscount,
        };
      }
    }

    onSelectionChange(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("discountCodes.form.packages.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-sm font-semibold">
            {t("discountCodes.form.packages.title")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-muted-foreground mt-1 text-xs">
            {t("discountCodes.form.packages.hint")}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {t("discountCodes.form.packages.selectedCount", {
            count: selectedCount,
          })}
        </Badge>
      </div>

      <div className="bg-muted/40 flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="bulk-discount" className="text-xs">
            {t("discountCodes.form.packages.defaultDiscount")}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="bulk-discount"
              type="number"
              min={1}
              max={100}
              value={bulkDiscount}
              onChange={(event) => {
                const value = Number(event.target.value);
                setBulkDiscount(
                  Number.isFinite(value)
                    ? Math.min(100, Math.max(1, value))
                    : defaultDiscount
                );
              }}
              className="h-9 w-24 text-center"
            />
            <span className="text-muted-foreground text-sm font-bold">%</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          onClick={applyBulkDiscountToSelected}
        >
          {t("discountCodes.form.packages.applyToSelected")}
        </Button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pe-1">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.key);
          const groupSelectionState = getGroupSelectionState(group.packages);

          return (
            <div
              key={group.key}
              className="bg-muted/20 overflow-hidden rounded-xl border"
            >
              <div className="flex items-center gap-2 p-3">
                <Checkbox
                  checked={
                    groupSelectionState === "indeterminate"
                      ? "indeterminate"
                      : groupSelectionState
                  }
                  onCheckedChange={(checked) =>
                    toggleGroupSelection(group.packages, checked === true)
                  }
                  aria-label={t(group.titleKey, group.titleParams)}
                />
                <button
                  type="button"
                  onClick={() => toggleGroupExpanded(group.key)}
                  className="hover:bg-muted/60 flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-2 py-1 text-right transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <IconSparkles className="text-primary size-4 shrink-0" />
                    <p className="truncate text-sm font-bold">
                      {t(group.titleKey, group.titleParams)}
                    </p>
                    <Badge variant="outline" className="shrink-0">
                      {group.packages.length.toLocaleString("fa-IR")}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <IconChevronUp className="text-muted-foreground size-4 shrink-0" />
                  ) : (
                    <IconChevronDown className="text-muted-foreground size-4 shrink-0" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-2 border-t px-3 pt-2 pb-3">
                  {group.packages.map((pkg) => {
                    const state = selection[pkg.uuid] ?? {
                      selected: false,
                      discountPercentage: bulkDiscount,
                    };

                    return (
                      <div
                        key={pkg.uuid}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          updatePackage(pkg.uuid, {
                            selected: !state.selected,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            updatePackage(pkg.uuid, {
                              selected: !state.selected,
                            });
                          }
                        }}
                        className={cn(
                          "bg-background flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
                          state.selected && "border-primary/40 bg-primary/5"
                        )}
                      >
                        <div
                          className="flex min-w-0 flex-1 items-start gap-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            checked={state.selected}
                            onCheckedChange={(checked) =>
                              updatePackage(pkg.uuid, {
                                selected: checked === true,
                              })
                            }
                            className="mt-0.5"
                          />
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-semibold">
                              {extractPackageDisplayName(pkg.name)}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {pkg.type === "PERMANENT"
                                ? t("discountCodes.form.packages.permanent")
                                : t(
                                    "discountCodes.form.packages.durationDays",
                                    {
                                      days: pkg.durationDays ?? 0,
                                    }
                                  )}
                              {" · "}
                              {pkg.price.toLocaleString("fa-IR")}{" "}
                              {t("discountCodes.form.packages.currency")}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2 sm:w-36"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            disabled={!state.selected}
                            value={state.discountPercentage}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              updatePackage(pkg.uuid, {
                                discountPercentage: Number.isFinite(value)
                                  ? Math.min(100, Math.max(1, value))
                                  : bulkDiscount,
                              });
                            }}
                            className="h-9 text-center"
                          />
                          <span className="text-muted-foreground text-sm font-bold">
                            %
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
