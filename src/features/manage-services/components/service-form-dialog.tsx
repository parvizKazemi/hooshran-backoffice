import { ServicePicker } from "@/components/common/ServicePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryOption } from "@/features/categories/hooks/use-category-options";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLayersSubtract,
  IconLoader2,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  MULTI_MODEL_SLUG_PREFIX,
  normalizeServiceBadge,
  SERVICE_BADGE_NONE,
  SERVICE_DESC_MAX,
  SERVICE_NAME_MAX,
  toServiceBadgeFormValue,
} from "../constants";
import type {
  ManageService,
  CatalogServiceOption,
  ParentServiceOption,
  ServiceFormSubmitValues,
  ServiceFormValues,
  ServiceSubmodel,
} from "../types";
import { serviceFormSchema } from "../types";
import { fetchParentSubmodelsFromAcceptHint } from "../api/service";
import {
  buildMultiModelSlugFromSuffix,
  getCreditDisplay,
  getMultiModelSlugSuffix,
  slugifyName,
} from "../utils/service.helpers";
import { ServiceMediaField } from "./service-media-field";

type ServiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ManageService | null;
  /** True while GET /admin/api-service/:uuid is in flight */
  isDetailLoading?: boolean;
  nextOrder: number;
  categoryOptions: CategoryOption[];
  parentOptions: ParentServiceOption[];
  /** Single/catalog services selectable as multi-model children. */
  submodelOptions: CatalogServiceOption[];
  existingSlugs: string[];
  onSubmit: (values: ServiceFormSubmitValues) => void;
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  service = null,
  isDetailLoading = false,
  nextOrder,
  categoryOptions,
  parentOptions,
  submodelOptions,
  existingSlugs,
  onSubmit,
}: ServiceFormDialogProps) {
  const { t } = useTranslation("common");
  const isEditing = !!service;
  const [submodels, setSubmodels] = useState<ServiceSubmodel[]>([]);

  const requiredFields = [
    "name",
    "description",
    "slug",
    "categoryUuids",
    "imageUrl",
    "creditHint",
    "badge",
  ];

  const isRequiredField = (field: keyof ServiceFormValues) => {
    return requiredFields.includes(field);
  };

  const defaultValues = useMemo<ServiceFormValues>(() => {
    if (!service) {
      return {
        modelType: "single",
        name: "",
        description: "",
        slug: "",
        categoryUuids: [],
        imageUrl: "",
        isAutoCredit: true,
        creditHint: "",
        badge: SERVICE_BADGE_NONE,
        isActive: true,
        inactiveReason: "",
        searchable: true,
        display: true,
        order: nextOrder,
        isChildOfMulti: false,
        parentUuid: null,
      };
    }

    const creditHint = service.creditHint?.trim() || "";

    return {
      modelType: service.modelType,
      name: service.name,
      description:
        service.description?.trim() || service.introduction?.trim() || "",
      slug: service.slug,
      categoryUuids: service.categoryUuids,
      imageUrl: service.imageUrl,
      isAutoCredit: !creditHint,
      creditHint,
      badge: toServiceBadgeFormValue(service.badge),
      isActive: service.isActive,
      inactiveReason: service.inactiveReason,
      searchable: service.searchable,
      display: service.display,
      order: service.order,
      isChildOfMulti: Boolean(service.parentUuid),
      parentUuid: service.parentUuid,
    };
  }, [service, nextOrder]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  });

  const modelType = form.watch("modelType");
  const isAutoCredit = form.watch("isAutoCredit");
  const isActive = form.watch("isActive");
  const searchable = form.watch("searchable");
  const display = form.watch("display");
  const isChildOfMulti = form.watch("isChildOfMulti");
  const categoryUuids = form.watch("categoryUuids");
  const slugValue = form.watch("slug");

  const autoCreditDisplay = useMemo(() => {
    if (!service) return "-";
    return getCreditDisplay(service.cost);
  }, [service]);

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);

    let cancelled = false;

    async function seedSubmodels() {
      if (service?.submodels?.length) {
        setSubmodels(service.submodels.map((item) => ({ ...item })));
        return;
      }

      if (service?.modelType === "multi" && service.uuid && !service.isLocal) {
        try {
          const resolved = await fetchParentSubmodelsFromAcceptHint(
            service.uuid,
            submodelOptions
          );
          if (!cancelled) setSubmodels(resolved);
        } catch {
          if (!cancelled) setSubmodels([]);
        }
        return;
      }

      setSubmodels([]);
    }

    void seedSubmodels();
    return () => {
      cancelled = true;
    };
  }, [open, defaultValues, form, service, submodelOptions]);

  useEffect(() => {
    if (modelType !== "multi") return;

    form.setValue("isChildOfMulti", false);
    form.setValue("parentUuid", null);

    const current = form.getValues("slug");
    if (!current.startsWith(MULTI_MODEL_SLUG_PREFIX)) {
      const suffix =
        slugifyName(form.getValues("name")) ||
        getMultiModelSlugSuffix(current) ||
        "service";
      form.setValue("slug", buildMultiModelSlugFromSuffix(suffix), {
        shouldValidate: true,
      });
    }
  }, [modelType, form]);

  const availableSubmodelOptions = useMemo(() => {
    const selected = new Set(submodels.map((item) => item.uuid));
    return submodelOptions.filter(
      (item) => item.uuid !== service?.uuid && !selected.has(item.uuid)
    );
  }, [submodelOptions, submodels, service?.uuid]);

  const toggleCategory = (uuid: string, checked: boolean) => {
    const current = form.getValues("categoryUuids");
    form.setValue(
      "categoryUuids",
      checked ? [...current, uuid] : current.filter((id) => id !== uuid),
      { shouldValidate: true }
    );
  };

  const handleAddSubmodel = (uuid: string) => {
    const option = submodelOptions.find((item) => item.uuid === uuid);
    if (!option) return;
    if (submodels.some((item) => item.uuid === uuid)) return;

    setSubmodels((prev) => [
      ...prev,
      {
        uuid: option.uuid,
        name: option.name,
        description: option.description ?? "",
        slug: option.slug,
        imageUrl: option.imageUrl ?? "",
        creditHint: option.creditHint ?? "",
        badge: option.badge ?? null,
        isActive: option.isActive ?? true,
        inactiveReason: option.inactiveReason ?? "",
        isLocal: false,
      },
    ]);
  };

  const handleSubmit = form.handleSubmit((values) => {
    const slug =
      values.modelType === "multi"
        ? buildMultiModelSlugFromSuffix(getMultiModelSlugSuffix(values.slug))
        : values.slug.trim();

    const slugTaken = existingSlugs.some(
      (item) => item === slug && item !== service?.slug
    );
    if (slugTaken) {
      form.setError("slug", {
        message: t("manageServices.form.slugDuplicate"),
      });
      return;
    }

    onSubmit({
      modelType: values.modelType,
      name: values.name.trim(),
      description: values.description.trim(),
      slug,
      categoryUuids: values.categoryUuids,
      imageUrl: values.imageUrl.trim(),
      isAutoCredit: values.isAutoCredit,
      creditHint: values.creditHint.trim(),
      badge: normalizeServiceBadge(values.badge),
      isActive: values.isActive,
      inactiveReason: values.isActive ? "" : values.inactiveReason.trim(),
      searchable: values.searchable,
      display: values.display,
      order: values.order,
      parentUuid:
        values.modelType === "single" && values.isChildOfMulti
          ? values.parentUuid
          : null,
      submodels: values.modelType === "multi" ? submodels : [],
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <IconLayersSubtract className="size-5" />
            </div>
            <div className="space-y-0.5 text-start">
              <DialogTitle className="text-sm">
                {isEditing
                  ? t("manageServices.editService")
                  : t("manageServices.addService")}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {t("manageServices.form.subtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isDetailLoading ? (
          <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-3 py-10">
            <IconLoader2 className="size-6 animate-spin" />
            <p className="text-sm">{t("manageServices.form.loadingDetail")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <FieldGroup className="gap-6">
                <Field className="gap-2">
                  <FieldLabel>
                    {t("manageServices.form.modelType")}{" "}
                    {isRequiredField("modelType") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <Controller
                    control={form.control}
                    name="modelType"
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {(["single", "multi"] as const).map((type) => {
                          const selected = field.value === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => field.onChange(type)}
                              className={cn(
                                "rounded-xl border px-3 py-3 text-xs font-bold transition-all",
                                selected
                                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30"
                                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-emerald-500/50"
                              )}
                            >
                              {t(`manageServices.modelTypes.${type}`)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="service-name">
                    {t("manageServices.form.name")}{" "}
                    {isRequiredField("name") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <Input
                    id="service-name"
                    maxLength={SERVICE_NAME_MAX}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.name.message}
                    </FieldDescription>
                  ) : null}
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="service-description">
                    {t("manageServices.form.description")}{" "}
                    {isRequiredField("description") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <Textarea
                    id="service-description"
                    maxLength={SERVICE_DESC_MAX}
                    rows={3}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description ? (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.description.message}
                    </FieldDescription>
                  ) : null}
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="service-slug">
                    {t("manageServices.form.slug")}{" "}
                    {isRequiredField("slug") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  {modelType === "multi" ? (
                    <div
                      className="border-input flex overflow-hidden rounded-md border shadow-xs"
                      dir="ltr"
                    >
                      <span className="bg-muted text-muted-foreground flex items-center border-e px-3 font-mono text-xs font-bold select-none">
                        {MULTI_MODEL_SLUG_PREFIX}
                      </span>
                      <Input
                        id="service-slug"
                        dir="ltr"
                        className="rounded-none border-0 text-start font-mono shadow-none focus-visible:ring-0"
                        value={getMultiModelSlugSuffix(slugValue)}
                        onChange={(event) => {
                          form.setValue(
                            "slug",
                            buildMultiModelSlugFromSuffix(event.target.value),
                            { shouldValidate: true }
                          );
                        }}
                      />
                    </div>
                  ) : (
                    <Input
                      id="service-slug"
                      dir="ltr"
                      className="text-start font-mono"
                      {...form.register("slug")}
                    />
                  )}
                  <FieldDescription>
                    {modelType === "multi"
                      ? t("manageServices.form.multiSlugHint", {
                          prefix: MULTI_MODEL_SLUG_PREFIX,
                        })
                      : t("manageServices.form.slugHint")}
                  </FieldDescription>
                  {form.formState.errors.slug ? (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.slug.message}
                    </FieldDescription>
                  ) : null}
                </Field>

                <Field className="gap-2">
                  <FieldLabel>
                    {t("manageServices.form.categories")}{" "}
                    {isRequiredField("categoryUuids") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <div className="bg-muted/30 max-h-36 space-y-2.5 overflow-y-auto rounded-xl border p-3">
                    {categoryOptions.length === 0 ? (
                      <p className="text-muted-foreground text-xs">
                        {t("manageServices.form.noCategories")}
                      </p>
                    ) : (
                      categoryOptions.map((category) => (
                        <label
                          key={category.uuid}
                          className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                        >
                          <Checkbox
                            checked={categoryUuids.includes(category.uuid)}
                            onCheckedChange={(checked) =>
                              toggleCategory(category.uuid, checked === true)
                            }
                          />
                          <span>{category.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {form.formState.errors.categoryUuids ? (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.categoryUuids.message}
                    </FieldDescription>
                  ) : null}
                </Field>
              </FieldGroup>

              <FieldGroup className="gap-2">
                <Field className="gap-2">
                  <FieldLabel>
                    {t("manageServices.form.mediaLabel")}{" "}
                    {isRequiredField("imageUrl") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <FieldDescription>
                    {t("manageServices.form.mediaHint")}
                  </FieldDescription>
                  <Controller
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <ServiceMediaField
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.imageUrl?.message}
                      />
                    )}
                  />
                </Field>

                <Field className="gap-2">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <FieldLabel htmlFor="service-credit">
                      {t("manageServices.form.creditHint")}{" "}
                      {isRequiredField("creditHint") ? (
                        <span className="text-destructive">*</span>
                      ) : null}
                    </FieldLabel>
                    <label className="text-primary flex items-center gap-1.5 text-[11px] font-bold">
                      <Checkbox
                        checked={isAutoCredit}
                        onCheckedChange={(checked) =>
                          form.setValue("isAutoCredit", checked === true)
                        }
                      />
                      {t("manageServices.form.autoCredit")}
                    </label>
                  </div>
                  {isAutoCredit ? (
                    <div
                      id="service-credit"
                      className="border-input bg-muted/40 text-foreground flex h-9 items-center rounded-md border px-3 text-sm"
                    >
                      {autoCreditDisplay}
                    </div>
                  ) : (
                    <Input
                      id="service-credit"
                      placeholder={t("manageServices.form.creditPlaceholder")}
                      {...form.register("creditHint")}
                    />
                  )}
                  {form.formState.errors.creditHint ? (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.creditHint.message}
                    </FieldDescription>
                  ) : null}
                </Field>

                <Field className="gap-2">
                  <FieldLabel>
                    {t("manageServices.form.badge")}{" "}
                    {isRequiredField("badge") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <Controller
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SERVICE_BADGE_NONE}>
                            {t("manageServices.form.badgeNone")}
                          </SelectItem>
                          <SelectItem value="popular">
                            {t("manageServices.badges.popular")}
                          </SelectItem>
                          <SelectItem value="most_used">
                            {t("manageServices.badges.most_used")}
                          </SelectItem>
                          <SelectItem value="newest">
                            {t("manageServices.badges.newest")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field className="gap-2">
                  <div className="bg-muted/30 flex items-center justify-between rounded-xl border p-3">
                    <div>
                      <p className="text-sm font-bold">
                        {t("manageServices.form.isActive")}
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        {t("manageServices.form.isActiveHint")}
                      </p>
                    </div>
                    <Switch
                      dir="ltr"
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        form.setValue("isActive", checked)
                      }
                    />
                  </div>
                </Field>

                <Field className="gap-2">
                  <div className="bg-muted/30 flex flex-col gap-3 rounded-xl border p-3">
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold">
                          {t("manageServices.form.searchable")}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          {t("manageServices.form.searchableHint")}
                        </p>
                      </div>
                      <Checkbox
                        checked={searchable}
                        onCheckedChange={(checked) =>
                          form.setValue("searchable", checked === true)
                        }
                        aria-label={t("manageServices.form.searchable")}
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold">
                          {t("manageServices.form.display")}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          {t("manageServices.form.displayHint")}
                        </p>
                      </div>
                      <Checkbox
                        checked={display}
                        onCheckedChange={(checked) =>
                          form.setValue("display", checked === true)
                        }
                        aria-label={t("manageServices.form.display")}
                      />
                    </label>
                  </div>
                </Field>

                {!isActive ? (
                  <Field className="gap-2">
                    <FieldLabel htmlFor="service-reason">
                      {t("manageServices.form.inactiveReason")}{" "}
                      {isRequiredField("inactiveReason") ? (
                        <span className="text-destructive">*</span>
                      ) : null}
                    </FieldLabel>
                    <Input
                      id="service-reason"
                      {...form.register("inactiveReason")}
                    />
                    {form.formState.errors.inactiveReason ? (
                      <FieldDescription className="text-destructive">
                        {form.formState.errors.inactiveReason.message}
                      </FieldDescription>
                    ) : null}
                  </Field>
                ) : null}

                <Field className="gap-2">
                  <FieldLabel htmlFor="service-order">
                    {t("manageServices.form.order")}{" "}
                    {isRequiredField("order") ? (
                      <span className="text-destructive">*</span>
                    ) : null}
                  </FieldLabel>
                  <Input
                    id="service-order"
                    type="number"
                    min={1}
                    {...form.register("order", { valueAsNumber: true })}
                  />
                </Field>

                {modelType === "single" ? (
                  <Field className="gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold">
                      <Checkbox
                        checked={isChildOfMulti}
                        onCheckedChange={(checked) => {
                          form.setValue("isChildOfMulti", checked === true);
                          if (!checked) form.setValue("parentUuid", null);
                        }}
                      />
                      {t("manageServices.form.isChildOfMulti")}
                    </label>
                    {isChildOfMulti ? (
                      <div className="mt-1 space-y-1.5">
                        <Controller
                          control={form.control}
                          name="parentUuid"
                          render={({ field }) => (
                            <ServicePicker
                              services={parentOptions}
                              selectedUuid={field.value ?? undefined}
                              onSelect={field.onChange}
                              placeholder={t(
                                "manageServices.form.parentPlaceholder"
                              )}
                              title={t("manageServices.form.parentTitle")}
                              searchPlaceholder={t(
                                "manageServices.form.parentSearch"
                              )}
                              emptyMessage={t(
                                "manageServices.form.parentEmpty"
                              )}
                              noSearchResultsMessage={t(
                                "manageServices.form.parentNoResults"
                              )}
                            />
                          )}
                        />
                        {form.formState.errors.parentUuid ? (
                          <FieldDescription className="text-destructive">
                            {form.formState.errors.parentUuid.message}
                          </FieldDescription>
                        ) : null}
                      </div>
                    ) : null}
                  </Field>
                ) : null}
              </FieldGroup>
            </div>

            {modelType === "multi" ? (
              <div className="space-y-2 rounded-2xl border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold">
                      {t("manageServices.form.submodels")}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {t("manageServices.form.submodelsHint")}
                    </p>
                  </div>
                  <div className="w-full sm:w-72">
                    <ServicePicker
                      services={availableSubmodelOptions}
                      onSelect={handleAddSubmodel}
                      placeholder={t(
                        "manageServices.form.submodelPickerPlaceholder"
                      )}
                      title={t("manageServices.form.submodelPickerTitle")}
                      searchPlaceholder={t(
                        "manageServices.form.submodelPickerSearch"
                      )}
                      emptyMessage={t(
                        "manageServices.form.submodelPickerEmpty"
                      )}
                      noSearchResultsMessage={t(
                        "manageServices.form.submodelPickerNoResults"
                      )}
                      renderTrigger={({ selectedLabel, isOpen, disabled }) => (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            disabled || availableSubmodelOptions.length === 0
                          }
                          className="w-full justify-between"
                          data-state={isOpen ? "open" : "closed"}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <IconPlus className="size-4 shrink-0" />
                            {t("manageServices.form.addSubmodel")}
                          </span>
                          <span className="text-muted-foreground sr-only">
                            {selectedLabel}
                          </span>
                        </Button>
                      )}
                    />
                  </div>
                </div>

                {submodels.length === 0 ? (
                  <p className="text-muted-foreground text-xs">
                    {t("manageServices.form.noSubmodels")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {submodels.map((sub) => (
                      <div
                        key={sub.uuid}
                        className="bg-muted/20 flex items-center justify-between gap-2 rounded-xl border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {sub.name}
                          </p>
                          <p
                            className="text-muted-foreground truncate font-mono text-[11px]"
                            dir="ltr"
                          >
                            {sub.slug}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive shrink-0"
                          onClick={() =>
                            setSubmodels((prev) =>
                              prev.filter((item) => item.uuid !== sub.uuid)
                            )
                          }
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <DialogFooter className="grid grid-cols-2 gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("manageServices.form.cancel")}
              </Button>
              <Button type="submit">{t("manageServices.form.submit")}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
