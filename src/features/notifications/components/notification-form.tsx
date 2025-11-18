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
import { useCreateNotification } from "../hooks/use-notifications";
import {
  CreateNotificationInput,
  createNotificationSchema,
  TEMPLATE_TYPES,
} from "../types";

type NotificationFormProps = {
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
  onSuccess,
  onCancel,
}: NotificationFormProps) {
  const { t } = useTranslation("common");
  const createNotification = useCreateNotification();
  const templateFields = getTemplateFields(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNotificationInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createNotificationSchema) as any,
    defaultValues: {
      type: "system",
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

  const onSubmit: SubmitHandler<CreateNotificationInput> = async (data) => {
    try {
      // Ensure data object is properly structured
      const payload: CreateNotificationInput = {
        type: data.type,
        metaData: {
          type: data.metaData.type,
          data: (data.metaData.data || {}) as Record<string, unknown>,
        },
        isPopup: data.isPopup ?? false,
        ...(data.userId && { userId: data.userId }),
      };

      // Remove userId if type is 'system'
      if (payload.type === "system") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, ...rest } = payload;
        await createNotification.mutateAsync(rest);
      } else {
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
              setValue("type", value as CreateNotificationInput["type"])
            }
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                {t("notifications.types.system")}
              </SelectItem>
              <SelectItem value="notification">
                {t("notifications.types.notification")}
              </SelectItem>
              <SelectItem value="information">
                {t("notifications.types.information")}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <FieldDescription className="text-destructive">
              {errors.type.message}
            </FieldDescription>
          )}
          <FieldDescription>
            {t("notifications.form.systemCannotHaveUserId")}
          </FieldDescription>
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
                  disabled={createNotification.isPending}
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
                  disabled={createNotification.isPending}
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
            disabled={createNotification.isPending}
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

        {notificationType !== "system" && (
          <Field>
            <FieldLabel htmlFor="userId">
              {t("notifications.form.userId")}
            </FieldLabel>
            <Input
              id="userId"
              type="text"
              placeholder={t("notifications.form.userIdPlaceholder")}
              {...register("userId")}
              disabled={createNotification.isPending}
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
        )}

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
                  {t("notifications.form.creating")}
                </>
              ) : (
                t("notifications.form.create")
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createNotification.isPending}
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
