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
import { Loader2 } from "lucide-react";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreateNotification,
  useUpdateNotification,
} from "../hooks/use-notifications";
import { useFormValidation } from "../hooks/use-form-validation";
import {
  AdminNotification,
  BasicNotification,
  CreateNotificationInput,
  createNotificationSchema,
  NOTIFICATION_TYPES,
  NotificationType,
  TEMPLATE_TYPES,
  UpdateNotificationInput,
  updateNotificationSchema,
} from "../types";
import { toast } from "sonner";
import {
  PromotionalItemsEditor,
  type PromotionalItem,
} from "./promotional-items-editor";
import {
  TEMPLATE_FIELD_CONFIGS,
  isFieldRequired,
} from "../config/field-config";
import { zodResolver } from "@hookform/resolvers/zod";

type NotificationFormProps = {
  notification?: AdminNotification;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function NotificationForm({
  notification,
  onSuccess,
  onCancel,
}: NotificationFormProps) {
  const { t } = useTranslation("common");
  const { authData } = useAuth();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const isEditing = !!notification;

  const {
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
        }
      : {
          type: "information" as NotificationType,
          metaData: {
            type: "simple",
            data: {} as Record<string, unknown>,
          },
          isPopup: false,
        },
  });

  const notificationType = watch("type");
  const templateType = watch("metaData.type");
  const metaDataData = watch("metaData.data") || {};

  const { validateRequiredFields } = useFormValidation(
    templateType || "simple"
  );

  // Auto-set notification type and popup based on template
  React.useEffect(() => {
    if (templateType === "promotional") {
      if (notificationType !== "information") {
        // notify user that the notification type will be set to "information"
        toast.warning(
          t("notifications.form.promotionalNotificationTypeWarning")
        );
        setValue("type", "information");
      }
      // Set popup to true for promotional
      setValue("isPopup", true);
    } else if (
      templateType === "simple" &&
      notificationType === "information"
    ) {
      // For simple notifications, use "notification" type to avoid isPublic = true
      setValue("type", "notification");
    }
  }, [templateType, notificationType, setValue]);

  const currentTemplateFields =
    TEMPLATE_FIELD_CONFIGS[templateType || "simple"] ||
    TEMPLATE_FIELD_CONFIGS.simple;

  const onSubmit: SubmitHandler<
    CreateNotificationInput | UpdateNotificationInput
  > = async (data) => {
    // Validate required fields
    const missingFields = validateRequiredFields(data);
    if (missingFields.length > 0) {
      toast.error(
        `فیلدهای زیر الزامی هستند: ${missingFields.map((f) => f.replace("metaData.data.", "")).join(", ")}`
      );
      return;
    }

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
          // Set isPublic based on type
          isPublic: data.type === "information" ? true : false,
          // Send admin UUID
          userId: authData?.user.uuid,
        };

        await updateNotification.mutateAsync({
          notificationId: notification.uuid,
          data: payload,
        });

        // Send notification if it's not public (needs user recipients)
        if (data.type !== "information") {
          // TODO: Get user UUIDs from somewhere (maybe from a separate field or modal)
          // For now, skip sending
          console.warn(
            "Notification updated but not sent - needs user selection"
          );
        }
      } else {
        // Create mode
        const isPromotional = data.metaData?.type === "promotional";
        const payload: CreateNotificationInput = {
          type: data.type as NotificationType,
          metaData: {
            type: data.metaData?.type || "simple",
            data: (data.metaData?.data || {}) as Record<string, unknown>,
          },
          isPopup: isPromotional ? true : (data.isPopup ?? false),
          isPublic: data.type === "information" ? true : false,
          userId: authData?.user.uuid, // Send admin UUID
        };

        const createdNotification = (await createNotification.mutateAsync(
          payload
        )) as BasicNotification;

        // Send notification if it's not public (needs user recipients)
        if (data.type !== "information" && createdNotification?.uuid) {
          // TODO: Get user UUIDs from somewhere (maybe from a separate field or modal)
          // For now, skip sending
          console.warn(
            "Notification created but not sent - needs user selection"
          );
        }
      }
      onSuccess?.();
    } catch {
      // Error is handled in the hook
    }
  };

  const updateMetaDataField = (fieldName: string, value: unknown) => {
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

        {/* Dynamic fields based on template type */}
        {currentTemplateFields &&
          currentTemplateFields.map((field) => (
            <Field key={field.name}>
              <FieldLabel htmlFor={`metaData.data.${field.name}`}>
                {t(field.label)}
                {field.required && <span className="text-destructive"> *</span>}
              </FieldLabel>
              {field.type === "textarea" ? (
                <div>
                  <Textarea
                    id={`metaData.data.${field.name}`}
                    placeholder={t("notifications.form.fieldPlaceholder", {
                      label: t(field.label),
                    })}
                    value={
                      (metaDataData as Record<string, string>)[field.name] || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        field.name === "message" &&
                        templateType === "promotional" &&
                        field.maxLength
                      ) {
                        if (value.length <= field.maxLength) {
                          updateMetaDataField(field.name, value);
                        }
                      } else {
                        updateMetaDataField(field.name, value);
                      }
                    }}
                    disabled={
                      createNotification.isPending ||
                      updateNotification.isPending
                    }
                    rows={4}
                    maxLength={
                      field.name === "message" && templateType === "promotional"
                        ? field.maxLength
                        : undefined
                    }
                  />
                  {field.name === "message" &&
                    templateType === "promotional" &&
                    field.maxLength && (
                      <FieldDescription className="text-muted-foreground text-xs">
                        {(metaDataData as Record<string, string>).message
                          ?.length || 0}
                        /{field.maxLength} کاراکتر
                      </FieldDescription>
                    )}
                </div>
              ) : (
                <Input
                  id={`metaData.data.${field.name}`}
                  type={field.type === "number" ? "number" : "text"}
                  placeholder={t("notifications.form.fieldPlaceholder", {
                    label: t(field.label),
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

        {/* Promotional items editor */}
        {templateType === "promotional" && (
          <Field>
            <FieldLabel>
              {t("notifications.form.fields.changelog")}
              {isFieldRequired("metaData.data.changelog", {
                metaData: { type: templateType },
              }) && <span className="text-destructive"> *</span>}
            </FieldLabel>
            <PromotionalItemsEditor
              value={
                (metaDataData as Record<string, unknown>).changelog as
                  | PromotionalItem[]
                  | undefined
              }
              onChange={(changelog) =>
                updateMetaDataField("changelog", changelog)
              }
            />
          </Field>
        )}

        {templateType !== "promotional" && (
          <Field>
            <FieldLabel htmlFor="isPopup">
              {t("notifications.form.popup")}
              {isFieldRequired("isPopup", {
                metaData: { type: templateType },
              }) && <span className="text-destructive"> *</span>}
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
        )}

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
