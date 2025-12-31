import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { memo, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  UserCreditsQueryParams,
  CreditType,
  PackageType,
  CreditStatus,
} from "../types";
import { Trash } from "lucide-react";

const filterSchema = z.object({
  phoneNumber: z.string().min(1, "شماره تلفن الزامی است"),
  packageType: z
    .enum(["SUBSCRIPTION", "SUBSCRIPTION-TRANSFERED", "PERMANENT"])
    .optional(),
  type: z.enum(["PURCHASE", "GIFT", "REFERRAL", "SYSTEM", "ADMIN"]).optional(),
  status: z.enum(["active", "used", "expired"]).optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

type UserCreditsFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (filters: UserCreditsQueryParams) => void;
  initialFilters?: UserCreditsQueryParams;
};

export const UserCreditsFilterDialog = memo(function UserCreditsFilterDialog({
  open,
  onOpenChange,
  onFilter,
  initialFilters,
}: UserCreditsFilterDialogProps) {
  const { t } = useTranslation("common");

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      phoneNumber: initialFilters?.phoneNumber || "",
      packageType: initialFilters?.packageType as PackageType | undefined,
      type: initialFilters?.type,
      status: initialFilters?.status,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        phoneNumber: initialFilters?.phoneNumber || "",
        packageType: initialFilters?.packageType,
        type: initialFilters?.type,
        status: initialFilters?.status,
      });
    }
  }, [open, initialFilters, form]);

  const handleReset = () => {
    form.reset({
      phoneNumber: "",
      packageType: undefined,
      type: undefined,
      status: undefined,
    });
  };

  const onSubmit: SubmitHandler<FilterFormData> = (data) => {
    // Check if main filters changed
    const phoneChanged =
      data.phoneNumber !== (initialFilters?.phoneNumber || "");
    const packageTypeChanged =
      (data.packageType || "") !== (initialFilters?.packageType || "");
    const typeChanged = (data.type || "") !== (initialFilters?.type || "");
    const statusChanged =
      (data.status || "") !== (initialFilters?.status || "");

    // Only reset page if main filters changed
    const shouldResetPage =
      phoneChanged || packageTypeChanged || typeChanged || statusChanged;

    const filters: UserCreditsQueryParams = {
      phoneNumber: data.phoneNumber,
      page: shouldResetPage ? 1 : initialFilters?.page || 1,
      take: initialFilters?.take || 10,
      packageType: data.packageType,
      type: data.type,
      status: data.status,
    };
    onFilter(filters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="mt-4 flex w-full flex-col gap-6">
              <DialogTitle className="flex w-full items-center justify-between">
                {t("userCredits.filter.title")}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  className="text-destructive bg-accent-danger/10 hover:bg-accent-danger/20 h-8"
                  title={t("userCredits.filter.reset")}
                >
                  <Trash className="size-4" />
                  پاک کردن فیلترها
                </Button>
              </DialogTitle>
              <DialogDescription>
                {t("userCredits.filter.description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="phoneNumber">
                {t("userCredits.filter.phoneNumber")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="phoneNumber"
                type="tel"
                dir="ltr"
                className="text-left"
                {...form.register("phoneNumber")}
                placeholder="09123456789"
                disabled={form.formState.isSubmitting}
              />
              {form.formState.errors.phoneNumber && (
                <FieldDescription className="text-destructive">
                  {form.formState.errors.phoneNumber.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="packageType">
                {t("userCredits.filter.packageType")}
              </FieldLabel>
              <Select
                value={form.watch("packageType") || "all"}
                onValueChange={(value) =>
                  form.setValue(
                    "packageType",
                    value === "all" ? undefined : (value as PackageType)
                  )
                }
                disabled={form.formState.isSubmitting}
              >
                <SelectTrigger id="packageType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("userCredits.allPackageTypes")}
                  </SelectItem>
                  <SelectItem value="SUBSCRIPTION">
                    {t("userCredits.packageTypes.subscription")}
                  </SelectItem>
                  <SelectItem value="SUBSCRIPTION-TRANSFERED">
                    {t("userCredits.packageTypes.transferred")}
                  </SelectItem>
                  <SelectItem value="PERMANENT">
                    {t("userCredits.packageTypes.permanent")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="type">
                {t("userCredits.filter.type")}
              </FieldLabel>
              <Select
                value={form.watch("type") || "all"}
                onValueChange={(value) =>
                  form.setValue(
                    "type",
                    value === "all" ? undefined : (value as CreditType)
                  )
                }
                disabled={form.formState.isSubmitting}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("userCredits.allTypes")}
                  </SelectItem>
                  <SelectItem value="PURCHASE">
                    {t("userCredits.types.purchase")}
                  </SelectItem>
                  <SelectItem value="GIFT">
                    {t("userCredits.types.gift")}
                  </SelectItem>
                  <SelectItem value="REFERRAL">
                    {t("userCredits.types.referral")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="status">
                {t("userCredits.filter.status")}
              </FieldLabel>
              <Select
                value={form.watch("status") || "all"}
                onValueChange={(value) =>
                  form.setValue(
                    "status",
                    value === "all" ? undefined : (value as CreditStatus)
                  )
                }
                disabled={form.formState.isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("userCredits.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("userCredits.statuses.active")}
                  </SelectItem>
                  <SelectItem value="used">
                    {t("userCredits.statuses.used")}
                  </SelectItem>
                  <SelectItem value="expired">
                    {t("userCredits.statuses.expired")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              {t("userCredits.filter.cancel")}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {t("userCredits.filter.apply")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
