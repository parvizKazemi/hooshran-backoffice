import { Button } from "@/components/ui/button";
import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import { IconAlertCircle, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoriesTable } from "./components/categories-table";
import { CategoryFormDialog } from "./components/category-form-dialog";
import { CategoryValuesDialog } from "./components/category-values-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { PROMPT_STATUS } from "./constants";
import {
  useCreatePromptCategory,
  useDeletePromptCategory,
  usePromptCategories,
  useToggleCategoryStatus,
  useUpdatePromptCategory,
} from "./hooks/use-prompt-assistant";
import type { CategoryFormValues, PromptCategory } from "./types";

export default function PromptAssistantCategories() {
  const { t } = useTranslation("common");
  const { data, isLoading, isError, refetch, isFetching } =
    usePromptCategories();
  const createMutation = useCreatePromptCategory();
  const updateMutation = useUpdatePromptCategory();
  const deleteMutation = useDeletePromptCategory();
  const toggleMutation = useToggleCategoryStatus();

  const [items, setItems] = useState<PromptCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PromptCategory | null>(
    null
  );
  const [valuesCategory, setValuesCategory] = useState<PromptCategory | null>(
    null
  );
  const [deletingCategory, setDeletingCategory] =
    useState<PromptCategory | null>(null);

  useEffect(() => {
    if (!data) return;
    setItems(data);
  }, [data]);

  const handleFormSubmit = async (values: CategoryFormValues) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        uuid: editingCategory.uuid,
        payload: {
          title: values.title.trim(),
          systemKey: values.systemKey.trim(),
          icon: values.icon?.trim() || undefined,
        },
      });
      setIsFormOpen(false);
      setEditingCategory(null);
      return;
    }

    await createMutation.mutateAsync({
      title: values.title.trim(),
      systemKey: values.systemKey.trim(),
      icon: values.icon?.trim() || undefined,
      status: PROMPT_STATUS.INACTIVE,
    });
    setIsFormOpen(false);
  };

  return (
    <div className="mx-auto flex w-[96%] flex-col gap-4">
      <SettingsPageHeader
        title={t("promptAssistant.categories.pageTitle")}
        description={t("promptAssistant.categories.pageDescription")}
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <IconRefresh className="size-4" />
          {t("promptAssistant.actions.refresh")}
        </Button>

        <Button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
        >
          <IconPlus className="size-4" />
          {t("promptAssistant.actions.addCategory")}
        </Button>
      </div>

      {isError ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
          <IconAlertCircle className="size-4" />
          {t("promptAssistant.errors.loadFailed")}
        </div>
      ) : null}

      <CategoriesTable
        items={items}
        isLoading={isLoading}
        togglingUuid={
          toggleMutation.isPending ? toggleMutation.variables?.uuid : null
        }
        onEdit={(category) => {
          setEditingCategory(category);
          setIsFormOpen(true);
        }}
        onEditValues={setValuesCategory}
        onDelete={setDeletingCategory}
        onToggleStatus={(category, active) => {
          void toggleMutation.mutateAsync({
            uuid: category.uuid,
            status: active ? PROMPT_STATUS.ACTIVE : PROMPT_STATUS.INACTIVE,
          });
        }}
      />

      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => void handleFormSubmit(values)}
      />

      <CategoryValuesDialog
        open={Boolean(valuesCategory)}
        onOpenChange={(open) => {
          if (!open) setValuesCategory(null);
        }}
        category={valuesCategory}
      />

      <DeleteConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        title={t("promptAssistant.deleteCategory.title")}
        description={t("promptAssistant.deleteCategory.description", {
          title: deletingCategory?.title ?? "",
        })}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (!deletingCategory) return;
          void deleteMutation.mutateAsync(deletingCategory.uuid).then(() => {
            setDeletingCategory(null);
          });
        }}
      />
    </div>
  );
}
