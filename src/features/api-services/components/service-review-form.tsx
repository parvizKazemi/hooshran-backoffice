import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateServiceReview } from "../hooks/use-service-reviews";
import {
  ServiceReview,
  updateServiceReviewSchema,
  UpdateServiceReviewInput,
} from "../types";

type ServiceReviewFormProps = {
  review: ServiceReview;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ServiceReviewForm({
  review,
  onSuccess,
  onCancel,
}: ServiceReviewFormProps) {
  const updateReview = useUpdateServiceReview();

  // Update form
  const form = useForm<UpdateServiceReviewInput>({
    resolver: zodResolver(updateServiceReviewSchema),
    defaultValues: {
      uuid: review.uuid,
      rating: review.rating,
      comment: review.comment || "",
      reviewMetadata: review.reviewMetadata || undefined,
    },
  });

  const onSubmit = async (data: UpdateServiceReviewInput) => {
    // Build payload - only include defined fields
    const payload: UpdateServiceReviewInput = {
      uuid: data.uuid,
    };

    if (data.rating !== undefined) {
      payload.rating = data.rating;
    }
    if (data.comment !== undefined) {
      payload.comment = data.comment;
    }
    if (data.reviewMetadata !== undefined) {
      payload.reviewMetadata = data.reviewMetadata;
    }

    await updateReview.mutateAsync(payload);
    onSuccess?.();
  };

  const isLoading = updateReview.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>امتیاز</FieldLabel>
          <Select
            value={String(form.watch("rating") || "")}
            onValueChange={(value) => {
              form.setValue("rating", Number(value) as 1 | 2 | 3 | 4 | 5);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب امتیاز" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - بسیار ضعیف</SelectItem>
              <SelectItem value="2">2 - ضعیف</SelectItem>
              <SelectItem value="3">3 - متوسط</SelectItem>
              <SelectItem value="4">4 - خوب</SelectItem>
              <SelectItem value="5">5 - عالی</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>امتیاز از 1 تا 5</FieldDescription>
          {form.formState.errors.rating && (
            <p className="text-destructive text-sm">
              {form.formState.errors.rating.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel>نظر</FieldLabel>
          <Textarea
            {...form.register("comment")}
            placeholder="نظر کاربر..."
            rows={4}
          />
          <FieldDescription>نظر یا کامنت کاربر</FieldDescription>
          {form.formState.errors.comment && (
            <p className="text-destructive text-sm">
              {form.formState.errors.comment.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel>URL نتیجه (در متادیتا)</FieldLabel>
          <Input
            type="url"
            placeholder="https://example.com/result.png"
            value={form.watch("reviewMetadata")?.result_url || ""}
            onChange={(e) => {
              const currentMetadata = form.watch("reviewMetadata") || {};
              form.setValue("reviewMetadata", {
                ...currentMetadata,
                result_url: e.target.value || undefined,
              });
            }}
          />
          <FieldDescription>لینک نتیجه در متادیتا</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
