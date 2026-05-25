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
import { Checkbox } from "@/components/ui/checkbox";
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

type PackageFormData = CreatePackageInput & {
  namePart?: string;
  mainPriceDisplay?: string;
  buyPriceDisplay?: string;
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

  // Parse name field: "name | mainPriceDisplay | buyPriceDisplay"
  const parseName = (name: string) => {
    const parts = name.split("|").map((part) => part.trim());
    return {
      namePart: parts[0] || "",
      mainPriceDisplay: parts[1] || "",
      buyPriceDisplay: parts[2] || "",
    };
  };

  const parsedName = pkg
    ? parseName(pkg.name)
    : { namePart: "", mainPriceDisplay: "", buyPriceDisplay: "" };

  const form = useForm<PackageFormData>({
    resolver: async (data, context, options) => {
      // Combine name parts before validation
      const nameParts = [
        data.namePart || "",
        data.mainPriceDisplay || "",
        data.buyPriceDisplay || "",
      ].filter(Boolean);
      const combinedName = nameParts.join(" | ");

      // Create data with combined name
      const dataWithName = {
        ...data,
        name: combinedName,
      };

      // Use zodResolver with the combined data
      return zodResolver(createPackageSchema)(dataWithName, context, options);
    },
    defaultValues: pkg
      ? {
          name: pkg.name,
          namePart: parsedName.namePart,
          mainPriceDisplay: parsedName.mainPriceDisplay,
          buyPriceDisplay: parsedName.buyPriceDisplay,
          creditAmount: pkg.creditAmount,
          price: pkg.price,
          type: pkg.type,
          durationDays: pkg.durationDays || undefined,
          properties: {
            transferLimit: pkg.properties?.transferLimit || 0,
            boughtLimit: pkg.properties?.boughtLimit || 1,
            parallelRequestLimit: pkg.properties?.parallelRequestLimit || 2,
            toolboxAccess: pkg.properties?.toolboxAccess ?? true,
            isSpecialOffer: pkg.properties?.isSpecialOffer || undefined,
          },
        }
      : {
          name: "",
          namePart: "",
          mainPriceDisplay: "",
          buyPriceDisplay: "",
          creditAmount: 0,
          price: 0,
          type: "SUBSCRIPTION",
          durationDays: undefined,
          properties: {
            transferLimit: 0,
            boughtLimit: 1,
            parallelRequestLimit: 2,
            toolboxAccess: true,
            isSpecialOffer: undefined,
          },
        },
  });

  const packageType = form.watch("type");

  const onSubmit: SubmitHandler<PackageFormData> = async (data) => {
    // Combine name parts with | separator
    // Always include namePart, filter only optional parts
    // Remove temporary fields and create clean submit data
    const submitData: CreatePackageInput = {
      ...data,
    };

    if (isEditing && pkg) {
      await updatePackage.mutateAsync({ ...submitData, uuid: pkg.uuid });
    } else {
      await createPackage.mutateAsync(submitData);
    }
    onSuccess?.();
    if (!isEditing) form.reset();
  };

  const isLoading = createPackage.isPending || updatePackage.isPending;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
      <FieldGroup>
        <FieldLabel className="text-base font-semibold">
          {t("packages.form.displayParts")}
        </FieldLabel>
        <div className="flex flex-row items-center justify-between gap-2">
          <Field>
            <FieldLabel htmlFor="namePart">
              {t("packages.form.name")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="namePart"
              type="text"
              {...form.register("namePart", {
                required: t("packages.form.name") + " الزامی است",
              })}
              placeholder={t("packages.form.namePlaceholder")}
              disabled={isLoading}
            />
            {(form.formState.errors.name || form.formState.errors.namePart) && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.name?.message ||
                  form.formState.errors.namePart?.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="mainPriceDisplay">
              {t("packages.form.mainPriceDisplay")}
            </FieldLabel>
            <Input
              className="text-left"
              dir="ltr"
              id="mainPriceDisplay"
              type="text"
              {...form.register("mainPriceDisplay")}
              placeholder={t("packages.form.mainPriceDisplayPlaceholder")}
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="buyPriceDisplay">
              {t("packages.form.buyPriceDisplay")}
            </FieldLabel>
            <Input
              className="text-left"
              dir="ltr"
              id="buyPriceDisplay"
              type="text"
              {...form.register("buyPriceDisplay")}
              placeholder={t("packages.form.buyPriceDisplayPlaceholder")}
              disabled={isLoading}
            />
          </Field>
        </div>
      </FieldGroup>
      <div className="my-4 border-b border-gray-200"></div>

      <FieldGroup>
        <FieldLabel className="text-base font-semibold">
          {t("packages.form.mainParts")}
        </FieldLabel>
        <div className="flex flex-row items-center justify-between gap-2">
          <Field>
            <FieldLabel htmlFor="creditAmount">
              {t("packages.form.creditAmount")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="creditAmount"
              className="text-left"
              dir="ltr"
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
              className="text-left"
              dir="ltr"
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
        </div>
        {packageType === "SUBSCRIPTION" && (
          <Field>
            <FieldLabel htmlFor="durationDays">
              {t("packages.form.durationDays")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="durationDays"
              className="text-left"
              dir="ltr"
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

      <Field>
        <FieldLabel htmlFor="type">
          {t("packages.form.type")} <span className="text-destructive">*</span>
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

      <div className="my-4 border-b border-gray-200"></div>
      <FieldGroup>
        <FieldLabel className="text-base font-semibold">
          {t("packages.form.properties")}
        </FieldLabel>
        <div className="mx-2 flex flex-row items-center justify-between gap-2">
          <Field>
            <FieldLabel htmlFor="properties.transferLimit">
              {t("packages.form.transferLimit")}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="properties.transferLimit"
              className="text-left"
              dir="ltr"
              type="number"
              min="0"
              {...form.register("properties.transferLimit", {
                valueAsNumber: true,
              })}
              placeholder={t("packages.form.transferLimitPlaceholder")}
              disabled={isLoading}
            />
            {form.formState.errors.properties?.transferLimit && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.properties.transferLimit.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="properties.parallelRequestLimit">
              {t("packages.form.parallelRequestLimit")}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="properties.parallelRequestLimit"
              className="text-left"
              dir="ltr"
              type="number"
              min="0"
              {...form.register("properties.parallelRequestLimit", {
                valueAsNumber: true,
              })}
              placeholder={t("packages.form.parallelRequestLimitPlaceholder")}
              disabled={isLoading}
            />
            {form.formState.errors.properties?.parallelRequestLimit && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.properties.parallelRequestLimit.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="properties.boughtLimit">
              {t("packages.form.boughtLimit")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="properties.boughtLimit"
              type="number"
              className="text-left"
              dir="ltr"
              {...form.register("properties.boughtLimit", {
                valueAsNumber: true,
              })}
              placeholder={t("packages.form.boughtLimitPlaceholder")}
              disabled={isLoading}
            />
            {form.formState.errors.properties?.boughtLimit && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.properties.boughtLimit.message}
              </FieldDescription>
            )}
          </Field>
        </div>
        {/* Number Fields */}
        {/* Boolean Fields */}
        <div className="mx-4 flex flex-row items-center justify-between gap-2">
          <Field>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="properties.toolboxAccess"
                checked={form.watch("properties.toolboxAccess") ?? false}
                onCheckedChange={(checked) => {
                  form.setValue(
                    "properties.toolboxAccess",
                    checked as boolean,
                    {
                      shouldValidate: true,
                    }
                  );
                }}
                disabled={isLoading}
              />
              <FieldLabel
                htmlFor="properties.toolboxAccess"
                className="cursor-pointer"
              >
                {t("packages.form.toolboxAccess")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
            </div>
            {form.formState.errors.properties?.toolboxAccess && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.properties.toolboxAccess.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="properties.isSpecialOffer"
                checked={form.watch("properties.isSpecialOffer") ?? false}
                onCheckedChange={(checked) => {
                  form.setValue(
                    "properties.isSpecialOffer",
                    checked as boolean,
                    {
                      shouldValidate: true,
                    }
                  );
                }}
                disabled={isLoading}
              />
              <FieldLabel
                htmlFor="properties.isSpecialOffer"
                className="cursor-pointer"
              >
                {t("packages.form.isSpecialOffer")}
              </FieldLabel>
            </div>
            {form.formState.errors.properties?.isSpecialOffer && (
              <FieldDescription className="text-destructive">
                {form.formState.errors.properties.isSpecialOffer.message}
              </FieldDescription>
            )}
          </Field>
        </div>
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
