import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { memo, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  CreateUserCreditInput,
  UpdateUserCreditInput,
  useCreateUserCredit,
  useUpdateUserCredit,
} from "../hooks/use-user-credits";
import { UserCredit } from "../types";
import { usePackages } from "../../packages/hooks/use-packages";
import { Package } from "../../packages/types";
import { PackageSelectorDialog } from "./package-selector-dialog";

const createCreditSchema = z.object({
  phoneNumber: z.string().min(1, "شماره تلفن الزامی است"),
  creditAmount: z.number().min(0, "مقدار اعتبار باید بیشتر از صفر باشد"),
  creditBalance: z.number().min(0, "موجودی اعتبار باید بیشتر از صفر باشد"),
  packageUuid: z.string().min(1, "انتخاب پکیج الزامی است"),
  expiresAt: z.string().min(1, "تاریخ انقضا الزامی است"),
  pricePaid: z.number().min(0, "مبلغ پرداختی باید بیشتر از صفر باشد"),
});

const updateCreditSchema = z.object({
  creditAmount: z.number().min(0, "مقدار اعتبار باید بیشتر از صفر باشد"),
  creditBalance: z.number().min(0, "موجودی اعتبار باید بیشتر از صفر باشد"),
});

type CreateCreditFormData = z.infer<typeof createCreditSchema>;
type UpdateCreditFormData = z.infer<typeof updateCreditSchema>;

type UserCreditFormProps = {
  credit?: UserCredit;
  phoneNumber?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

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

  // Fetch packages for selector
  const { data: packagesData, isLoading: packagesLoading } = usePackages({
    limit: 100,
  });
  const packages = packagesData?.data || [];

  // Convert ISO datetime to date string (YYYY-MM-DD) for PersianDateInput
  const expiresAtDate = useMemo(() => {
    if (credit?.expiresAt) {
      const date = new Date(credit.expiresAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    return undefined;
  }, [credit?.expiresAt]);

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

  // Get selected package
  const packageUuid = createForm.watch("packageUuid");
  const selectedPackage = useMemo(() => {
    return packages.find((pkg) => pkg.uuid === packageUuid);
  }, [packageUuid, packages]);

  const updateForm = useForm<UpdateCreditFormData>({
    resolver: zodResolver(updateCreditSchema),
    defaultValues: credit
      ? {
          creditAmount: credit.creditAmount,
          creditBalance: credit.creditBalance,
        }
      : {
          creditAmount: 0,
          creditBalance: 0,
        },
  });

  // Reset form when credit changes
  useEffect(() => {
    if (credit) {
      updateForm.reset({
        creditAmount: credit.creditAmount,
        creditBalance: credit.creditBalance,
      });
    }
  }, [credit, updateForm]);

  // Update form fields when package is selected
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

  // Convert date string (YYYY-MM-DD) to ISO datetime string
  const convertDateToISO = (dateString: string): string => {
    if (!dateString) return "";
    // Set time to end of day (23:59:59.999)
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  const onCreateSubmit: SubmitHandler<CreateCreditFormData> = async (data) => {
    const payload: CreateUserCreditInput = {
      creditAmount: data.creditAmount,
      creditBalance: data.creditBalance,
      packageUuid: data.packageUuid,
      packageType: "SUBSCRIPTION",
      type: "PURCHASE",
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

    const payload: UpdateUserCreditInput = {
      creditAmount: data.creditAmount,
      creditBalance: data.creditBalance,
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
              className="text-left"
              dir="ltr"
              type="number"
              min="0"
              {...updateForm.register("creditAmount", {
                valueAsNumber: true,
              })}
              disabled={isLoading}
            />
            {updateForm.formState.errors.creditAmount && (
              <FieldDescription className="text-destructive">
                {updateForm.formState.errors.creditAmount.message}
              </FieldDescription>
            )}
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
              type="number"
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

          {/* Read-only fields */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-muted-foreground text-sm font-semibold">
              {t("userCredits.form.readOnlyFields")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
                <FieldLabel>{t("userCredits.form.pricePaid")}</FieldLabel>
                <Input
                  value={credit.pricePaid.toLocaleString()}
                  disabled
                  className="text-left"
                  dir="ltr"
                />
              </Field>
              <Field>
                <FieldLabel>{t("userCredits.form.expiresAt")}</FieldLabel>
                <PersianDateInput
                  value={expiresAtDate}
                  onChange={() => {}} // Disabled
                  disabled
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

        {/* <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="creditAmount">
              {t("userCredits.form.creditAmount")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="creditAmount"
              className="text-left"
              dir="ltr"
              type="number"
              min="0"
              {...createForm.register("creditAmount", {
                valueAsNumber: true,
              })}
              disabled={isLoading || !!selectedPackage}
            />
            {createForm.formState.errors.creditAmount && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.creditAmount.message}
              </FieldDescription>
            )}
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
              type="number"
              min="0"
              {...createForm.register("creditBalance", {
                valueAsNumber: true,
              })}
              disabled={isLoading || !!selectedPackage}
            />
            {createForm.formState.errors.creditBalance && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.creditBalance.message}
              </FieldDescription>
            )}
          </Field>
        </div> */}

        <div className="grid grid-cols-1 gap-4">
          {/* <Field>
            <FieldLabel htmlFor="pricePaid">
              {t("userCredits.form.pricePaid")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="pricePaid"
              className="text-left"
              dir="ltr"
              type="number"
              min="0"
              {...createForm.register("pricePaid", {
                valueAsNumber: true,
              })}
              disabled={isLoading || !!selectedPackage}
            />
            {createForm.formState.errors.pricePaid && (
              <FieldDescription className="text-destructive">
                {createForm.formState.errors.pricePaid.message}
              </FieldDescription>
            )}
          </Field> */}

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
