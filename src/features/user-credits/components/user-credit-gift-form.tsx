import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  GiftUserCreditInput,
  useGiftUserCredit,
} from "../hooks/use-user-credits";

const giftCreditSchema = z
  .object({
    phoneNumber: z.string().min(1, "شماره تلفن الزامی است"),
    creditAmount: z
      .number()
      .min(0, "مقدار اعتبار نمی‌تواند منفی باشد")
      .optional(),
    expirationExtensionDays: z
      .number()
      .min(0, "تعداد روز تمدید نمی‌تواند منفی باشد")
      .optional(),
  })
  .refine(
    (data) =>
      (data.creditAmount !== undefined && data.creditAmount > 0) ||
      (data.expirationExtensionDays !== undefined &&
        data.expirationExtensionDays > 0),
    {
      message:
        "حداقل یکی از مقدار اعتبار یا تعداد روز تمدید باید بزرگتر از صفر باشد",
      path: ["creditAmount"],
    }
  );

type GiftCreditFormData = z.infer<typeof giftCreditSchema>;

type UserCreditGiftFormProps = {
  phoneNumber?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const UserCreditGiftForm = memo(function UserCreditGiftForm({
  phoneNumber: initialPhoneNumber,
  onSuccess,
  onCancel,
}: UserCreditGiftFormProps) {
  const { t } = useTranslation("common");
  const giftCredit = useGiftUserCredit();

  const form = useForm<GiftCreditFormData>({
    resolver: zodResolver(giftCreditSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || "",
      creditAmount: undefined,
      expirationExtensionDays: undefined,
    },
  });

  const onSubmit: SubmitHandler<GiftCreditFormData> = async (data) => {
    const payload: GiftUserCreditInput = {
      phoneNumber: data.phoneNumber,
      ...(data.creditAmount !== undefined
        ? { creditAmount: data.creditAmount }
        : {}),
      ...(data.expirationExtensionDays !== undefined
        ? { expirationExtensionDays: data.expirationExtensionDays }
        : {}),
    };

    await giftCredit.mutateAsync(payload);
    onSuccess?.();
    form.reset({
      phoneNumber: initialPhoneNumber || "",
      creditAmount: undefined,
      expirationExtensionDays: undefined,
    });
  };

  const isLoading = giftCredit.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="giftPhoneNumber">
            {t("userCredits.form.phoneNumber")}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="giftPhoneNumber"
            type="tel"
            dir="ltr"
            className="text-left"
            {...form.register("phoneNumber")}
            placeholder="09123456789"
            disabled={isLoading || !!initialPhoneNumber}
          />
          {form.formState.errors.phoneNumber && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.phoneNumber.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="giftCreditAmount">
            {t("userCredits.form.giftCreditAmount")}
          </FieldLabel>
          <Input
            id="giftCreditAmount"
            className="text-left"
            dir="ltr"
            type="number"
            min="0"
            {...form.register("creditAmount", {
              setValueAs: (value) =>
                value === "" || value === undefined ? undefined : Number(value),
            })}
            disabled={isLoading}
          />
          {form.formState.errors.creditAmount && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.creditAmount.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="giftExpirationExtensionDays">
            {t("userCredits.form.expirationExtensionDays")}
          </FieldLabel>
          <Input
            id="giftExpirationExtensionDays"
            className="text-left"
            dir="ltr"
            type="number"
            min="0"
            {...form.register("expirationExtensionDays", {
              setValueAs: (value) =>
                value === "" || value === undefined ? undefined : Number(value),
            })}
            disabled={isLoading}
          />
          {form.formState.errors.expirationExtensionDays && (
            <FieldDescription className="text-destructive">
              {form.formState.errors.expirationExtensionDays.message}
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {t("userCredits.form.giftCredit")}
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
});
