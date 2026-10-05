import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateModelDiscount,
  useUpdateModelDiscount,
} from "../hooks/use-model-discounts";
import type {
  ModelDiscount,
  ModelDiscountFormState,
} from "../types";
import {
  buildModelDiscountPayload,
  createInitialModelDiscountForm,
  modelDiscountToFormState,
  validateModelDiscountForm,
} from "../utils/model-discount-form.helpers";

type ServiceOption = {
  uuid: string;
  name: string;
};

type ModelDiscountFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceOption[];
  discount?: ModelDiscount | null;
};

export function ModelDiscountFormDialog({
  open,
  onOpenChange,
  services,
  discount = null,
}: ModelDiscountFormDialogProps) {
  const { t } = useTranslation("common");
  const createDiscount = useCreateModelDiscount();
  const updateDiscount = useUpdateModelDiscount();
  const isEditMode = Boolean(discount);
  const isSaving = createDiscount.isPending || updateDiscount.isPending;
  const formInitKey = useRef("");

  const [form, setForm] = useState<ModelDiscountFormState>(
    createInitialModelDiscountForm
  );

  useEffect(() => {
    if (!open) {
      formInitKey.current = "";
      return;
    }

    const key = discount?.uuid ?? "new";
    if (formInitKey.current === key) return;
    formInitKey.current = key;

    setForm(
      discount
        ? modelDiscountToFormState(discount)
        : createInitialModelDiscountForm()
    );
  }, [discount, open]);

  const setField = <K extends keyof ModelDiscountFormState>(
    key: K,
    value: ModelDiscountFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validationErrorKey = useMemo(
    () => validateModelDiscountForm(form),
    [form]
  );

  const handleSubmit = async () => {
    const errorKey = validateModelDiscountForm(form);
    if (errorKey) return;

    const payload = buildModelDiscountPayload(form);
    if (isEditMode && discount) {
      await updateDiscount.mutateAsync({ uuid: discount.uuid, payload });
    } else {
      await createDiscount.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const selectedServiceLabel = useMemo(
    () => services.find((item) => item.uuid === form.serviceUuid)?.name ?? "",
    [form.serviceUuid, services]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto flex max-h-[95vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:max-w-3xl">
        <DialogHeader className="bg-muted/40 shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg font-bold">
            {isEditMode
              ? t("modelDiscounts.form.editTitle")
              : t("modelDiscounts.form.createTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("modelDiscounts.form.targetService")} *</Label>
              <Select
                value={form.serviceUuid}
                onValueChange={(value) => setField("serviceUuid", value)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue
                    placeholder={t("modelDiscounts.form.targetServicePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.uuid} value={service.uuid}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedServiceLabel ? (
                <p className="text-muted-foreground text-[11px]">
                  {t("modelDiscounts.form.selectedServiceHint", {
                    name: selectedServiceLabel,
                  })}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="model-name">
                {t("modelDiscounts.form.modelName")}
              </Label>
              <Input
                id="model-name"
                value={form.modelName}
                onChange={(event) => setField("modelName", event.target.value)}
                placeholder={t("modelDiscounts.form.modelNamePlaceholder")}
                className="rounded-xl"
              />
              <p className="text-muted-foreground text-[11px]">
                {t("modelDiscounts.form.modelNameHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-percentage">
                {t("modelDiscounts.form.discountPercentage")} *
              </Label>
              <Input
                id="discount-percentage"
                type="number"
                min={1}
                max={100}
                value={form.discountPercentage}
                onChange={(event) =>
                  setField("discountPercentage", Number(event.target.value) || 0)
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-title">{t("modelDiscounts.form.title")}</Label>
              <Input
                id="discount-title"
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder={t("modelDiscounts.form.titlePlaceholder")}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {t("modelDiscounts.form.startsDate")} *
              </Label>
              <PersianDateInput
                value={form.startsDate}
                onChange={(value) => setField("startsDate", value ?? "")}
                placeholder={t("modelDiscounts.form.startsDatePlaceholder")}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {t("modelDiscounts.form.startsTime")}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={5}
                placeholder="00:00"
                value={form.startsTime}
                onChange={(event) =>
                  setField(
                    "startsTime",
                    event.target.value.replace(/[^\d:]/g, "").slice(0, 5)
                  )
                }
                className="rounded-lg text-center font-mono tracking-widest"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {t("modelDiscounts.form.endsDate")} *
              </Label>
              <PersianDateInput
                value={form.endsDate}
                onChange={(value) => setField("endsDate", value ?? "")}
                placeholder={t("modelDiscounts.form.endsDatePlaceholder")}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {t("modelDiscounts.form.endsTime")}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={5}
                placeholder="23:59"
                value={form.endsTime}
                onChange={(event) =>
                  setField(
                    "endsTime",
                    event.target.value.replace(/[^\d:]/g, "").slice(0, 5)
                  )
                }
                className="rounded-lg text-center font-mono tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount-description">
              {t("modelDiscounts.form.description")}
            </Label>
            <Textarea
              id="discount-description"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder={t("modelDiscounts.form.descriptionPlaceholder")}
              className="min-h-20 rounded-xl"
            />
          </div>

          <label className="hover:bg-muted/40 flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <span className="text-sm font-bold">
                {t("modelDiscounts.form.isActive")}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-xs">
                {t("modelDiscounts.form.isActiveHint")}
              </span>
            </div>
            <Switch
              dir="ltr"
              checked={form.isActive}
              onCheckedChange={(checked) => setField("isActive", checked)}
            />
          </label>

          {validationErrorKey ? (
            <p className="text-destructive text-sm">
              {t(`modelDiscounts.errors.${validationErrorKey}`)}
            </p>
          ) : null}
        </div>

        <DialogFooter className="bg-muted/40 shrink-0 border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("modelDiscounts.form.cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconCheck className="size-4" />
            )}
            {t("modelDiscounts.form.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
