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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createPackageSchema, CreatePackageInput, Package } from "../types";
import { useCreatePackage, useUpdatePackage } from "../hooks/use-packages";

type PackageFormProps = {
  package?: Package;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const PackageForm = memo(function PackageForm({
  package: pkg,
  onSuccess,
  onCancel,
}: PackageFormProps) {
  const { t } = useTranslation("common");
  const isEditing = !!pkg;
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  const form = useForm<CreatePackageInput>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: pkg
      ? {
          credit_amount: pkg.credit_amount,
          price: pkg.price,
          type: pkg.type,
          duration_days: pkg.duration_days || undefined,
          is_active: pkg.is_active ?? true,
        }
      : {
          credit_amount: 0,
          price: 0,
          type: "PERMANENT",
          duration_days: undefined,
          is_active: true,
        },
  });

  const packageType = form.watch("type");

  const onSubmit = async (data: CreatePackageInput) => {
    if (isEditing && pkg) {
      await updatePackage.mutateAsync({ ...data, id: pkg.id });
    } else {
      await createPackage.mutateAsync(data);
    }
    onSuccess?.();
    if (!isEditing) form.reset();
  };

  const isLoading = createPackage.isPending || updatePackage.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="credit_amount">
            {t("packages.form.creditAmount")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="credit_amount"
            type="number"
            min="1"
            {...form.register("credit_amount", { valueAsNumber: true })}
            placeholder={t("packages.form.creditAmountPlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.credit_amount && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.credit_amount.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="price">
            {t("packages.form.price")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="price"
            type="number"
            min="0"
            {...form.register("price", { valueAsNumber: true })}
            placeholder={t("packages.form.pricePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.price && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.price.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="type">
            {t("packages.form.type")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={packageType}
            onValueChange={(value) =>
              form.setValue("type", value as "PERMANENT" | "SUBSCRIPTION")
            }
            disabled={isLoading}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERMANENT">
                {t("packages.types.permanent")}
              </SelectItem>
              <SelectItem value="SUBSCRIPTION">
                {t("packages.types.subscription")}
              </SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.type.message}
            </FieldDescription>
          )}
        </Field>

        {packageType === "SUBSCRIPTION" && (
          <Field>
            <FieldLabel htmlFor="duration_days">
              {t("packages.form.durationDays")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="duration_days"
              type="number"
              min="1"
              {...form.register("duration_days", { valueAsNumber: true })}
              placeholder={t("packages.form.durationDaysPlaceholder")}
              disabled={isLoading}
            />
            {form.formState.errors.duration_days && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.duration_days?.message}
              </FieldDescription>
            )}
          </Field>
        )}

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
              {t("packages.form.isActive")}
            </FieldLabel>
          </div>
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {isEditing
            ? t("packages.form.saveChanges")
            : t("packages.form.createPackage")}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("packages.form.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
});
