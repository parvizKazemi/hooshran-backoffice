import { Button } from "@/components/ui/button";
import { arrayMove } from "@dnd-kit/sortable";
import {
  IconDeviceFloppy,
  IconFolders,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCategories,
  useDeleteCategory,
  useReorderCategories,
} from "./hooks/use-categories";
import type { Category } from "./types";
import { CategoriesTable } from "./components/categories-table";
import { CategoryDeleteDialog } from "./components/category-delete-dialog";
import { CategoryFormDialog } from "./components/category-form-dialog";

function applyLocalOrder(items: Category[]): Category[] {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}

function hasOrderChanged(current: Category[], original: Category[]): boolean {
  if (current.length !== original.length) return true;
  return current.some((item, index) => {
    const source = original[index];
    return !source || source.id !== item.id || source.order !== item.order;
  });
}

export default function Categories() {
  const { t } = useTranslation("common");
  const { data, isLoading, isFetching } = useCategories();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const [items, setItems] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    if (data) {
      setItems(data.map((item) => ({ ...item })));
    }
  }, [data]);

  const isDirty = useMemo(
    () => hasOrderChanged(items, data ?? []),
    [items, data]
  );

  const nextOrder = useMemo(() => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.order)) + 1;
  }, [items]);

  const handleReorder = (activeId: string, overId: string) => {
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === activeId);
      const newIndex = prev.findIndex((item) => item.id === overId);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return applyLocalOrder(arrayMove(prev, oldIndex, newIndex));
    });
  };

  const handleCancelReorder = () => {
    if (data) {
      setItems(data.map((item) => ({ ...item })));
    }
  };

  const handleSaveReorder = async () => {
    await reorderCategories.mutateAsync({
      items: items.map((item) => ({ id: item.id, order: item.order })),
    });
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
      </div>

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
          disabled={!isDirty || reorderCategories.isPending}
          onClick={handleCancelReorder}
        >
          {t("categories.actions.cancelChanges")}
        </Button>
        <Button
          type="button"
          disabled={!isDirty || reorderCategories.isPending}
          onClick={handleSaveReorder}
        >
          {reorderCategories.isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconDeviceFloppy className="size-4" />
          )}
          {t("categories.actions.saveOrder")}
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
      />

      <CategoryDeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        category={deletingCategory}
        isPending={deleteCategory.isPending}
        onConfirm={() => {
          if (!deletingCategory) return;
          deleteCategory.mutate(deletingCategory.id, {
            onSuccess: () => setDeletingCategory(null),
          });
        }}
      />
    </div>
  );
}
