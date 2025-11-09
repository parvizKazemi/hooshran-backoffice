import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createApiServiceSchema,
  CreateApiServiceInput,
  ApiService,
  ApiServiceParameterType,
} from "../types";
import {
  useCreateApiService,
  useUpdateApiService,
} from "../hooks/use-api-services";
import { mockCategories } from "../mock-data";

type ApiServiceFormProps = {
  service?: ApiService;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const parameterTypes = [
  { value: "TEXT", label: "متن" },
  { value: "NUMBER", label: "عدد" },
  { value: "BOOLEAN", label: "بولی" },
  { value: "FILE", label: "فایل" },
  { value: "SELECT", label: "انتخابی" },
  { value: "IMAGE", label: "تصویر" },
  { value: "VIDEO", label: "ویدیو" },
];

export const ApiServiceForm = memo(function ApiServiceForm({
  service,
  onSuccess,
  onCancel,
}: ApiServiceFormProps) {
  const { t } = useTranslation("common");
  const isEditing = !!service;
  const createService = useCreateApiService();
  const updateService = useUpdateApiService();

  const form = useForm<CreateApiServiceInput>({
    // @ts-expect-error - zod schema type inference issue with optional default values
    resolver: zodResolver(createApiServiceSchema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description || "",
          endpoint: service.endpoint || "",
          category_id: service.category_id || "",
          slug: service.slug || "",
          english_name: service.english_name || "",
          is_active: service.is_active ?? true,
          parameters: [],
          default_credit_cost: 0,
        }
      : {
          name: "",
          description: "",
          endpoint: "",
          category_id: "",
          slug: "",
          english_name: "",
          is_active: true,
          parameters: [],
          default_credit_cost: 0,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  const onSubmit = async (data: CreateApiServiceInput) => {
    if (isEditing && service) {
      const { id, ...updateData } = { ...data, id: service.id };
      await updateService.mutateAsync({ ...updateData, id });
    } else {
      await createService.mutateAsync(data);
    }
    onSuccess?.();
    if (!isEditing) {
      form.reset();
    }
  };

  const isLoading = createService.isPending || updateService.isPending;

  const addParameter = () => {
    append({
      name: "",
      type: "TEXT",
      required: false,
      priority: fields.length,
    });
  };

  const removeParameter = (index: number) => {
    remove(index);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">
            {t("apiServices.form.name")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            {...form.register("name")}
            placeholder={t("apiServices.form.namePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="english_name">
            {t("apiServices.form.englishName")}
          </FieldLabel>
          <Input
            id="english_name"
            {...form.register("english_name")}
            placeholder={t("apiServices.form.englishNamePlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.english_name && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.english_name?.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">
            {t("apiServices.form.description")}
          </FieldLabel>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder={t("apiServices.form.descriptionPlaceholder")}
            disabled={isLoading}
            rows={3}
          />
          {form.formState.errors.description && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.description?.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="endpoint">
            {t("apiServices.form.endpoint")}
          </FieldLabel>
          <Input
            id="endpoint"
            type="url"
            {...form.register("endpoint")}
            placeholder={t("apiServices.form.endpointPlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.endpoint && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.endpoint?.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">{t("apiServices.form.slug")}</FieldLabel>
          <Input
            id="slug"
            {...form.register("slug")}
            placeholder={t("apiServices.form.slugPlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.slug && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.slug?.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="category_id">
            {t("apiServices.form.category")}
          </FieldLabel>
          <Select
            value={form.watch("category_id") || ""}
            onValueChange={(value) =>
              form.setValue("category_id", value || undefined)
            }
            disabled={isLoading}
          >
            <SelectTrigger id="category_id">
              <SelectValue placeholder={t("apiServices.form.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("apiServices.form.noCategory")}
              </SelectItem>
              {mockCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category_id && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.category_id?.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="default_credit_cost">
            {t("apiServices.form.defaultCreditCost")}
          </FieldLabel>
          <Input
            id="default_credit_cost"
            type="number"
            min="0"
            {...form.register("default_credit_cost", {
              valueAsNumber: true,
            })}
            placeholder={t("apiServices.form.defaultCreditCostPlaceholder")}
            disabled={isLoading}
          />
          {form.formState.errors.default_credit_cost && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.default_credit_cost?.message}
            </FieldDescription>
          )}
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
              {t("apiServices.form.isActive")}
            </FieldLabel>
          </div>
          {form.formState.errors.is_active && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.is_active?.message}
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      {/* Parameters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FieldLabel>{t("apiServices.form.parameters")}</FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addParameter}
            disabled={isLoading}
          >
            <IconPlus className="mr-2 size-4" />
            {t("apiServices.form.addParameter")}
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="text-muted-foreground rounded-md border p-4 text-center text-sm">
            {t("apiServices.form.noParameters")}
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <FieldLabel>
                {t("apiServices.form.parameter")} {index + 1}
              </FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeParameter(index)}
                disabled={isLoading}
              >
                <IconTrash className="text-destructive size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  {t("apiServices.form.parameterName")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register(`parameters.${index}.name`)}
                  placeholder={t("apiServices.form.parameterNamePlaceholder")}
                  disabled={isLoading}
                />
                {form.formState.errors.parameters?.[index]?.name && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.parameters[index]?.name?.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>
                  {t("apiServices.form.parameterType")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={form.watch(`parameters.${index}.type`)}
                  onValueChange={(value) =>
                    form.setValue(
                      `parameters.${index}.type`,
                      value as ApiServiceParameterType
                    )
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {parameterTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.parameters?.[index]?.type && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.parameters[index]?.type?.message}
                  </FieldDescription>
                )}
              </Field>
            </div>

            {form.watch(`parameters.${index}.type`) === "SELECT" && (
              <Field>
                <FieldLabel>{t("apiServices.form.options")}</FieldLabel>
                <Input
                  placeholder={t("apiServices.form.optionsPlaceholder")}
                  disabled={isLoading}
                  defaultValue={
                    form.watch(`parameters.${index}.options`)?.join(", ") || ""
                  }
                  onBlur={(e) => {
                    const options = e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean);
                    form.setValue(
                      `parameters.${index}.options`,
                      options.length > 0 ? options : undefined
                    );
                  }}
                />
                <FieldDescription>
                  {t("apiServices.form.optionsHint")}
                </FieldDescription>
              </Field>
            )}

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={
                      form.watch(`parameters.${index}.required`) ?? false
                    }
                    onCheckedChange={(checked) =>
                      form.setValue(
                        `parameters.${index}.required`,
                        checked as boolean
                      )
                    }
                    disabled={isLoading}
                  />
                  <FieldLabel className="cursor-pointer">
                    {t("apiServices.form.required")}
                  </FieldLabel>
                </div>
              </Field>

              <Field>
                <FieldLabel>{t("apiServices.form.priority")}</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  {...form.register(`parameters.${index}.priority`, {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel>{t("apiServices.form.defaultValue")}</FieldLabel>
                <Input
                  {...form.register(`parameters.${index}.default_value`)}
                  placeholder={t("apiServices.form.defaultValuePlaceholder")}
                  disabled={isLoading}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {isEditing
            ? t("apiServices.form.saveChanges")
            : t("apiServices.form.createService")}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("apiServices.form.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
});
