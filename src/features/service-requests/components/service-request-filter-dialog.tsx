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
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceRequestsQueryParams, ServiceRequestStatus } from "../types";
import { Trash } from "lucide-react";

const filterSchema = z.object({
  phoneNumber: z.string().min(1, "شماره تلفن الزامی است"),
  status: z.enum(["PENDING", "PROCESSING", "SUCCESS", "FAILED"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

type ServiceRequestFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (filters: ServiceRequestsQueryParams) => void;
  initialFilters?: ServiceRequestsQueryParams;
};

export const ServiceRequestFilterDialog = memo(
  function ServiceRequestFilterDialog({
    open,
    onOpenChange,
    onFilter,
    initialFilters,
  }: ServiceRequestFilterDialogProps) {
    const { t } = useTranslation("common");

    const form = useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
      defaultValues: {
        phoneNumber: initialFilters?.phoneNumber || "",
        status:
          initialFilters?.status !== "all" ? initialFilters?.status : undefined,
        dateFrom: initialFilters?.dateFrom || "",
        dateTo: initialFilters?.dateTo || "",
      },
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
      if (open) {
        form.reset({
          phoneNumber: initialFilters?.phoneNumber || "",
          status:
            initialFilters?.status !== "all"
              ? initialFilters?.status
              : undefined,
          dateFrom: initialFilters?.dateFrom || "",
          dateTo: initialFilters?.dateTo || "",
        });
      }
    }, [open, initialFilters, form]);

    const handleReset = () => {
      form.reset({
        phoneNumber: "",
        status: undefined,
        dateFrom: "",
        dateTo: "",
      });
    };

    const onSubmit: SubmitHandler<FilterFormData> = (data) => {
      // Normalize status values for comparison
      const currentStatus = data.status || "all";
      const initialStatus = initialFilters?.status || "all";

      // Check if main filters changed (phoneNumber, status, dates)
      const phoneChanged =
        data.phoneNumber !== (initialFilters?.phoneNumber || "");
      const statusChanged = currentStatus !== initialStatus;
      const dateFromChanged =
        (data.dateFrom || "") !== (initialFilters?.dateFrom || "");
      const dateToChanged =
        (data.dateTo || "") !== (initialFilters?.dateTo || "");

      // Only reset page if main filters changed
      const shouldResetPage =
        phoneChanged || statusChanged || dateFromChanged || dateToChanged;

      const filters: ServiceRequestsQueryParams = {
        phoneNumber: data.phoneNumber,
        page: shouldResetPage ? 1 : initialFilters?.page || 1,
        take: initialFilters?.take || 10,
        status:
          currentStatus === "all"
            ? undefined
            : (currentStatus as ServiceRequestStatus),
        dateFrom: data.dateFrom || undefined,
        dateTo: data.dateTo || undefined,
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
                  {t("serviceRequests.filter.title")}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="text-destructive bg-accent-danger/10 hover:bg-accent-danger/20 h-8"
                    title={t("serviceRequests.filter.reset")}
                  >
                    <Trash className="size-4" />
                    پاک کردن فیلترها
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  {t("serviceRequests.filter.description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="phoneNumber">
                  {t("serviceRequests.filter.phoneNumber")}{" "}
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
                <FieldLabel htmlFor="status">
                  {t("serviceRequests.filter.status")}
                </FieldLabel>
                <Select
                  value={form.watch("status") || "all"}
                  onValueChange={(value) =>
                    form.setValue(
                      "status",
                      value === "all"
                        ? undefined
                        : (value as ServiceRequestStatus)
                    )
                  }
                  disabled={form.formState.isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("serviceRequests.allStatuses")}
                    </SelectItem>
                    <SelectItem value="PENDING">
                      {t("serviceRequests.statuses.pending")}
                    </SelectItem>
                    <SelectItem value="PROCESSING">
                      {t("serviceRequests.statuses.processing")}
                    </SelectItem>
                    <SelectItem value="SUCCESS">
                      {t("serviceRequests.statuses.success")}
                    </SelectItem>
                    <SelectItem value="FAILED">
                      {t("serviceRequests.statuses.failed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="dateFrom">
                    {t("serviceRequests.filter.dateFrom")}
                  </FieldLabel>
                  <PersianDateInput
                    id="dateFrom"
                    value={form.watch("dateFrom")}
                    onChange={(value) => form.setValue("dateFrom", value || "")}
                    placeholder={t(
                      "serviceRequests.filter.dateFromPlaceholder"
                    )}
                    disabled={form.formState.isSubmitting}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="dateTo">
                    {t("serviceRequests.filter.dateTo")}
                  </FieldLabel>
                  <PersianDateInput
                    id="dateTo"
                    value={form.watch("dateTo")}
                    onChange={(value) => form.setValue("dateTo", value || "")}
                    placeholder={t("serviceRequests.filter.dateToPlaceholder")}
                    disabled={form.formState.isSubmitting}
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                {t("serviceRequests.filter.cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {t("serviceRequests.filter.apply")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
