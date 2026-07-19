import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconFolderPlus,
  IconHash,
  IconLink,
  IconTag,
  IconTypography,
} from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  CATEGORY_BADGE_NONE,
  normalizeCategoryBadge,
  toCategoryBadgeFormValue,
} from "../constants";
import {
  type Category,
  type CategoryFormSubmitValues,
  type CategoryFormValues,
  categoryFormSchema,
} from "../types";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  nextOrder: number;
  existingSlugs: string[];
  existingOrders: number[];
  onSubmit: (values: CategoryFormSubmitValues) => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category = null,
  nextOrder,
  existingSlugs,
  existingOrders,
  onSubmit,
}: CategoryFormDialogProps) {
  const { t } = useTranslation("common");
  const isEditing = !!category;

  const defaultValues = useMemo<CategoryFormValues>(
    () =>
      category
        ? {
            name: category.name,
            slug: category.slug,
            order: category.order,
            badge: toCategoryBadgeFormValue(category.badge),
          }
        : {
            name: "",
            slug: "",
            order: nextOrder,
            badge: CATEGORY_BADGE_NONE,
          },
    [category, nextOrder]
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit((values) => {
    const slug = values.slug.trim();
    const order = values.order;

    const slugTaken = existingSlugs.some(
      (item) => item === slug && item !== category?.slug
    );
    if (slugTaken) {
      form.setError("slug", { message: t("categories.form.slugDuplicate") });
      return;
    }

    const orderTaken = existingOrders.some(
      (item) => item === order && item !== category?.order
    );
    if (orderTaken) {
      form.setError("order", { message: t("categories.form.orderDuplicate") });
      return;
    }

    onSubmit({
      name: values.name.trim(),
      slug,
      order,
      badge: normalizeCategoryBadge(values.badge),
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <IconFolderPlus className="size-5" />
            </div>
            <div className="space-y-0.5 text-start">
              <DialogTitle className="text-sm">
                {isEditing
                  ? t("categories.editCategory")
                  : t("categories.addNewCategory")}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {isEditing
                  ? t("categories.editCategoryInfo")
                  : t("categories.addCategoryInfo")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="gap-4 space-y-4">
            <Field>
              <FieldLabel htmlFor="category-name">
                {t("categories.form.name")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <IconTypography className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="category-name"
                  className="ps-10"
                  placeholder={t("categories.form.namePlaceholder")}
                  {...form.register("name")}
                />
              </div>
              {form.formState.errors.name ? (
                <FieldDescription className="text-destructive">
                  {form.formState.errors.name.message}
                </FieldDescription>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="category-slug">
                {t("categories.form.slug")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <IconLink className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="category-slug"
                  dir="ltr"
                  className="ps-10 text-start font-mono"
                  placeholder={t("categories.form.slugPlaceholder")}
                  {...form.register("slug")}
                />
              </div>
              <FieldDescription>
                {t("categories.form.slugHint")}
              </FieldDescription>
              {form.formState.errors.slug ? (
                <FieldDescription className="text-destructive">
                  {form.formState.errors.slug.message}
                </FieldDescription>
              ) : null}
            </Field>

            <Field>
              <FieldLabel>{t("categories.form.badge")}</FieldLabel>
              <Controller
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <IconTag className="text-muted-foreground size-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CATEGORY_BADGE_NONE}>
                        {t("categories.form.badgeNone")}
                      </SelectItem>
                      <SelectItem value="soon">
                        {t("categories.form.badgeSoon")}
                      </SelectItem>
                      <SelectItem value="new">
                        {t("categories.form.badgeNew")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category-order">
                {t("categories.form.order")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <IconHash className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="category-order"
                  type="number"
                  min={1}
                  className="ps-10"
                  placeholder={t("categories.form.orderPlaceholder")}
                  {...form.register("order", { valueAsNumber: true })}
                />
              </div>
              <FieldDescription>
                {t("categories.form.orderHint")}
              </FieldDescription>
              {form.formState.errors.order ? (
                <FieldDescription className="text-destructive">
                  {form.formState.errors.order.message}
                </FieldDescription>
              ) : null}
            </Field>
          </FieldGroup>

          <DialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("categories.form.cancel")}
            </Button>
            <Button type="submit">{t("categories.form.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
