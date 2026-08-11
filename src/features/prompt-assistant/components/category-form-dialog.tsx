import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PROMPT_CATEGORY_ICONS } from "../constants";
import {
  categoryFormSchema,
  type CategoryFormValues,
  type PromptCategory,
} from "../types";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: PromptCategory | null;
  isPending?: boolean;
  onSubmit: (values: CategoryFormValues) => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category = null,
  isPending = false,
  onSubmit,
}: CategoryFormDialogProps) {
  const { t } = useTranslation("common");
  const isEditing = Boolean(category);

  const defaultValues = useMemo<CategoryFormValues>(
    () => ({
      title: category?.title ?? "",
      systemKey: category?.systemKey ?? "",
      icon: category?.icon ?? "sparkles",
    }),
    [category]
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("promptAssistant.categoryForm.editTitle")
              : t("promptAssistant.categoryForm.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("promptAssistant.categoryForm.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="prompt-category-title">
                {t("promptAssistant.categoryForm.title")}
              </FieldLabel>
              <Input
                id="prompt-category-title"
                placeholder={t("promptAssistant.categoryForm.titlePlaceholder")}
                {...form.register("title")}
              />
              {form.formState.errors.title ? (
                <p className="text-destructive text-xs">
                  {t("promptAssistant.categoryForm.titleRequired")}
                </p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="prompt-category-key">
                {t("promptAssistant.categoryForm.systemKey")}
              </FieldLabel>
              <Input
                id="prompt-category-key"
                dir="ltr"
                className="font-mono text-xs"
                placeholder={t(
                  "promptAssistant.categoryForm.systemKeyPlaceholder"
                )}
                {...form.register("systemKey")}
              />
              {form.formState.errors.systemKey ? (
                <p className="text-destructive text-xs">
                  {t("promptAssistant.categoryForm.systemKeyInvalid")}
                </p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel>{t("promptAssistant.categoryForm.icon")}</FieldLabel>
              <Controller
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <Select
                    value={field.value || "sparkles"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "promptAssistant.categoryForm.iconPlaceholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORY_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </FieldGroup>

          {!isEditing ? (
            <p className="text-muted-foreground text-xs">
              {t("promptAssistant.categoryForm.defaultInactiveHint")}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("promptAssistant.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : null}
              {isEditing
                ? t("promptAssistant.actions.save")
                : t("promptAssistant.actions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
