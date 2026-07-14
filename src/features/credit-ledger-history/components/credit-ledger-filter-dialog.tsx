import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trash } from "lucide-react";
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
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CREDIT_LEDGER_DEFAULT_LIMIT,
  CREDIT_LEDGER_PAGE_SIZES,
  CREDIT_LEDGER_STATUS_OPTIONS,
  CREDIT_LEDGER_TYPE_OPTIONS,
} from "../constants";
import type {
  CreditLedgerQueryParams,
  CreditLedgerStatus,
  CreditLedgerType,
} from "../types";
import { getLedgerTypeFilterLabel } from "../utils/credit-ledger.helpers";

const filterSchema = z.object({
  phoneNumber: z.string().min(1, "شماره تلفن الزامی است"),
  type: z
    .enum([
      "purchase",
      "usage",
      "refund",
      "gift",
      "transfer",
      "admin",
      "expire",
      "inventory",
    ])
    .optional(),
  status: z.enum(["pending", "success", "failed", "reversed"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().positive(),
});

type FilterFormData = z.infer<typeof filterSchema>;

type CreditLedgerFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (filters: CreditLedgerQueryParams) => void;
  initialFilters?: CreditLedgerQueryParams;
};

export const CreditLedgerFilterDialog = memo(function CreditLedgerFilterDialog({
  open,
  onOpenChange,
  onFilter,
  initialFilters,
}: CreditLedgerFilterDialogProps) {
  const { t } = useTranslation("common");

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      phoneNumber: initialFilters?.phoneNumber || "",
      type: initialFilters?.type !== "all" ? initialFilters?.type : undefined,
      status:
        initialFilters?.status !== "all" ? initialFilters?.status : undefined,
      from: initialFilters?.from || "",
      to: initialFilters?.to || "",
      limit: initialFilters?.limit || CREDIT_LEDGER_DEFAULT_LIMIT,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        phoneNumber: initialFilters?.phoneNumber || "",
        type: initialFilters?.type !== "all" ? initialFilters?.type : undefined,
        status:
          initialFilters?.status !== "all" ? initialFilters?.status : undefined,
        from: initialFilters?.from || "",
        to: initialFilters?.to || "",
        limit: initialFilters?.limit || CREDIT_LEDGER_DEFAULT_LIMIT,
      });
    }
  }, [open, initialFilters, form]);

  const handleReset = () => {
    form.reset({
      phoneNumber: "",
      type: undefined,
      status: undefined,
      from: "",
      to: "",
      limit: CREDIT_LEDGER_DEFAULT_LIMIT,
    });
  };

  const onSubmit: SubmitHandler<FilterFormData> = (data) => {
    const currentType = data.type || "all";
    const initialType = initialFilters?.type || "all";
    const currentStatus = data.status || "all";
    const initialStatus = initialFilters?.status || "all";

    const shouldResetPage =
      data.phoneNumber !== (initialFilters?.phoneNumber || "") ||
      currentType !== initialType ||
      currentStatus !== initialStatus ||
      (data.from || "") !== (initialFilters?.from || "") ||
      (data.to || "") !== (initialFilters?.to || "") ||
      data.limit !== (initialFilters?.limit || CREDIT_LEDGER_DEFAULT_LIMIT);

    onFilter({
      phoneNumber: data.phoneNumber,
      page: shouldResetPage ? 1 : initialFilters?.page || 1,
      limit: data.limit,
      type:
        currentType === "all" ? undefined : (currentType as CreditLedgerType),
      status:
        currentStatus === "all"
          ? undefined
          : (currentStatus as CreditLedgerStatus),
      from: data.from || undefined,
      to: data.to || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mt-4 flex w-full flex-col gap-4">
            <DialogTitle className="flex w-full items-center justify-between">
              {t("creditLedgerHistory.filter.title")}
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="text-destructive bg-accent-danger/10 hover:bg-accent-danger/20 h-8"
                title={t("creditLedgerHistory.filter.reset")}
              >
                <Trash className="size-4" />
                {t("creditLedgerHistory.filter.reset")}
              </Button>
            </DialogTitle>
            <DialogDescription>
              {t("creditLedgerHistory.filter.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="phoneNumber">
                {t("creditLedgerHistory.filter.phoneNumber")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="phoneNumber"
                type="tel"
                dir="ltr"
                autoFocus
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

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="type">
                  {t("creditLedgerHistory.filter.type")}
                </FieldLabel>
                <Select
                  value={form.watch("type") || "all"}
                  onValueChange={(value) =>
                    form.setValue(
                      "type",
                      value === "all" ? undefined : (value as CreditLedgerType)
                    )
                  }
                  disabled={form.formState.isSubmitting}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("creditLedgerHistory.filter.allTypes")}
                    </SelectItem>
                    {CREDIT_LEDGER_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getLedgerTypeFilterLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">
                  {t("creditLedgerHistory.filter.status")}
                </FieldLabel>
                <Select
                  value={form.watch("status") || "all"}
                  onValueChange={(value) =>
                    form.setValue(
                      "status",
                      value === "all"
                        ? undefined
                        : (value as CreditLedgerStatus)
                    )
                  }
                  disabled={form.formState.isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("creditLedgerHistory.filter.allStatuses")}
                    </SelectItem>
                    {CREDIT_LEDGER_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`creditLedgerHistory.statuses.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="from">
                  {t("creditLedgerHistory.filter.dateFrom")}
                </FieldLabel>
                <PersianDateInput
                  id="from"
                  value={form.watch("from")}
                  onChange={(value) => form.setValue("from", value || "")}
                  placeholder={t(
                    "creditLedgerHistory.filter.dateFromPlaceholder"
                  )}
                  disabled={form.formState.isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="to">
                  {t("creditLedgerHistory.filter.dateTo")}
                </FieldLabel>
                <PersianDateInput
                  id="to"
                  value={form.watch("to")}
                  onChange={(value) => form.setValue("to", value || "")}
                  placeholder={t(
                    "creditLedgerHistory.filter.dateToPlaceholder"
                  )}
                  disabled={form.formState.isSubmitting}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                {t("creditLedgerHistory.filter.rowsPerPage")}
              </FieldLabel>
              <div className="bg-muted grid grid-cols-3 gap-1 rounded-xl p-1">
                {CREDIT_LEDGER_PAGE_SIZES.map((size) => {
                  const isActive = form.watch("limit") === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => form.setValue("limit", size)}
                      disabled={form.formState.isSubmitting}
                      className={
                        isActive
                          ? "bg-background text-primary rounded-lg py-1.5 text-[10px] font-black shadow-sm"
                          : "text-muted-foreground hover:text-foreground rounded-lg py-1.5 text-[10px] font-black transition-all"
                      }
                    >
                      {t("creditLedgerHistory.filter.rowsOption", {
                        count: size,
                      })}
                    </button>
                  );
                })}
              </div>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              {t("creditLedgerHistory.filter.cancel")}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {t("creditLedgerHistory.filter.apply")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
