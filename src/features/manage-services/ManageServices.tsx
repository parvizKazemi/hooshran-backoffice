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
import {
  IconAlertCircle,
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
import {
  useManageServiceDetail,
  useManageServices,
  useSaveManageServices,
  useUpsertServiceCustomData,
} from "./hooks/use-manage-services";
import type {
  ManageService,
  ServiceDeleteMode,
  ServiceFormSubmitValues,
} from "./types";
import {
  applyCategoryServiceOrders,
  applyServiceOrders,
  areServicesEqual,
  buildCategoryOrdersPayload,
  cloneServices,
  createLocalService,
  getCategoryOrder,
  removeServiceFromCategory,
  sortServicesByCategoryOrder,
} from "./utils/service.helpers";

export default function ManageServices() {
  const { t } = useTranslation("common");
  const [searchParams, setSearchParams] = useSearchParams();
  const { options: categoryOptions, isLoading: isCategoriesLoading } =
    useCategoryOptions();

  const [items, setItems] = useState<ManageService[]>([]);
  const [baseline, setBaseline] = useState<ManageService[]>([]);
  const [search, setSearch] = useState("");
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
    if (!query) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query)
    );
  }, [items, search]);

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
    return catalogForPickers
      .filter((service) => service.modelType === "multi")
      .map((service) => ({
        uuid: service.uuid,
        name: service.name,
        slug: service.slug,
      }));
  }, [catalogForPickers]);

  const submodelPickerOptions = useMemo(() => {
    return catalogForPickers
      .filter((service) => service.modelType !== "multi")
      .map((service) => ({
        uuid: service.uuid,
        name: service.name,
        slug: service.slug,
        description: service.description,
        imageUrl: service.imageUrl,
        isActive: service.isActive,
        creditHint: service.creditHint,
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
    const categorySlugByUuid = Object.fromEntries(
      categoryOptions.map((item) => [item.uuid, item.slug])
    );
    const categoryNameByUuid = Object.fromEntries(
      categoryOptions.map((item) => [item.uuid, item.name])
    );

    await saveServices.mutateAsync({
      items,
      categorySlugByUuid,
      categoryNameByUuid,
    });

    // Refetch is handled by invalidateQueries; keep local baseline in sync after success.
    setBaseline(
      cloneServices(items.map((item) => ({ ...item, isLocal: false })))
    );
    setItems((prev) => prev.map((item) => ({ ...item, isLocal: false })));
  };

  const handleFormSubmit = async (values: ServiceFormSubmitValues) => {
    if (editingService) {
      const next: ManageService = {
        ...editingService,
        ...values,
        categoryOrders: buildCategoryOrdersPayload(
          values.categoryUuids,
          editingService.categoryOrders,
          values.order
        ),
      };

      setItems((prev) =>
        applyServiceOrders(
          prev
            .map((item) => (item.uuid === editingService.uuid ? next : item))
            .sort((a, b) => a.order - b.order)
        )
      );

      if (!editingService.isLocal) {
        try {
          await upsertCustomData.mutateAsync({ service: next });
          setBaseline((prev) =>
            prev.map((item) =>
              item.uuid === next.uuid ? { ...item, ...next } : item
            )
          );
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
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {t("manageServices.title")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("manageServices.description")}
        </p>
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
