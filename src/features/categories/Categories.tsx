import { Button } from "@/components/ui/button";
import { arrayMove } from "@dnd-kit/sortable";
import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconFolders,
  IconLayersSubtract,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CategoriesTable } from "./components/categories-table";
import { CategoryDeleteDialog } from "./components/category-delete-dialog";
import { CategoryFormDialog } from "./components/category-form-dialog";
import { useCategories, useSaveCategories } from "./hooks/use-categories";
import type { Category, CategoryFormSubmitValues } from "./types";
import {
  applyCategoryOrders,
  areCategoriesEqual,
  cloneCategories,
  createLocalCategory,
  toCategoryPayloadList,
} from "./utils/category.helpers";

export default function Categories() {
  const { t } = useTranslation("common");
  const { data, isLoading, isFetching } = useCategories();
  const saveCategories = useSaveCategories();

  const [items, setItems] = useState<Category[]>([]);
  const [baseline, setBaseline] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    if (!data) return;
    const next = cloneCategories(data);
    setItems(next);
    setBaseline(cloneCategories(data));
  }, [data]);

  const isDirty = useMemo(
    () => !areCategoriesEqual(items, baseline),
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

  const nextOrder = useMemo(() => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.order)) + 1;
  }, [items]);

  const existingSlugs = useMemo(() => items.map((item) => item.slug), [items]);
  const existingOrders = useMemo(
    () => items.map((item) => item.order),
    [items]
  );

  const handleReorder = (activeUuid: string, overUuid: string) => {
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.uuid === activeUuid);
      const newIndex = prev.findIndex((item) => item.uuid === overUuid);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return applyCategoryOrders(arrayMove(prev, oldIndex, newIndex));
    });
  };

  const handleCancelChanges = () => {
    setItems(cloneCategories(baseline));
  };

  const handleSaveAll = async () => {
    const payload = toCategoryPayloadList(items);
    const saved = await saveCategories.mutateAsync({
      payload,
      useCreate: baseline.length === 0,
    });
    setItems(cloneCategories(saved));
    setBaseline(cloneCategories(saved));
  };

  const handleFormSubmit = (values: CategoryFormSubmitValues) => {
    if (editingCategory) {
      setItems((prev) =>
        applyCategoryOrders(
          prev
            .map((item) =>
              item.uuid === editingCategory.uuid
                ? {
                    ...item,
                    name: values.name,
                    slug: values.slug,
                    order: values.order,
                    badge: values.badge,
                  }
                : item
            )
            .sort((a, b) => a.order - b.order)
        )
      );
      return;
    }

    setItems((prev) =>
      applyCategoryOrders(
        [
          ...prev,
          createLocalCategory({
            name: values.name,
            slug: values.slug,
            order: values.order,
            badge: values.badge,
          }),
        ].sort((a, b) => a.order - b.order)
      )
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    setItems((prev) =>
      applyCategoryOrders(
        prev.filter((item) => item.uuid !== deletingCategory.uuid)
      )
    );
    setDeletingCategory(null);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {t("categories.title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("categories.description")}
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link to="/services/manage">
            <IconLayersSubtract className="size-4" />
            {t("nav.services.manageServices")}
          </Link>
        </Button>
      </div>

      {isDirty ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <IconAlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold">{t("categories.unsaved.title")}</p>
            <p className="mt-0.5 text-xs opacity-90">
              {t("categories.unsaved.description")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-muted/30 flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <IconFolders className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {t("categories.panelTitle")}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t("categories.panelHint")}
              </p>
            </div>
          </div>

          <Button
            className="shrink-0"
            onClick={() => {
              setEditingCategory(null);
              setIsFormOpen(true);
            }}
          >
            <IconPlus className="size-4" />
            {t("categories.addCategory")}
          </Button>
        </div>

        <CategoriesTable
          items={items}
          isLoading={isLoading || (isFetching && items.length === 0)}
          onReorder={handleReorder}
          onEdit={(category) => {
            setEditingCategory(category);
            setIsFormOpen(true);
          }}
          onDelete={setDeletingCategory}
        />
      </div>

      <div className="bg-card flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || saveCategories.isPending}
          onClick={handleCancelChanges}
        >
          {t("categories.actions.cancelChanges")}
        </Button>
        <Button
          type="button"
          disabled={!isDirty || saveCategories.isPending}
          onClick={handleSaveAll}
        >
          {saveCategories.isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconDeviceFloppy className="size-4" />
          )}
          {t("categories.actions.saveAll")}
        </Button>
      </div>

      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        nextOrder={nextOrder}
        existingSlugs={existingSlugs}
        existingOrders={existingOrders}
        onSubmit={handleFormSubmit}
      />

      <CategoryDeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        category={deletingCategory}
        isPending={false}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
