import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createPlanSchema, CreatePlanInput, Plan } from "../types";
import { useCreatePlan, useUpdatePlan } from "../hooks/use-plans";

type PlanFormProps = {
  plan?: Plan;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const PlanForm = memo(function PlanForm({
  plan,
  onSuccess,
  onCancel,
}: PlanFormProps) {
  const { t } = useTranslation("common");
  const isEditing = !!plan;
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const form = useForm<CreatePlanInput>({
    // @ts-expect-error - zod schema type inference issue with optional default values
    resolver: zodResolver(createPlanSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          price: plan.price,
          duration_days: plan.duration_days,
          max_usage: plan.max_usage || undefined,
          discount: plan.discount || undefined,
          is_active: plan.is_active ?? true,
        }
      : {
          name: "",
          price: 0,
          duration_days: 30,
          max_usage: undefined,
          discount: undefined,
          is_active: true,
        },
  });

  const onSubmit = async (data: CreatePlanInput) => {
    if (isEditing && plan) {
      const { id, ...updateData } = { ...data, id: plan.id };
      await updatePlan.mutateAsync({ ...updateData, id });
    } else {
      await createPlan.mutateAsync(data);
    }
    onSuccess?.();
    if (!isEditing) form.reset();
  };

  const isLoading = createPlan.isPending || updatePlan.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">
            {t("plans.form.name")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            {...form.register("name")}
            placeholder={t("plans.form.namePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="price">
            {t("plans.form.price")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="price"
            type="number"
            min="0"
            {...form.register("price", { valueAsNumber: true })}
            placeholder={t("plans.form.pricePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.price && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.price.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="duration_days">
            {t("plans.form.durationDays")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="duration_days"
            type="number"
            min="1"
            {...form.register("duration_days", { valueAsNumber: true })}
            placeholder={t("plans.form.durationDaysPlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.duration_days && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.duration_days?.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="max_usage">
            {t("plans.form.maxUsage")}
          </FieldLabel>
          <Input
            id="max_usage"
            type="number"
            min="0"
            {...form.register("max_usage", { valueAsNumber: true })}
            placeholder={t("plans.form.maxUsagePlaceholder")}
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="discount">{t("plans.form.discount")}</FieldLabel>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            {...form.register("discount", { valueAsNumber: true })}
            placeholder={t("plans.form.discountPlaceholder")}
            disabled={isLoading}
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
              {t("plans.form.isActive")}
            </FieldLabel>
          </div>
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? t("plans.form.saveChanges") : t("plans.form.createPlan")}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("plans.form.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
});
