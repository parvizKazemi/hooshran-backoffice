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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateNotification } from "../hooks/use-notifications";
import { CreateNotificationInput, notificationSchema } from "../types";

type NotificationFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function NotificationForm({
  onSuccess,
  onCancel,
}: NotificationFormProps) {
  const createNotification = useCreateNotification();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNotificationInput>({
    // @ts-expect-error - zod schema type inference issue with optional default values
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: "system",
      metaData: {
        data: "",
        type: "text",
      },
      isPopup: false,
      userId: undefined,
    },
  });

  const notificationType = watch("type");

  const onSubmit = async (data: CreateNotificationInput) => {
    try {
      // @ts-expect-error - form data type inference
      await createNotification.mutateAsync(data as CreateNotificationInput);
      onSuccess?.();
    } catch {
      // Error is handled in the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="type">نوع نوتیفیکیشن</FieldLabel>
          <Select
            value={notificationType}
            onValueChange={(value) =>
              setValue("type", value as CreateNotificationInput["type"])
            }
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">سیستمی</SelectItem>
              <SelectItem value="user">کاربر</SelectItem>
              <SelectItem value="admin">مدیر</SelectItem>
              <SelectItem value="alert">هشدار</SelectItem>
              <SelectItem value="info">اطلاعیه</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <FieldDescription className="text-destructive">
              {errors.type.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="metaData.data">محتوا</FieldLabel>
          <Textarea
            id="metaData.data"
            placeholder="متن نوتیفیکیشن را وارد کنید..."
            {...register("metaData.data")}
            disabled={createNotification.isPending}
            rows={5}
          />
          {errors.metaData?.data && (
            <FieldDescription className="text-destructive">
              {errors.metaData.data.message}
            </FieldDescription>
          )}
          <FieldDescription>
            محتوای نوتیفیکیشن باید واضح و کامل باشد
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="isPopup">نمایش به صورت پاپ‌آپ</FieldLabel>
          <Select
            value={watch("isPopup") ? "true" : "false"}
            onValueChange={(value) => setValue("isPopup", value === "true")}
            disabled={createNotification.isPending}
          >
            <SelectTrigger id="isPopup">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">خیر</SelectItem>
              <SelectItem value="true">بله</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            در صورت فعال بودن، نوتیفیکیشن به صورت پاپ‌آپ نمایش داده می‌شود
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="userId">شناسه کاربر (اختیاری)</FieldLabel>
          <Input
            id="userId"
            type="text"
            placeholder="UUID کاربر (اختیاری)"
            {...register("userId")}
            disabled={createNotification.isPending}
          />
          {errors.userId && (
            <FieldDescription className="text-destructive">
              {errors.userId.message}
            </FieldDescription>
          )}
          <FieldDescription>
            در صورت خالی بودن، نوتیفیکیشن برای همه کاربران ارسال می‌شود
          </FieldDescription>
        </Field>

        <Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createNotification.isPending}
              className="flex-1"
            >
              {createNotification.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                "ارسال نوتیفیکیشن"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createNotification.isPending}
              >
                انصراف
              </Button>
            )}
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
