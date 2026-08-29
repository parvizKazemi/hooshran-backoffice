import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryOptions } from "@/features/categories/hooks/use-category-options";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconBuildingCarousel,
  IconDeviceFloppy,
  IconLayersSubtract,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ServiceDeleteDialog } from "./components/service-delete-dialog";
import { ServiceFormDialog } from "./components/service-form-dialog";
import { ServicesTable } from "./components/services-table";
import { updateManageServiceCustomData } from "./api/service";
import { MANAGE_SERVICES_QUERY_KEY } from "./constants";
import {
  useManageServiceDetail,
  useManageServices,
  useReindexManageServicesSearch,
  useSaveManageServices,
  useUpsertServiceCustomData,
} from "./hooks/use-manage-services";
import type {
  ManageService,
  ServiceDeleteMode,
  ServiceFormSubmitValues,
  ServiceSubmodel,
} from "./types";
import {
  applyCategoryServiceOrders,
  applyServiceOrders,
  areServicesEqual,
  buildCategoryOrdersPayload,
  cloneServices,
  createLocalService,
  getCreditDisplay,
  getCategoryOrder,
  removeServiceFromCategory,
  sortServicesByCategoryOrder,
} from "./utils/service.helpers";

type ServiceListFilter =
  | "all"
  | "most_used"
  | "popular"
  | "newest"
  | "multi"
  | "single"
  | "active"
  | "inactive";

function normalizeSubmodelOrder(items: ServiceSubmodel[]): ServiceSubmodel[] {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

function normalizeCostValue(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? String(value) : undefined;
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^0+(?:\.0+)?$/.test(trimmed)) return undefined;
  return trimmed;
}

function resolveSubmodelCost(service: ManageService): string | undefined {
  const fromHint = normalizeCostValue(service.creditHint);
  if (fromHint) return fromHint;
  const fromCalculatedCost = getCreditDisplay(service.cost);
  return fromCalculatedCost !== "-" ? fromCalculatedCost : undefined;
}

function toSubmodelFromService(
  service: ManageService,
  order: number,
  current?: ServiceSubmodel
): ServiceSubmodel {
  return {
    ...current,
    uuid: service.uuid,
    name: service.name,
    description: service.description,
    slug: service.slug,
    endpoint: service.endpoint,
    imageUrl: current?.imageUrl ?? service.imageUrl,
    creditHint: service.creditHint,
    cost: resolveSubmodelCost(service),
    badge: current?.badge ?? service.badge,
    isActive: service.isActive,
    inactiveReason: current?.inactiveReason ?? service.inactiveReason,
    order,
    isLocal: false,
  };
}

function hasParentChildDataChanges(
  previous: ManageService,
  next: ManageService
): boolean {
  const toComparable = (service: ManageService) => ({
    name: service.name.trim(),
    description: service.description.trim(),
    slug: service.slug.trim(),
    endpoint: service.endpoint?.trim() ?? "",
    cost: resolveSubmodelCost(service) ?? "",
    active: service.isActive,
  });

  return (
    JSON.stringify(toComparable(previous)) !==
    JSON.stringify(toComparable(next))
  );
}

function applyChildToParentMembership(
  collection: ManageService[],
  childService: ManageService,
  previousParentUuid: string | null,
  nextParentUuid: string | null
): ManageService[] {
  return collection.map((item) => {
    if (item.modelType !== "multi") return item;

    let nextSubmodels = item.submodels;
    let changed = false;

    if (
      previousParentUuid &&
      previousParentUuid !== nextParentUuid &&
      item.uuid === previousParentUuid
    ) {
      const filtered = nextSubmodels.filter(
        (submodel) => submodel.uuid !== childService.uuid
      );
      if (filtered.length !== nextSubmodels.length) {
        nextSubmodels = normalizeSubmodelOrder(filtered);
        changed = true;
      }
    }

    if (nextParentUuid && item.uuid === nextParentUuid) {
      const index = nextSubmodels.findIndex(
        (submodel) => submodel.uuid === childService.uuid
      );
      const nextSubmodel = toSubmodelFromService(
        childService,
        index >= 0
          ? (nextSubmodels[index]?.order ?? index + 1)
          : nextSubmodels.length + 1,
        index >= 0 ? nextSubmodels[index] : undefined
      );

      if (index >= 0) {
        nextSubmodels = nextSubmodels.flatMap((submodel, submodelIndex) => {
          if (submodel.uuid !== childService.uuid) return [submodel];
          return submodelIndex === index ? [nextSubmodel] : [];
        });
      } else {
        nextSubmodels = [...nextSubmodels, nextSubmodel];
      }

      nextSubmodels = normalizeSubmodelOrder(nextSubmodels);
      changed = true;
    }

    if (!changed) return item;

    return {
      ...item,
      submodels: nextSubmodels,
    };
  });
}

export default function ManageServices() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { options: categoryOptions, isLoading: isCategoriesLoading } =
    useCategoryOptions();

  const [items, setItems] = useState<ManageService[]>([]);
  const [baseline, setBaseline] = useState<ManageService[]>([]);
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState<ServiceListFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ManageService | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deletingService, setDeletingService] = useState<ManageService | null>(
    null
  );

  useEffect(() => {
    const param = searchParams.get("category");
    setCategoryFilter(param || "all");
  }, [searchParams]);

  const selectedCategory = useMemo(
    () =>
      categoryFilter === "all"
        ? null
        : (categoryOptions.find((item) => item.uuid === categoryFilter) ??
          null),
    [categoryOptions, categoryFilter]
  );

  /** Backend `?category=` expects name | url/slug | uuid — we send slug. */
  const categoryParam =
    categoryFilter === "all" ? null : (selectedCategory?.slug ?? null);

  const { data, isLoading, isFetching } = useManageServices({
    category: categoryParam,
    enabled: categoryFilter === "all" || Boolean(categoryParam),
  });

  /** Full catalog for parent/submodel pickers — only when form is open under a category filter. */
  const { data: fullCatalog = [] } = useManageServices({
    category: null,
    enabled: isFormOpen && categoryFilter !== "all",
  });

  const saveServices = useSaveManageServices();
  const loadServiceDetail = useManageServiceDetail();
  const reindexSearch = useReindexManageServicesSearch();
  const upsertCustomData = useUpsertServiceCustomData(categoryParam);

  useEffect(() => {
    setItems([]);
    setBaseline([]);
  }, [categoryParam, categoryFilter]);

  useEffect(() => {
    if (!data) return;
    const cloned = cloneServices(data);
    const next =
      categoryFilter !== "all"
        ? sortServicesByCategoryOrder(cloned, categoryFilter).map((item) => ({
            ...item,
            order: getCategoryOrder(item, categoryFilter),
          }))
        : cloned;
    setItems(next);
    setBaseline(cloneServices(next));
  }, [data, categoryFilter]);

  const isDirty = useMemo(
    () => !areServicesEqual(items, baseline),
    [items, baseline]
  );

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  /** Backend already filters by category slug when a category is selected. */
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const queried = !query
      ? items
      : items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.slug.toLowerCase().includes(query)
        );

    switch (listFilter) {
      case "most_used":
        return queried.filter((item) => item.badge === "most_used");
      case "popular":
        return queried.filter((item) => item.badge === "popular");
      case "newest":
        return queried.filter((item) => item.badge === "newest");
      case "multi":
        return queried.filter((item) => item.modelType === "multi");
      case "single":
        return queried.filter((item) => item.modelType === "single");
      case "active":
        return queried.filter((item) => item.isActive);
      case "inactive":
        return queried.filter((item) => !item.isActive);
      default:
        return queried;
    }
  }, [items, search, listFilter]);

  const nextOrder = useMemo(() => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.order)) + 1;
  }, [items]);

  const existingSlugs = useMemo(() => items.map((item) => item.slug), [items]);

  const selectedCategoryName = selectedCategory?.name ?? null;

  const catalogForPickers = useMemo(
    () => (categoryFilter === "all" ? items : fullCatalog),
    [categoryFilter, items, fullCatalog]
  );

  const parentPickerOptions = useMemo(() => {
    const optionMap = new Map<
      string,
      { uuid: string; name: string; slug: string }
    >();

    const collect = (list: ManageService[]) => {
      for (const service of list) {
        if (service.modelType !== "multi") continue;
        if (optionMap.has(service.uuid)) continue;
        optionMap.set(service.uuid, {
          uuid: service.uuid,
          name: service.name,
          slug: service.slug,
        });
      }
    };

    collect(catalogForPickers);
    collect(fullCatalog);
    collect(items);

    const currentParentUuid = editingService?.parentUuid;
    if (currentParentUuid && !optionMap.has(currentParentUuid)) {
      const currentParent =
        fullCatalog.find((service) => service.uuid === currentParentUuid) ??
        catalogForPickers.find(
          (service) => service.uuid === currentParentUuid
        ) ??
        items.find((service) => service.uuid === currentParentUuid);

      if (currentParent?.modelType === "multi") {
        optionMap.set(currentParent.uuid, {
          uuid: currentParent.uuid,
          name: currentParent.name,
          slug: currentParent.slug,
        });
      } else {
        optionMap.set(currentParentUuid, {
          uuid: currentParentUuid,
          name: currentParentUuid,
          slug: currentParentUuid,
        });
      }
    }

    return Array.from(optionMap.values());
  }, [catalogForPickers, fullCatalog, items, editingService?.parentUuid]);

  const submodelPickerOptions = useMemo(() => {
    return catalogForPickers
      .filter((service) => service.modelType !== "multi")
      .map((service) => ({
        uuid: service.uuid,
        name: service.name,
        slug: service.slug,
        endpoint: service.endpoint,
        description: service.description,
        imageUrl: service.imageUrl,
        badge: service.badge,
        isActive: service.isActive,
        inactiveReason: service.inactiveReason,
        creditHint: service.creditHint,
        cost: resolveSubmodelCost(service),
        parentUuid: service.parentUuid,
        order: service.order,
      }));
  }, [catalogForPickers]);

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleReorder = (activeUuid: string, overUuid: string) => {
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.uuid === activeUuid);
      const newIndex = prev.findIndex((item) => item.uuid === overUuid);
      if (oldIndex < 0 || newIndex < 0) return prev;

      const moved = arrayMove(prev, oldIndex, newIndex);

      if (categoryFilter === "all") {
        return applyServiceOrders(moved);
      }

      // Pass `moved` as the list so visual order updates (not only order numbers).
      return applyCategoryServiceOrders(moved, categoryFilter, moved);
    });
  };

  const handleCancel = () => setItems(cloneServices(baseline));

  const handleEdit = async (row: ManageService) => {
    setEditingService(row);
    setIsFormOpen(true);

    if (row.isLocal) {
      setIsDetailLoading(false);
      return;
    }

    setIsDetailLoading(true);
    try {
      const detail = await loadServiceDetail.mutateAsync({
        uuid: row.uuid,
        fallback: row,
      });
      setEditingService(detail);
    } catch {
      setIsFormOpen(false);
      setEditingService(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleEditSubmodelFromDialog = async (submodelUuid: string) => {
    setIsFormOpen(false);
    setEditingService(null);
    setIsDetailLoading(false);

    const target =
      catalogForPickers.find((item) => item.uuid === submodelUuid) ??
      fullCatalog.find((item) => item.uuid === submodelUuid) ??
      items.find((item) => item.uuid === submodelUuid);

    if (target) {
      await handleEdit(target);
      return;
    }

    setIsFormOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await loadServiceDetail.mutateAsync({
        uuid: submodelUuid,
      });
      setEditingService(detail);
    } catch {
      setIsFormOpen(false);
      setEditingService(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleToggleActive = async (
    service: ManageService,
    isActive: boolean
  ) => {
    if (service.isLocal) {
      setItems((prev) =>
        prev.map((item) =>
          item.uuid === service.uuid ? { ...item, isActive } : item
        )
      );
      return;
    }

    const previous = service.isActive;
    setItems((prev) =>
      prev.map((item) =>
        item.uuid === service.uuid ? { ...item, isActive } : item
      )
    );
    setBaseline((prev) =>
      prev.map((item) =>
        item.uuid === service.uuid ? { ...item, isActive } : item
      )
    );

    try {
      await upsertCustomData.mutateAsync({
        service,
        patch: { isActive },
      });
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.uuid === service.uuid ? { ...item, isActive: previous } : item
        )
      );
      setBaseline((prev) =>
        prev.map((item) =>
          item.uuid === service.uuid ? { ...item, isActive: previous } : item
        )
      );
    }
  };

  const handleSave = async () => {
    await saveServices.mutateAsync({ items });

    // Refetch is handled by invalidateQueries; keep local baseline in sync after success.
    setBaseline(
      cloneServices(items.map((item) => ({ ...item, isLocal: false })))
    );
    setItems((prev) => prev.map((item) => ({ ...item, isLocal: false })));
  };

  const handleFormSubmit = async (values: ServiceFormSubmitValues) => {
    if (editingService) {
      const previousParentUuid = editingService.parentUuid ?? null;
      const next: ManageService = {
        ...editingService,
        ...values,
        parentUuid: values.parentUuid,
        categoryOrders: buildCategoryOrdersPayload(
          values.categoryUuids,
          editingService.categoryOrders,
          values.order
        ),
      };

      const nextParentUuid =
        next.modelType === "single" ? (next.parentUuid ?? null) : null;
      const parentMembershipChanged = previousParentUuid !== nextParentUuid;
      const parentChildDataChanged = hasParentChildDataChanges(
        editingService,
        next
      );
      const shouldSyncParentMembership =
        parentMembershipChanged ||
        (Boolean(nextParentUuid) && parentChildDataChanged);
      const parentUuidsToSync = new Set<string>();
      if (shouldSyncParentMembership) {
        if (previousParentUuid) parentUuidsToSync.add(previousParentUuid);
        if (nextParentUuid) parentUuidsToSync.add(nextParentUuid);
      }

      let nextItems = applyServiceOrders(
        items
          .map((item) => (item.uuid === editingService.uuid ? next : item))
          .sort((a, b) => a.order - b.order)
      );

      if (shouldSyncParentMembership) {
        nextItems = applyChildToParentMembership(
          nextItems,
          next,
          previousParentUuid,
          nextParentUuid
        );
      }

      setItems(nextItems);

      if (!editingService.isLocal) {
        try {
          await upsertCustomData.mutateAsync({
            service: next,
            invalidate: false,
          });

          const touchedParentMap = new Map<string, ManageService>();

          for (const parentUuid of parentUuidsToSync) {
            const fromCurrentItems =
              nextItems.find((item) => item.uuid === parentUuid) ??
              items.find((item) => item.uuid === parentUuid);
            const fromCatalog =
              catalogForPickers.find((item) => item.uuid === parentUuid) ??
              fullCatalog.find((item) => item.uuid === parentUuid) ??
              fromCurrentItems;

            if (!fromCatalog) continue;

            let sourceParent = fromCatalog;
            if (!sourceParent.isLocal) {
              try {
                sourceParent = await loadServiceDetail.mutateAsync({
                  uuid: parentUuid,
                  fallback: sourceParent,
                });
              } catch {
                sourceParent = fromCatalog;
              }
            }

            const [nextParent] = applyChildToParentMembership(
              [sourceParent],
              next,
              previousParentUuid,
              nextParentUuid
            );

            if (nextParent) {
              touchedParentMap.set(parentUuid, nextParent);
            }
          }

          const touchedParents = [...touchedParentMap.values()].filter(
            (item): item is ManageService => !item.isLocal
          );

          if (touchedParentMap.size > 0) {
            setItems((prev) =>
              prev.map((item) => touchedParentMap.get(item.uuid) ?? item)
            );
          }

          for (const parentService of touchedParents) {
            await updateManageServiceCustomData(parentService, {
              submodels: parentService.submodels,
            });
          }

          setBaseline((prev) => {
            let nextBaseline = prev.map((item) =>
              item.uuid === next.uuid ? { ...item, ...next } : item
            );

            if (shouldSyncParentMembership) {
              nextBaseline = applyChildToParentMembership(
                nextBaseline,
                next,
                previousParentUuid,
                nextParentUuid
              );
            }

            return nextBaseline;
          });

          await queryClient.invalidateQueries({
            queryKey: MANAGE_SERVICES_QUERY_KEY,
          });
        } catch {
          // keep local draft; user can retry via save all
        }
      }
      return;
    }

    setItems((prev) =>
      applyServiceOrders(
        [
          ...prev,
          createLocalService({
            ...values,
            submodels: values.submodels,
          }),
        ].sort((a, b) => a.order - b.order)
      )
    );
  };

  const handleDeleteConfirm = (mode: ServiceDeleteMode) => {
    if (!deletingService) return;

    if (mode === "fromCategory" && categoryFilter !== "all") {
      setItems((prev) =>
        applyServiceOrders(
          removeServiceFromCategory(prev, deletingService.uuid, categoryFilter)
        )
      );
    } else {
      setItems((prev) =>
        applyServiceOrders(
          prev.filter((item) => item.uuid !== deletingService.uuid)
        )
      );
    }

    setDeletingService(null);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {t("manageServices.title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("manageServices.description")}
          </p>
        </div>
        <Button
          className="shrink-0"
          variant="outline"
          disabled={reindexSearch.isPending}
          onClick={() => reindexSearch.mutate()}
        >
          {reindexSearch.isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconBuildingCarousel className="size-4" />
          )}
          {t("manageServices.actions.reindexSearch")}
        </Button>
      </div>

      {isDirty ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <IconAlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">{t("manageServices.unsaved.title")}</p>
            <p className="mt-0.5 text-xs opacity-90">
              {t("manageServices.unsaved.description")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/30 flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <IconLayersSubtract className="size-5" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-bold">
                {t("manageServices.panelTitle")}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t("manageServices.panelHint")}
              </p>
              <Button
                className="shrink-0"
                variant="outline"
                onClick={() => {
                  setEditingService(null);
                  setIsFormOpen(true);
                }}
              >
                <IconPlus className="size-4" />
                {t("manageServices.addService")}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-card flex flex-col gap-3 rounded-2xl border p-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("manageServices.search")}
                className="w-full sm:w-56"
              />
              <Select
                value={categoryFilter}
                onValueChange={handleCategoryFilterChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("manageServices.filter.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("manageServices.filter.all")}
                  </SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.uuid} value={category.uuid}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={listFilter}
                onValueChange={(value) =>
                  setListFilter(value as ServiceListFilter)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("manageServices.filter.allServices")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("manageServices.filter.allServices")}
                  </SelectItem>
                  <SelectItem value="most_used">
                    {t("manageServices.filter.mostUsed")}
                  </SelectItem>
                  <SelectItem value="popular">
                    {t("manageServices.filter.popular")}
                  </SelectItem>
                  <SelectItem value="newest">
                    {t("manageServices.filter.newest")}
                  </SelectItem>
                  <SelectItem value="multi">
                    {t("manageServices.filter.multi")}
                  </SelectItem>
                  <SelectItem value="single">
                    {t("manageServices.filter.single")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("manageServices.filter.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("manageServices.filter.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-card flex flex-col gap-3 rounded-2xl border p-3">
              <Button
                type="button"
                className="w-full"
                variant="outline"
                disabled={!isDirty || saveServices.isPending}
                onClick={handleCancel}
              >
                {t("manageServices.actions.cancelChanges")}
              </Button>
              <Button
                type="button"
                disabled={!isDirty || saveServices.isPending}
                onClick={handleSave}
              >
                {saveServices.isPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="size-4" />
                )}
                {t("manageServices.actions.saveAll")}
              </Button>
            </div>
          </div>
        </div>

        <ServicesTable
          items={filteredItems}
          isLoading={
            (categoryFilter !== "all" && isCategoriesLoading) ||
            isLoading ||
            (isFetching && items.length === 0)
          }
          reorderEnabled={categoryFilter !== "all"}
          togglingUuid={
            upsertCustomData.isPending
              ? (upsertCustomData.variables?.service.uuid ?? null)
              : null
          }
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={setDeletingService}
          onToggleActive={handleToggleActive}
        />
      </div>

      <div className="bg-card flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || saveServices.isPending}
          onClick={handleCancel}
        >
          {t("manageServices.actions.cancelChanges")}
        </Button>
        <Button
          type="button"
          disabled={!isDirty || saveServices.isPending}
          onClick={handleSave}
        >
          {saveServices.isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconDeviceFloppy className="size-4" />
          )}
          {t("manageServices.actions.saveAll")}
        </Button>
      </div>

      <ServiceFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingService(null);
            setIsDetailLoading(false);
          }
        }}
        service={editingService}
        isDetailLoading={isDetailLoading}
        nextOrder={nextOrder}
        categoryOptions={categoryOptions}
        parentOptions={parentPickerOptions}
        submodelOptions={submodelPickerOptions}
        existingSlugs={existingSlugs}
        onSubmit={handleFormSubmit}
        onEditSubmodelService={handleEditSubmodelFromDialog}
      />

      <ServiceDeleteDialog
        open={!!deletingService}
        onOpenChange={(open) => {
          if (!open) setDeletingService(null);
        }}
        service={deletingService}
        categoryName={selectedCategoryName}
        allowRemoveFromCategory={categoryFilter !== "all"}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
