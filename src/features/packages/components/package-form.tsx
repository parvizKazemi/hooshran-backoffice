import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm, SubmitHandler } from "react-hook-form";
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
    // @ts-expect-error - zod schema type inference issue with optional default values
    resolver: zodResolver(createPackageSchema),
    defaultValues: pkg
      ? {
          name: pkg.name,
          creditAmount: pkg.creditAmount,
          price: pkg.price,
          type: pkg.type,
          durationDays: pkg.durationDays || undefined,
        }
      : {
          name: "",
          creditAmount: 0,
          price: 0,
          type: "PERMANENT",
          durationDays: undefined,
        },
  });

  const packageType = form.watch("type");

  const onSubmit: SubmitHandler<CreatePackageInput> = async (data) => {
    if (isEditing && pkg) {
      await updatePackage.mutateAsync({ ...data, uuid: pkg.uuid });
    } else {
      await createPackage.mutateAsync(data);
    }
    onSuccess?.();
    if (!isEditing) form.reset();
  };

  const isLoading = createPackage.isPending || updatePackage.isPending;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">
            {t("packages.form.name")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            type="text"
            {...form.register("name")}
            placeholder={t("packages.form.namePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="creditAmount">
            {t("packages.form.creditAmount")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="creditAmount"
            type="number"
            min="1"
            {...form.register("creditAmount", { valueAsNumber: true })}
            placeholder={t("packages.form.creditAmountPlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.creditAmount && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.creditAmount.message}
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
            <FieldLabel htmlFor="durationDays">
              {t("packages.form.durationDays")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="durationDays"
              type="number"
              min="1"
              {...form.register("durationDays", { valueAsNumber: true })}
              placeholder={t("packages.form.durationDaysPlaceholder")}
              disabled={isLoading}
            />
            {form.formState.errors.durationDays && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.durationDays?.message}
              </FieldDescription>
            )}
          </Field>
        )}
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
