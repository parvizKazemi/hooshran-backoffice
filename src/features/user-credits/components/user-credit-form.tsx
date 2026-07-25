import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CreateUserCreditInput,
  UpdateUserCreditInput,
  useCreateUserCredit,
  useUpdateUserCredit,
} from "../hooks/use-user-credits";
import {
  EditableCreditStatus,
  EditableCreditStatusSchema,
  UserCredit,
} from "../types";
import { usePackages } from "../../packages/hooks/use-packages";
import { Package } from "../../packages/types";
import { PackageSelectorDialog } from "./package-selector-dialog";
import {
  EDITABLE_CREDIT_STATUSES,
  normalizeCreditStatus,
} from "../utils/credit-status.helpers";

const createCreditSchema = z.object({
  phoneNumber: z.string().min(1, "شماره تلفن الزامی است"),
  creditAmount: z.number().min(0, "مقدار اعتبار باید بیشتر از صفر باشد"),
  creditBalance: z.number().min(0, "موجودی اعتبار باید بیشتر از صفر باشد"),
  packageUuid: z.string().min(1, "انتخاب پکیج الزامی است"),
  expiresAt: z.string().min(1, "تاریخ انقضا الزامی است"),
  pricePaid: z.number().min(0, "مبلغ پرداختی باید بیشتر از صفر باشد"),
});

const updateCreditSchema = z.object({
  creditBalance: z.number().min(0, "موجودی اعتبار باید بیشتر از صفر باشد"),
  status: EditableCreditStatusSchema,
  cancelationReason: z.string().optional(),
  expiresAt: z.string().min(1, "تاریخ انقضا الزامی است"),
});

type CreateCreditFormData = z.infer<typeof createCreditSchema>;
type UpdateCreditFormData = z.infer<typeof updateCreditSchema>;

type UserCreditFormProps = {
  credit?: UserCredit;
  phoneNumber?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function toDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toEditableStatus(status: string | undefined): EditableCreditStatus {
  const normalized = normalizeCreditStatus(status);
  if (
    normalized === "active" ||
    normalized === "expired" ||
    normalized === "transferred" ||
    normalized === "canceled"
  ) {
    return normalized;
  }
  return "active";
}

function convertDateToISO(dateString: string, previousIso?: string): string {
  if (!dateString) return "";

  const [rawYear, rawMonth, rawDay] = dateString.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return "";
  }

  const date = new Date(year, month - 1, day);

  if (previousIso) {
    const previous = new Date(previousIso);
    if (!Number.isNaN(previous.getTime())) {
      date.setHours(
        previous.getHours(),
        previous.getMinutes(),
        previous.getSeconds(),
        previous.getMilliseconds()
      );
      return date.toISOString();
    }
  }

  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export const UserCreditForm = memo(function UserCreditForm({
  credit,
  phoneNumber: initialPhoneNumber,
  onSuccess,
  onCancel,
}: UserCreditFormProps) {
  const { t } = useTranslation("common");
  const isEditing = !!credit;
  const createCredit = useCreateUserCredit();
  const updateCredit = useUpdateUserCredit();
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);

  const { data: packagesData, isLoading: packagesLoading } = usePackages({
    limit: 100,
  });
  const packages = packagesData?.data || [];

  const createForm = useForm<CreateCreditFormData>({
    resolver: zodResolver(createCreditSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || "",
      creditAmount: 0,
      creditBalance: 0,
      packageUuid: "",
      expiresAt: "",
      pricePaid: 0,
    },
  });

  const packageUuid = createForm.watch("packageUuid");
  const selectedPackage = useMemo(() => {
    return packages.find((pkg) => pkg.uuid === packageUuid);
  }, [packageUuid, packages]);

  const pricePaidValue = createForm.watch("pricePaid");
  const formattedPricePaid = useMemo(() => {
    const numericValue = Number(pricePaidValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      return numericValue.toLocaleString();
    }
    return null;
  }, [pricePaidValue]);

  const updateForm = useForm<UpdateCreditFormData>({
    resolver: zodResolver(updateCreditSchema),
    defaultValues: {
      creditBalance: credit?.creditBalance ?? 0,
      status: toEditableStatus(credit?.status),
      cancelationReason: credit?.cancelationReason ?? "",
      expiresAt: toDateInputValue(credit?.expiresAt),
    },
  });

  const watchedStatus = updateForm.watch("status");
  const showCancelReason = watchedStatus === "canceled";

  useEffect(() => {
    if (credit) {
      updateForm.reset({
        creditBalance: credit.creditBalance,
        status: toEditableStatus(credit.status),
        cancelationReason: credit.cancelationReason ?? "",
        expiresAt: toDateInputValue(credit.expiresAt),
      });
    }
  }, [credit, updateForm]);

  const handlePackageSelect = (pkg: Package) => {
    createForm.setValue("packageUuid", pkg.uuid, { shouldValidate: true });
    createForm.setValue("creditAmount", pkg.creditAmount, {
      shouldValidate: true,
    });
    createForm.setValue("creditBalance", pkg.creditAmount, {
      shouldValidate: true,
    });
    createForm.setValue("pricePaid", pkg.price, { shouldValidate: true });
  };

  const onCreateSubmit: SubmitHandler<CreateCreditFormData> = async (data) => {
    const payload: CreateUserCreditInput = {
      creditAmount: data.creditAmount,
      creditBalance: data.creditBalance,
      packageUuid: data.packageUuid,
      packageType: "SUBSCRIPTION",
      type: "ADMIN",
      expiresAt: convertDateToISO(data.expiresAt),
      pricePaid: data.pricePaid,
    };

    await createCredit.mutateAsync({
      phoneNumber: data.phoneNumber,
      data: payload,
    });
    onSuccess?.();
    createForm.reset();
  };

  const onUpdateSubmit: SubmitHandler<UpdateCreditFormData> = async (data) => {
    if (!credit) return;

    if (data.status === "canceled" && !data.cancelationReason?.trim()) {
      toast.warning("لطفاً علت کنسل شدن اشتراک را وارد کنید.");
      return;
    }

    const payload: UpdateUserCreditInput = {
      creditBalance: data.creditBalance,
      status: data.status,
      cancelationReason:
        data.status === "canceled"
          ? data.cancelationReason?.trim() || null
          : null,
      expiresAt: convertDateToISO(data.expiresAt, credit.expiresAt),
    };

    await updateCredit.mutateAsync({
      creditUuid: credit.uuid,
      data: payload,
    });
    onSuccess?.();
  };

  const isLoading = createCredit.isPending || updateCredit.isPending;

  if (isEditing) {
    return (
      <form
        onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
        className="space-y-6"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="creditAmount">
              {t("userCredits.form.creditAmount")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="creditAmount"
              className="cursor-not-allowed text-left"
              dir="ltr"
              type="number"
              value={credit.creditAmount}
              disabled
              readOnly
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="creditBalance">
              {t("userCredits.form.creditBalance")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="creditBalance"
              className="text-left"
              dir="ltr"
              type="text"
              min="0"
              {...updateForm.register("creditBalance", {
                valueAsNumber: true,
              })}
              disabled={isLoading}
            />
            {updateForm.formState.errors.creditBalance && (
              <FieldDescription className="text-destructive">
                {updateForm.formState.errors.creditBalance.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="status">
              {t("userCredits.form.status")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={updateForm.control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as EditableCreditStatus)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITABLE_CREDIT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`userCredits.statuses.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <div
            id="cancellation-reason-container"
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              showCancelReason
                ? "animate-in fade-in slide-in-from-top-2 max-h-40 opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            )}
            aria-hidden={!showCancelReason}
          >
            <Field>
              <FieldLabel htmlFor="cancelationReason">
                {t("userCredits.form.cancelationReason")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="cancelationReason"
                rows={2}
                dir="rtl"
                className="resize-none text-right"
                placeholder={t("userCredits.form.cancelationReasonPlaceholder")}
                {...updateForm.register("cancelationReason")}
                disabled={isLoading || !showCancelReason}
              />
            </Field>
          </div>

          <div className="space-y-4 rounded-2xl border p-4">
            <h3 className="text-muted-foreground text-[10px] font-black tracking-wider uppercase">
              {t("userCredits.form.readOnlyFields")}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("userCredits.form.phoneNumber")}</FieldLabel>
                <Input
                  value={credit.userPhoneNumber}
                  disabled
                  className="text-left"
                  dir="ltr"
                />
              </Field>
              <Field>
                <FieldLabel>{t("userCredits.form.package")}</FieldLabel>
                <Input
                  value={credit.packageUuid}
                  disabled
                  className="text-left"
                  dir="ltr"
                />
              </Field>
              <Field>
                <FieldLabel>{t("userCredits.form.type")}</FieldLabel>
                <Input value={credit.type} disabled />
              </Field>
              <Field>
                <FieldLabel>{t("userCredits.form.packageType")}</FieldLabel>
                <Input value={credit.packageType} disabled />
              </Field>
              <Field>
                <FieldLabel>
                  {t("userCredits.form.expiresAt")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={updateForm.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <PersianDateInput
                      id="expiresAt"
                      value={field.value || undefined}
                      onChange={(value) => field.onChange(value || "")}
                      placeholder={t("userCredits.form.selectExpiryDate")}
                      disabled={isLoading}
                      className="justify-end text-right font-mono"
                    />
                  )}
                />
                {updateForm.formState.errors.expiresAt && (
                  <FieldDescription className="text-destructive">
                    {updateForm.formState.errors.expiresAt.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel>{t("userCredits.form.pricePaid")}</FieldLabel>
                <Input
                  value={credit.pricePaid.toLocaleString()}
                  disabled
                  className="text-left"
                  dir="ltr"
                />
              </Field>
            </div>
          </div>
        </FieldGroup>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            {t("userCredits.form.saveChanges")}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {t("userCredits.form.cancel")}
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={createForm.handleSubmit(onCreateSubmit)}
      className="space-y-6"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phoneNumber">
            {t("userCredits.form.phoneNumber")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="phoneNumber"
            type="tel"
            dir="ltr"
            className="text-left"
            {...createForm.register("phoneNumber")}
            placeholder="09123456789"
            disabled={isLoading || !!initialPhoneNumber}
          />
          {createForm.formState.errors.phoneNumber && (
            <FieldDescription className="text-destructive">
              {createForm.formState.errors.phoneNumber.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="packageUuid">
            {t("userCredits.form.package")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="packageUuid"
              value={
                selectedPackage
                  ? `${selectedPackage.name} - ${selectedPackage.creditAmount} ${t("packages.credit")} - ${selectedPackage.price.toLocaleString()} ${t("packages.rial")}`
                  : ""
              }
              placeholder={t("userCredits.form.selectPackage")}
              disabled
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPackageDialogOpen(true)}
              disabled={isLoading || packagesLoading}
            >
              {selectedPackage
                ? t("userCredits.form.changePackage")
                : t("userCredits.form.selectPackage")}
            </Button>
          </div>
          {createForm.formState.errors.packageUuid && (
            <FieldDescription className="text-destructive">
              {createForm.formState.errors.packageUuid.message}
            </FieldDescription>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4">
          <Field>
            <FieldLabel htmlFor="pricePaid">
              {t("userCredits.form.pricePaid")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="pricePaid"
              className="text-left"
              dir="ltr"
              min="0"
              type="number"
              {...createForm.register("pricePaid", {
                valueAsNumber: true,
              })}
              disabled={isLoading || !selectedPackage?.price}
            />
            {createForm.formState.errors.pricePaid && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.pricePaid.message}
              </FieldDescription>
            )}
            {formattedPricePaid && (
              <FieldDescription className="text-muted-foreground text-left text-xs">
                {formattedPricePaid} {t("packages.rial")}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="expiresAt">
              {t("userCredits.form.expiresAt")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <PersianDateInput
              id="expiresAt"
              value={createForm.watch("expiresAt")}
              onChange={(value) =>
                createForm.setValue("expiresAt", value || "", {
                  shouldValidate: true,
                })
              }
              placeholder={t("userCredits.form.selectExpiryDate")}
              disabled={isLoading}
            />
            {createForm.formState.errors.expiresAt && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.expiresAt.message}
              </FieldDescription>
            )}
          </Field>
        </div>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {t("userCredits.form.createCredit")}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("userCredits.form.cancel")}
          </Button>
        )}
      </div>

      <PackageSelectorDialog
        open={isPackageDialogOpen}
        onOpenChange={setIsPackageDialogOpen}
        packages={packages}
        isLoading={packagesLoading}
        onSelect={handlePackageSelect}
      />
    </form>
  );
});
