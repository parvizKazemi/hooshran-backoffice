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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Upload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
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
import { toast } from "sonner";

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
      label: t("notifications.form.fields.serviceName"),
      name: "service_name",
      type: "text",
    },
    {
      label: t("notifications.form.fields.actionLabel"),
      name: "action_label",
      type: "text",
    },
    {
      label: t("notifications.form.fields.actionLink"),
      name: "action_link",
      type: "text",
    },
    {
      label: t("notifications.form.fields.isSuccess"),
      name: "is_success",
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
    {
      label: t("notifications.form.fields.receiptLink"),
      name: "receipt_link",
      type: "text",
    },
    {
      label: t("notifications.form.fields.receiptLabel"),
      name: "receipt_label",
      type: "text",
    },
    {
      label: t("notifications.form.fields.transactionId"),
      name: "transaction_id",
      type: "text",
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
      name: "alert_type",
      type: "text",
    },
    {
      label: t("notifications.form.fields.securityLink"),
      name: "security_link",
      type: "text",
    },
    {
      label: t("notifications.form.fields.securityLabel"),
      name: "security_label",
      type: "text",
    },
    {
      label: t("notifications.form.fields.ipAddress"),
      name: "ip_address",
      type: "text",
    },
    {
      label: t("notifications.form.fields.deviceInfo"),
      name: "device_info",
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
    // Note: changelog field is handled by PromotionalItemsEditor component
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

// File Uploader Component
interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
}

function FileUploader({
  value,
  onChange,
  accept = "image/*,video/*",
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error("Upload failed:", error);
      // Fallback to mock URL for now
      const mockUrl = `https://files.hooshran.app/mock/${Date.now()}-${file.name}`;
      onChange(mockUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="ml-2 h-4 w-4" />
          {isUploading ? "در حال آپلود..." : "انتخاب فایل"}
        </Button>
        {value && (
          <span className="text-muted-foreground max-w-xs truncate text-sm">
            {value.split("/").pop()}
          </span>
        )}
      </div>
      {value && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="یا URL مستقیم وارد کنید"
          className="text-xs"
        />
      )}
    </div>
  );
}

// Promotional Items Editor Component
interface PromotionalItem {
  featured_media?: string;
  title: string;
  description: string;
  reference_label?: string;
  reference_link?: string;
  list?: string[];
  cta_label?: string;
  cta_link?: string;
}

interface PromotionalItemsEditorProps {
  value?: PromotionalItem[];
  onChange: (items: PromotionalItem[]) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function PromotionalItemsEditor({
  value,
  onChange,
  t,
}: PromotionalItemsEditorProps) {
  const items = value || [];
  const addItem = () => {
    const newItem: PromotionalItem = {
      title: "",
      description: "",
      list: [],
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (
    index: number,
    field: keyof PromotionalItem,
    fieldValue: unknown
  ) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
      if (field === "list" && typeof fieldValue === "string") {
        item[field] = fieldValue.split("\n").filter((item) => item.trim());
      } else {
        (item as unknown as Record<string, unknown>)[field] = fieldValue;
      }
      onChange(newItems);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {t("notifications.promotionalItems.title")}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="ml-2 h-4 w-4" />
          {t("notifications.promotionalItems.addItem")}
        </Button>
      </div>

      {items.map((item, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {t("notifications.promotionalItems.itemNumber", {
                  number: index + 1,
                })}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>
                {t("notifications.promotionalItems.media")}
              </FieldLabel>
              <FileUploader
                value={item.featured_media}
                onChange={(url) => updateItem(index, "featured_media", url)}
              />
            </Field>

            <Field>
              <FieldLabel>
                {t("notifications.promotionalItems.title")}
              </FieldLabel>
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                placeholder={t("notifications.form.fieldPlaceholder", {
                  label: t(
                    "notifications.promotionalItems.title"
                  ).toLowerCase(),
                })}
              />
            </Field>

            <Field>
              <FieldLabel>
                {t("notifications.promotionalItems.description")}
              </FieldLabel>
              <Textarea
                value={item.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    updateItem(index, "description", value);
                  }
                }}
                placeholder={t("notifications.form.fieldPlaceholder", {
                  label: t(
                    "notifications.promotionalItems.description"
                  ).toLowerCase(),
                })}
                rows={3}
                maxLength={200}
              />
              <FieldDescription className="text-muted-foreground text-xs">
                {item.description?.length || 0}/200 کاراکتر
              </FieldDescription>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  {t("notifications.promotionalItems.referenceLabel")}
                </FieldLabel>
                <Input
                  value={item.reference_label || ""}
                  onChange={(e) =>
                    updateItem(index, "reference_label", e.target.value)
                  }
                  placeholder={t("notifications.form.fieldPlaceholder", {
                    label: t(
                      "notifications.promotionalItems.referenceLabel"
                    ).toLowerCase(),
                  })}
                />
              </Field>
              <Field>
                <FieldLabel>
                  {t("notifications.promotionalItems.referenceLink")}
                </FieldLabel>
                <Input
                  value={item.reference_link || ""}
                  onChange={(e) =>
                    updateItem(index, "reference_link", e.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                {t("notifications.promotionalItems.listItems")}
              </FieldLabel>
              <Textarea
                value={item.list?.join("\n") || ""}
                onChange={(e) => updateItem(index, "list", e.target.value)}
                placeholder={t("notifications.form.fieldPlaceholder", {
                  label: t(
                    "notifications.promotionalItems.listItems"
                  ).toLowerCase(),
                })}
                rows={4}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  {t("notifications.promotionalItems.ctaLabel")}
                </FieldLabel>
                <Input
                  value={item.cta_label || ""}
                  onChange={(e) =>
                    updateItem(index, "cta_label", e.target.value)
                  }
                  placeholder={t("notifications.form.fieldPlaceholder", {
                    label: t(
                      "notifications.promotionalItems.ctaLabel"
                    ).toLowerCase(),
                  })}
                />
              </Field>
              <Field>
                <FieldLabel>
                  {t("notifications.promotionalItems.ctaLink")}
                </FieldLabel>
                <Input
                  value={item.cta_link || ""}
                  onChange={(e) =>
                    updateItem(index, "cta_link", e.target.value)
                  }
                  placeholder="https://..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          {t("notifications.promotionalItems.noItems")}
        </div>
      )}
    </div>
  );
}

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
          isPublic: notification.isPublic || false,
          userId: notification.user?.uuid,
        }
      : {
          type: "information" as NotificationType,
          metaData: {
            type: "simple",
            data: {} as Record<string, unknown>,
          },
          isPopup: false,
          isPublic: true, // information type is public by default
          userId: undefined,
        },
  });

  const notificationType = watch("type");
  const templateType = watch("metaData.type");
  const metaDataData = watch("metaData.data") || {};

  // Auto-set notification type to "information" when promotional template is selected
  React.useEffect(() => {
    if (templateType === "promotional" && notificationType !== "information") {
      // notify user that the notification type will be set to "information"
      toast.warning(t("notifications.form.promotionalNotificationTypeWarning"));
      setValue("type", "information");
    }
  }, [templateType, notificationType, setValue]);

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
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
          ...(data.userId && { userId: data.userId }),
        };

        await updateNotification.mutateAsync({
          notificationId: notification.uuid,
          data: payload,
        });
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
          isPublic: isPromotional
            ? true
            : data.type === "information"
              ? true
              : false,
          ...(data.userId && !isPromotional && { userId: data.userId }),
        };

        await createNotification.mutateAsync(payload);
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
        {/* Template-specific fields */}
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
                <div>
                  <Textarea
                    id={`metaData.data.${field.name}`}
                    placeholder={t("notifications.form.fieldPlaceholder", {
                      label: field.label,
                    })}
                    value={
                      (metaDataData as Record<string, string>)[field.name] || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        field.name === "message" &&
                        templateType === "promotional"
                      ) {
                        if (value.length <= 200) {
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
                        ? 200
                        : undefined
                    }
                  />
                  {field.name === "message" &&
                    templateType === "promotional" && (
                      <FieldDescription className="text-muted-foreground text-xs">
                        {(metaDataData as Record<string, string>).message
                          ?.length || 0}
                        /200 کاراکتر
                      </FieldDescription>
                    )}
                </div>
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

        {/* Promotional items editor */}
        {templateType === "promotional" && (
          <Field>
            <FieldLabel>
              {t("notifications.form.fields.changelog")}
              <span className="text-destructive"> *</span>
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
              t={t}
            />
          </Field>
        )}

        {templateType !== "promotional" && (
          <>
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
          </>
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
