import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { memo, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { Textarea } from "@/components/ui/textarea";
import { useRefundServiceRequestsByRange } from "../hooks/use-service-requests";

const refundByRangeSchema = z.object({
  dateFrom: z.string().min(1, "تاریخ شروع الزامی است"),
  dateTo: z.string().min(1, "تاریخ پایان الزامی است"),
  userUuid: z.string().optional(),
  reason: z.string().trim().min(1, "دلیل ریفاند الزامی است"),
});

type RefundByRangeFormData = z.infer<typeof refundByRangeSchema>;

type ServiceRequestsRefundByRangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const toDateStartISO = (dateString: string): string => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const toDateEndISO = (dateString: string): string => {
  const date = new Date(dateString);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

export const ServiceRequestsRefundByRangeDialog = memo(
  function ServiceRequestsRefundByRangeDialog({
    open,
    onOpenChange,
    onSuccess,
  }: ServiceRequestsRefundByRangeDialogProps) {
    const { t } = useTranslation("common");
    const refundByRange = useRefundServiceRequestsByRange();

    const form = useForm<RefundByRangeFormData>({
      resolver: zodResolver(refundByRangeSchema),
      defaultValues: {
        dateFrom: "",
        dateTo: "",
        userUuid: "",
        reason: "",
      },
    });

    useEffect(() => {
      if (open) {
        form.reset({
          dateFrom: "",
          dateTo: "",
          userUuid: "",
          reason: "",
        });
      }
    }, [open, form]);

    const onSubmit: SubmitHandler<RefundByRangeFormData> = async (data) => {
      await refundByRange.mutateAsync({
        dateFrom: toDateStartISO(data.dateFrom),
        dateTo: toDateEndISO(data.dateTo),
        userUuid: data.userUuid?.trim() || undefined,
        reason: data.reason,
      });
      onSuccess?.();
      onOpenChange(false);
    };

    const isLoading = refundByRange.isPending;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("serviceRequests.refund.byRange.title")}
            </DialogTitle>
            <DialogDescription>
              {t("serviceRequests.refund.byRange.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="refundDateFrom">
                    {t("serviceRequests.refund.byRange.dateFrom")}{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <PersianDateInput
                    id="refundDateFrom"
                    value={form.watch("dateFrom")}
                    onChange={(value) =>
                      form.setValue("dateFrom", value || "", {
                        shouldValidate: true,
                      })
                    }
                    placeholder={t(
                      "serviceRequests.filter.dateFromPlaceholder"
                    )}
                    disabled={isLoading}
                  />
                  {form.formState.errors.dateFrom && (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.dateFrom.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="refundDateTo">
                    {t("serviceRequests.refund.byRange.dateTo")}{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <PersianDateInput
                    id="refundDateTo"
                    value={form.watch("dateTo")}
                    onChange={(value) =>
                      form.setValue("dateTo", value || "", {
                        shouldValidate: true,
                      })
                    }
                    placeholder={t("serviceRequests.filter.dateToPlaceholder")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.dateTo && (
                    <FieldDescription className="text-destructive">
                      {form.formState.errors.dateTo.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="refundUserUuid">
                  {t("serviceRequests.refund.byRange.userUuid")}
                </FieldLabel>
                <Input
                  id="refundUserUuid"
                  dir="ltr"
                  className="text-left"
                  {...form.register("userUuid")}
                  placeholder={t(
                    "serviceRequests.refund.byRange.userUuidPlaceholder"
                  )}
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="refundByRangeReason">
                  {t("serviceRequests.refund.reason")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="refundByRangeReason"
                  rows={4}
                  {...form.register("reason")}
                  placeholder={t("serviceRequests.refund.reasonPlaceholder")}
                  disabled={isLoading}
                />
                {form.formState.errors.reason && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.reason.message}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("serviceRequests.refund.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("serviceRequests.refund.byRange.submit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
