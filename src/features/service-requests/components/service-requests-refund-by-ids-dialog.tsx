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
import { Textarea } from "@/components/ui/textarea";
import { useRefundServiceRequestsByIds } from "../hooks/use-service-requests";

const refundByIdsSchema = z.object({
  reason: z.string().trim().min(1, "دلیل ریفاند الزامی است"),
});

type RefundByIdsFormData = z.infer<typeof refundByIdsSchema>;

type ServiceRequestsRefundByIdsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestUuids: string[];
  onSuccess?: () => void;
};

export const ServiceRequestsRefundByIdsDialog = memo(
  function ServiceRequestsRefundByIdsDialog({
    open,
    onOpenChange,
    requestUuids,
    onSuccess,
  }: ServiceRequestsRefundByIdsDialogProps) {
    const { t } = useTranslation("common");
    const refundByIds = useRefundServiceRequestsByIds();

    const form = useForm<RefundByIdsFormData>({
      resolver: zodResolver(refundByIdsSchema),
      defaultValues: {
        reason: "",
      },
    });

    useEffect(() => {
      if (open) {
        form.reset({ reason: "" });
      }
    }, [open, form]);

    const onSubmit: SubmitHandler<RefundByIdsFormData> = async (data) => {
      await refundByIds.mutateAsync({
        requestUuids,
        reason: data.reason,
      });
      onSuccess?.();
      onOpenChange(false);
    };

    const isLoading = refundByIds.isPending;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("serviceRequests.refund.byIds.title")}</DialogTitle>
            <DialogDescription>
              {t("serviceRequests.refund.byIds.description", {
                count: requestUuids.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="refundByIdsReason">
                  {t("serviceRequests.refund.reason")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="refundByIdsReason"
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
              <Button
                type="submit"
                disabled={isLoading || requestUuids.length === 0}
              >
                {isLoading && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("serviceRequests.refund.byIds.submit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
