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
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  useCreateNotification,
  useUpdateNotification,
} from "../hooks/use-notifications";
import {
  AdminNotification,
  CreateNotificationInput,
  createNotificationSchema,
  NOTIFICATION_TYPES,
  NotificationType,
  TEMPLATE_TYPES,
  UpdateNotificationInput,
  updateNotificationSchema,
} from "../types";

type NotificationFormProps = {
  notification?: AdminNotification;
  onSuccess?: () => void;
  onCancel?: () => void;
};

// Template-specific field configurations helper
const getTemplateFields = (
  t: (key: string) => string
): Record<
  string,
  { label: string; name: string; type: "text" | "textarea" | "number" }[]
> => ({
  service_result: [
    {
      label: t("notifications.form.fields.title"),
      name: "title",
      type: "text",
    },
    {
      label: t("notifications.form.fields.message"),
      name: "message",
      type: "textarea",
    },
    {
      label: t("notifications.form.fields.result"),
      name: "result",
      type: "text",
    },
  ],
  payment_success: [
    {
      label: t("notifications.form.fields.title"),
      name: "title",
      type: "text",
    },
    {
      label: t("notifications.form.fields.amount"),
      name: "amount",
      type: "text",
    },
    {
      label: t("notifications.form.fields.message"),
      name: "message",
      type: "textarea",
    },
  ],
  security_alert: [
    {
      label: t("notifications.form.fields.title"),
      name: "title",
      type: "text",
    },
    {
      label: t("notifications.form.fields.message"),
      name: "message",
      type: "textarea",
    },
    {
      label: t("notifications.form.fields.alertType"),
      name: "alertType",
      type: "text",
    },
  ],
  promotional: [
    {
      label: t("notifications.form.fields.title"),
      name: "title",
      type: "text",
    },
    {
      label: t("notifications.form.fields.message"),
      name: "message",
      type: "textarea",
    },
    { label: t("notifications.form.fields.link"), name: "link", type: "text" },
  ],
  dynamic: [
    {
      label: t("notifications.form.fields.title"),
      name: "title",
      type: "text",
    },
    {
      label: t("notifications.form.fields.message"),
      name: "message",
      type: "textarea",
    },
  ],
  simple: [
    {
      label: t("notifications.form.fields.title"),
      name: "title",
      type: "text",
    },
    {
      label: t("notifications.form.fields.message"),
      name: "message",
      type: "textarea",
    },
  ],
});

export function NotificationForm({
  notification,
  onSuccess,
  onCancel,
}: NotificationFormProps) {
  const { t } = useTranslation("common");
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const templateFields = getTemplateFields(t);
  const isEditing = !!notification;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNotificationInput | UpdateNotificationInput>({
    resolver: zodResolver(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (isEditing ? updateNotificationSchema : createNotificationSchema) as any
    ),
    mode: "onSubmit", // Validate only on submit, not on change
    defaultValues: notification
      ? {
          type: notification.type,
          metaData: {
            type: notification.metaData.type,
            data: (notification.metaData.data || {}) as Record<string, unknown>,
          },
          isPopup: notification.isPopup,
          userId: notification.user?.uuid,
        }
      : {
          type: "information" as NotificationType,
          metaData: {
            type: "simple",
            data: {} as Record<string, unknown>,
          },
          isPopup: false,
          userId: undefined,
        },
  });

  const notificationType = watch("type");
  const templateType = watch("metaData.type");
  const metaDataData = watch("metaData.data") || {};

  const currentTemplateFields =
    templateFields[templateType || "simple"] || templateFields.simple;

  const onSubmit: SubmitHandler<
    CreateNotificationInput | UpdateNotificationInput
  > = async (data) => {
    try {
      if (isEditing && notification) {
        // Update mode
        const payload: UpdateNotificationInput = {
          ...(data.type && { type: data.type }),
          ...(data.metaData && {
            metaData: {
              ...(data.metaData.type && { type: data.metaData.type }),
              ...(data.metaData.data && {
                data: data.metaData.data as Record<string, unknown>,
              }),
            },
          }),
          ...(data.isPopup !== undefined && { isPopup: data.isPopup }),
          ...(data.userId && { userId: data.userId }),
        };

        await updateNotification.mutateAsync({
          notificationId: notification.uuid,
          data: payload,
        });
      } else {
        // Create mode
        const payload: CreateNotificationInput = {
          type: data.type as NotificationType,
          metaData: {
            type: data.metaData?.type || "simple",
            data: (data.metaData?.data || {}) as Record<string, unknown>,
          },
          isPopup: data.isPopup ?? false,
          ...(data.userId && { userId: data.userId }),
        };

        await createNotification.mutateAsync(payload);
      }
      onSuccess?.();
    } catch {
      // Error is handled in the hook
    }
  };

  const updateMetaDataField = (fieldName: string, value: string) => {
    const currentData = metaDataData as Record<string, unknown>;

    setValue("metaData.data", {
      ...currentData,
      [fieldName]: value,
    } as Record<string, unknown>);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="type">
            {t("notifications.form.typeRequired")}
          </FieldLabel>
          <Select
            value={notificationType}
            onValueChange={(value) =>
              setValue("type", value as NotificationType)
            }
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`notifications.types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <FieldDescription className="text-destructive">
              {errors.type.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="metaData.type">
            {t("notifications.form.templateTypeRequired")}
          </FieldLabel>
          <Select
            value={templateType || "simple"}
            onValueChange={(value) => {
              setValue("metaData.type", value);
              // Reset data when template type changes
              setValue("metaData.data", {} as Record<string, unknown>);
            }}
          >
            <SelectTrigger id="metaData.type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_TYPES.map((type: string) => {
                const templateKey = `notifications.templates.${type}` as const;
                return (
                  <SelectItem key={type} value={type}>
                    {t(templateKey)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.metaData?.type && (
            <FieldDescription className="text-destructive">
              {errors.metaData.type.message}
            </FieldDescription>
          )}
        </Field>

        {/* Dynamic fields based on template type */}
        {currentTemplateFields &&
          currentTemplateFields.map((field) => (
            <Field key={field.name}>
              <FieldLabel htmlFor={`metaData.data.${field.name}`}>
                {field.label}
                {field.name === "title" || field.name === "message" ? (
                  <span className="text-destructive"> *</span>
                ) : null}
              </FieldLabel>
              {field.type === "textarea" ? (
                <Textarea
                  id={`metaData.data.${field.name}`}
                  placeholder={t("notifications.form.fieldPlaceholder", {
                    label: field.label,
                  })}
                  value={
                    (metaDataData as Record<string, string>)[field.name] || ""
                  }
                  onChange={(e) =>
                    updateMetaDataField(field.name, e.target.value)
                  }
                  disabled={
                    createNotification.isPending || updateNotification.isPending
                  }
                  rows={4}
                />
              ) : (
                <Input
                  id={`metaData.data.${field.name}`}
                  type={field.type === "number" ? "number" : "text"}
                  placeholder={t("notifications.form.fieldPlaceholder", {
                    label: field.label,
                  })}
                  value={
                    (metaDataData as Record<string, string>)[field.name] || ""
                  }
                  onChange={(e) =>
                    updateMetaDataField(field.name, e.target.value)
                  }
                  disabled={
                    createNotification.isPending || updateNotification.isPending
                  }
                />
              )}
            </Field>
          ))}

        <Field>
          <FieldLabel htmlFor="isPopup">
            {t("notifications.form.popup")}
          </FieldLabel>
          <Select
            value={watch("isPopup") ? "true" : "false"}
            onValueChange={(value) => setValue("isPopup", value === "true")}
            disabled={
              createNotification.isPending || updateNotification.isPending
            }
          >
            <SelectTrigger id="isPopup">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">
                {t("notifications.table.no")}
              </SelectItem>
              <SelectItem value="true">
                {t("notifications.table.yes")}
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            {t("notifications.form.popupDescription")}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="userId">
            {t("notifications.form.userId")}
          </FieldLabel>
          <Input
            id="userId"
            type="text"
            placeholder={t("notifications.form.userIdPlaceholder")}
            {...register("userId")}
            disabled={
              createNotification.isPending || updateNotification.isPending
            }
          />
          {errors.userId && (
            <FieldDescription className="text-destructive">
              {errors.userId.message}
            </FieldDescription>
          )}
          <FieldDescription>
            {t("notifications.form.userIdDescription")}
          </FieldDescription>
        </Field>

        <Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                createNotification.isPending || updateNotification.isPending
              }
              className="flex-1"
            >
              {createNotification.isPending || updateNotification.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isEditing
                    ? t("notifications.form.updating")
                    : t("notifications.form.creating")}
                </>
              ) : isEditing ? (
                t("notifications.form.update")
              ) : (
                t("notifications.form.create")
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={
                  createNotification.isPending || updateNotification.isPending
                }
              >
                {t("notifications.form.cancel")}
              </Button>
            )}
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
