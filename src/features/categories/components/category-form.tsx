import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-categories";
import { Category, CreateCategoryInput, createCategorySchema } from "../types";

type CategoryFormProps = {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const CategoryForm = memo(function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { t } = useTranslation("common");
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const defaultValues = useMemo(
    () =>
      category
        ? {
            name: category.name,
            slug: category.slug || "",
            description: category.description || "",
            is_active: category.is_active ?? true,
          }
        : {
            name: "",
            slug: "",
            description: "",
            is_active: true,
          },
    [category]
  );

  const form = useForm<CreateCategoryInput>({
    // @ts-expect-error - zod schema type inference issue with optional default values
    resolver: zodResolver(createCategorySchema),
    defaultValues,
  });

  // Reset form when category changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const onSubmit = useCallback(
    async (data: CreateCategoryInput) => {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          ...data,
          id: category.id,
        } as Parameters<typeof updateCategory.mutateAsync>[0]);
      } else {
        await createCategory.mutateAsync(data);
      }
      onSuccess?.();
      if (!isEditing) {
        form.reset(defaultValues);
      }
    },
    [
      isEditing,
      category,
      updateCategory,
      createCategory,
      onSuccess,
      form,
      defaultValues,
    ]
  );

  const isLoading = createCategory.isPending || updateCategory.isPending;

  return (
    <form
      // @ts-expect-error - form data type inference
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">
            {t("categories.form.name")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            {...form.register("name")}
            placeholder={t("categories.form.namePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">{t("categories.form.slug")}</FieldLabel>
          <Input
            id="slug"
            {...form.register("slug")}
            placeholder={t("categories.form.slugPlaceholder")}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">
            {t("categories.form.description")}
          </FieldLabel>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder={t("categories.form.descriptionPlaceholder")}
            disabled={isLoading}
            rows={3}
          />
        </Field>

        <Field>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={form.watch("is_active") ?? true}
              onCheckedChange={(checked) =>
                form.setValue("is_active", checked as boolean)
              }
              disabled={isLoading}
            />
            <FieldLabel htmlFor="is_active" className="cursor-pointer">
              {t("categories.form.isActive")}
            </FieldLabel>
          </div>
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {isEditing
            ? t("categories.form.saveChanges")
            : t("categories.form.createCategory")}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("categories.form.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
});
