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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  validatePromotionalItems,
} from "./promotional-items-editor";
import {
  TEMPLATE_FIELD_CONFIGS,
  isFieldRequired,
} from "../config/field-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUploader } from "./file-uploader";
import { cn } from "@/lib/utils";

type NotificationFormProps = {
  notification?: AdminNotification;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type RuleType = "exact" | "include";

type UrlRule = {
  path: string;
  rule: RuleType;
};

const getRawUrlTargets = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const normalizeRuleType = (value: unknown): RuleType => {
  if (value === "include") {
    return "include";
  }

  return "exact";
};

const normalizeUrlRules = (
  rulesValue: unknown,
  targetsValue: unknown,
  ruleValue: unknown,
  keepEmptyPath = false
): UrlRule[] => {
  if (Array.isArray(rulesValue)) {
    return rulesValue
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const path =
          typeof (item as { path?: unknown }).path === "string"
            ? (item as { path: string }).path.trim()
            : typeof (item as { route?: unknown }).route === "string"
              ? ((item as { route: string }).route ?? "").trim()
              : "";
        if (!path && !keepEmptyPath) {
          return null;
        }

        return {
          path,
          rule: normalizeRuleType(
            (item as { rule?: unknown; match?: unknown }).rule ??
              (item as { rule?: unknown; match?: unknown }).match
          ),
        } satisfies UrlRule;
      })
      .filter((item): item is UrlRule => item !== null);
  }

  return getRawUrlTargets(targetsValue)
    .filter((route) => route !== "all")
    .map((path) => ({
      path,
      rule: normalizeRuleType(ruleValue),
    }));
};

const normalizeTargetGroup = (...values: unknown[]): string => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const firstValidItem = value.find(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      );
      if (firstValidItem) {
        return firstValidItem.trim();
      }
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "ALL";
};

const TITLE_MAX_LENGTH = 40;
const BADGE_MAX_LENGTH = 15;
const MESSAGE_MAX_LENGTH_BY_TEMPLATE: Record<string, number> = {
  promotional: 40,
  simple: 1000,
  simple_popup: 1000,
  float_banner: 90,
};

const getFieldMaxLength = (
  templateType: string | undefined,
  fieldName: string
): number | undefined => {
  if (fieldName === "title") {
    return TITLE_MAX_LENGTH;
  }
  if (fieldName === "badge") {
    return BADGE_MAX_LENGTH;
  }

  if (fieldName === "message") {
    return MESSAGE_MAX_LENGTH_BY_TEMPLATE[templateType || "simple"] || 1000;
  }

  return undefined;
};

export function NotificationForm({
  notification,
  onSuccess,
}: NotificationFormProps) {
  const { t } = useTranslation("common");
  const { authData } = useAuth();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const isEditing = !!notification;
  const submitModeRef = React.useRef<"publish" | "draft">("publish");

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
            type:
              notification.metaData.type === "simple"
                ? "simple_popup"
                : notification.metaData.type,
            data:
              notification.metaData.type === "simple"
                ? {
                    title:
                      (notification.metaData.data?.title as
                        | string
                        | undefined) || "",
                    message:
                      (notification.metaData.data?.desc as
                        | string
                        | undefined) ||
                      (notification.metaData.data?.message as
                        | string
                        | undefined) ||
                      "",
                    badge:
                      (notification.metaData.data?.badge as
                        | string
                        | undefined) || "",
                    media_url:
                      (notification.metaData.data?.featured_media as
                        | string
                        | undefined) || "",
                    urlTargets: Array.isArray(
                      (
                        notification.metaData.data?.visibility as
                          | { route?: string[] }
                          | undefined
                      )?.route
                    )
                      ? (
                          notification.metaData.data?.visibility as {
                            route?: string[];
                          }
                        ).route
                      : ["all"],
                    urlRule:
                      (
                        notification.metaData.data?.visibility as
                          | { rule?: RuleType; match?: RuleType }
                          | undefined
                      )?.rule ||
                      (
                        notification.metaData.data?.visibility as
                          | { rule?: RuleType; match?: RuleType }
                          | undefined
                      )?.match ||
                      "exact",
                    urlRules: Array.isArray(
                      (
                        notification.metaData.data?.visibility as
                          | {
                              route?: string[];
                              rules?: Array<{
                                route?: string;
                                rule?: RuleType;
                                match?: RuleType;
                              }>;
                            }
                          | undefined
                      )?.rules
                    )
                      ? (
                          notification.metaData.data?.visibility as {
                            rules?: Array<{
                              route?: string;
                              rule?: RuleType;
                              match?: RuleType;
                            }>;
                          }
                        ).rules?.map((rule) => ({
                          path: rule.route || "",
                          rule: rule.rule || rule.match || "exact",
                        }))
                      : undefined,
                    targetMode: Array.isArray(
                      (
                        notification.metaData.data?.visibility as
                          | { route?: string[] }
                          | undefined
                      )?.route
                    )
                      ? "custom"
                      : "all",
                  }
                : ((notification.metaData.data || {}) as Record<
                    string,
                    unknown
                  >),
          },
          isPopup: notification.isPopup,
          isPublic: notification.isPublic,
          isActive: notification.isActive ?? true,
          targetGroup: normalizeTargetGroup(
            notification.targetGroup,
            (notification.metaData.data as Record<string, unknown>)?.audience
          ),
        }
      : {
          type: "information" as NotificationType,
          metaData: {
            type: "simple_popup",
            data: {} as Record<string, unknown>,
          },
          isPopup: false,
          isPublic: false,
          isActive: true,
          targetGroup: "ALL",
        },
  });

  const notificationType = watch("type");
  const templateType = watch("metaData.type");
  const metaDataData = watch("metaData.data") || {};
  const rawUrlTargets = getRawUrlTargets(
    (metaDataData as Record<string, unknown>).urlTargets
  );
  const urlRules = normalizeUrlRules(
    (metaDataData as Record<string, unknown>).urlRules,
    (metaDataData as Record<string, unknown>).urlTargets,
    (metaDataData as Record<string, unknown>).urlRule,
    true
  );
  const hasCustomMode =
    (metaDataData as Record<string, unknown>).targetMode === "custom";
  const isAllPagesTargeting = hasCustomMode
    ? false
    : rawUrlTargets.includes("all") || urlRules.length === 0;
  const customRouteRules =
    urlRules.length > 0 ? urlRules : [{ path: "", rule: "exact" as const }];
  const targetGroupValue = watch("targetGroup");
  const selectedAudience = normalizeTargetGroup(
    targetGroupValue,
    (metaDataData as Record<string, unknown>).audience
  );

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
      setValue("metaData.data.urlTargets", ["all"]);
      return;
    }

    if (templateType === "simple_popup") {
      setValue("isPopup", true);
      if (
        !Array.isArray((metaDataData as Record<string, unknown>).urlTargets)
      ) {
        setValue("metaData.data.urlTargets", ["all"]);
      }
      if (!Array.isArray((metaDataData as Record<string, unknown>).urlRules)) {
        setValue("metaData.data.urlRules", []);
      }
      if (!(metaDataData as Record<string, unknown>).urlRule) {
        setValue("metaData.data.urlRule", "exact");
      }
      if (!(metaDataData as Record<string, unknown>).targetMode) {
        setValue("metaData.data.targetMode", "all");
      }
      if (typeof targetGroupValue !== "string" || !targetGroupValue.trim()) {
        setValue("targetGroup", "ALL");
      }
      return;
    }

    if (templateType === "float_banner") {
      setValue("isPopup", false);
      if (
        !Array.isArray((metaDataData as Record<string, unknown>).urlTargets)
      ) {
        setValue("metaData.data.urlTargets", ["all"]);
      }
      if (!Array.isArray((metaDataData as Record<string, unknown>).urlRules)) {
        setValue("metaData.data.urlRules", []);
      }
      if (!(metaDataData as Record<string, unknown>).urlRule) {
        setValue("metaData.data.urlRule", "exact");
      }
      if (!(metaDataData as Record<string, unknown>).targetMode) {
        setValue("metaData.data.targetMode", "all");
      }
      if (typeof targetGroupValue !== "string" || !targetGroupValue.trim()) {
        setValue("targetGroup", "ALL");
      }
    }
  }, [
    metaDataData,
    notificationType,
    setValue,
    t,
    targetGroupValue,
    templateType,
  ]);

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

    // Validate promotional items if template type is promotional
    if (data.metaData?.type === "promotional") {
      const changelog =
        (data.metaData.data?.changelog as PromotionalItem[]) || [];
      const promotionalErrors = validatePromotionalItems(changelog);
      if (promotionalErrors.length > 0) {
        toast.error(`خطاهای اعتبارسنجی: ${promotionalErrors.join(", ")}`);
        return;
      }
    }

    const normalizedTargetGroup = normalizeTargetGroup(
      data.targetGroup,
      data.metaData?.data?.audience
    );
    const isActive = submitModeRef.current === "publish";

    if (data.metaData?.type === "simple_popup") {
      const normalizedRules = normalizeUrlRules(
        data.metaData.data?.urlRules,
        data.metaData.data?.urlTargets,
        data.metaData.data?.urlRule
      );
      const targetMode =
        data.metaData.data?.targetMode === "custom" ? "custom" : "all";

      if (targetMode === "custom" && normalizedRules.length === 0) {
        toast.error(t("notifications.form.targeting.routeRequired"));
        return;
      }

      const mappedSimpleData: Record<string, unknown> = {
        title: (data.metaData.data?.title as string) || "",
        desc: (data.metaData.data?.message as string) || "",
      };

      const featuredMedia = data.metaData.data?.media_url;
      if (typeof featuredMedia === "string" && featuredMedia.trim()) {
        mappedSimpleData.featured_media = featuredMedia.trim();
      }

      const badge = data.metaData.data?.badge;
      if (typeof badge === "string" && badge.trim()) {
        mappedSimpleData.badge = badge.trim();
      }

      if (targetMode === "custom") {
        const allMatches = Array.from(
          new Set(normalizedRules.map((rule) => rule.rule))
        );
        const visibility: {
          route: string[];
          rule?: RuleType;
          rules: Array<{ route: string; rule: RuleType }>;
        } = {
          route: normalizedRules.map((rule) => rule.path),
          rules: normalizedRules.map((rule) => ({
            route: rule.path,
            rule: rule.rule,
          })),
        };

        if (allMatches.length === 1) {
          visibility.rule = allMatches[0];
        }

        mappedSimpleData.visibility = visibility;
      } else {
        mappedSimpleData.visibility = null;
      }

      data.metaData.data = mappedSimpleData;
      data.metaData.type = "simple";
    }

    if (data.metaData?.type === "float_banner") {
      const normalizedRules = normalizeUrlRules(
        data.metaData.data?.urlRules,
        data.metaData.data?.urlTargets,
        data.metaData.data?.urlRule
      );
      const targetMode =
        data.metaData.data?.targetMode === "custom" ? "custom" : "all";
      if (targetMode === "custom" && normalizedRules.length === 0) {
        toast.error(t("notifications.form.targeting.routeRequired"));
        return;
      }
      const allRules = Array.from(new Set(normalizedRules.map((r) => r.rule)));
      const currentData = (data.metaData.data || {}) as Record<string, unknown>;
      const { ...restData } = currentData;

      data.metaData.data = {
        ...restData,
        urlTargets:
          targetMode === "custom"
            ? normalizedRules.map((rule) => rule.path)
            : ["all"],
        urlRule:
          targetMode === "custom" && allRules.length === 1
            ? allRules[0]
            : undefined,
        urlRules: targetMode === "custom" ? normalizedRules : [],
        visibility:
          targetMode === "custom"
            ? {
                route: normalizedRules.map((rule) => rule.path),
                rules: normalizedRules.map((rule) => ({
                  route: rule.path,
                  rule: rule.rule,
                })),
                ...(allRules.length === 1 ? { rule: allRules[0] } : {}),
              }
            : null,
      };
    }

    data.targetGroup = normalizedTargetGroup;
    data.isActive = isActive;

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
          ...(data.targetGroup && { targetGroup: data.targetGroup }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.isPopup !== undefined && { isPopup: data.isPopup }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
          // Send admin UUID
          userId: authData?.user.uuid,
        };

        await updateNotification.mutateAsync({
          notificationId: notification.uuid,
          data: payload,
        });

        // Send notification if it's not public (needs user recipients)
        // if (data.type !== "information") {
        //   // TODO: Get user UUIDs from somewhere (maybe from a separate field or modal)
        //   // For now, skip sending
        //   console.warn(
        //     "Notification updated but not sent - needs user selection"
        //   );
        // }
      } else {
        // Create mode
        const isPromotional = data.metaData?.type === "promotional";
        const payload: CreateNotificationInput = {
          type: data.type as NotificationType,
          metaData: {
            type: data.metaData?.type || "simple",
            data: (data.metaData?.data || {}) as Record<string, unknown>,
          },
          targetGroup: normalizedTargetGroup,
          isActive,
          isPopup: isPromotional ? true : (data.isPopup ?? false),
          isPublic: isPromotional ? false : (data.isPublic ?? false),
          userId: authData?.user.uuid, // Send admin UUID
        };

        // const createdNotification = (await createNotification.mutateAsync(
        (await createNotification.mutateAsync(payload)) as BasicNotification;

        // // Send notification if it's not public (needs user recipients)
        // if (data.type !== "information" && createdNotification?.uuid) {
        //   // TODO: Get user UUIDs from somewhere (maybe from a separate field or modal)
        //   // For now, skip sending
        //   console.warn(
        //     "Notification created but not sent - needs user selection"
        //   );
        // }
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

  const handleTargetModeChange = (value: string) => {
    const currentData = metaDataData as Record<string, unknown>;

    if (value === "all") {
      setValue("metaData.data", {
        ...currentData,
        targetMode: "all",
        urlRules: [],
        urlTargets: ["all"],
        urlRule: undefined,
      } as Record<string, unknown>);
      return;
    }

    const currentCustomRules = normalizeUrlRules(
      currentData.urlRules,
      currentData.urlTargets,
      currentData.urlRule,
      true
    );
    const firstRule =
      currentCustomRules.length > 0 ? currentCustomRules[0]?.rule : "exact";

    setValue("metaData.data", {
      ...currentData,
      targetMode: "custom",
      urlRules:
        currentCustomRules.length > 0
          ? currentCustomRules
          : [{ path: "", rule: "exact" }],
      urlTargets: currentCustomRules.map((rule) => rule.path),
      urlRule:
        currentCustomRules.length > 0
          ? currentCustomRules.every((rule) => rule.rule === firstRule)
            ? firstRule
            : undefined
          : "exact",
    } as Record<string, unknown>);
  };

  const updateUrlRules = (rules: UrlRule[]) => {
    const currentData = metaDataData as Record<string, unknown>;
    const rulesForState = rules.map((rule) => ({
      path: rule.path,
      rule: normalizeRuleType(rule.rule),
    }));
    const allRules = Array.from(
      new Set(rulesForState.map((rule) => rule.rule))
    );

    setValue("metaData.data", {
      ...currentData,
      targetMode: "custom",
      urlRules: rulesForState,
      urlTargets: rulesForState.map((rule) => rule.path.trim()).filter(Boolean),
      urlRule: allRules.length === 1 ? allRules[0] : undefined,
    } as Record<string, unknown>);
  };

  const handleAddRouteRule = () => {
    const currentRules = normalizeUrlRules(
      (metaDataData as Record<string, unknown>).urlRules,
      (metaDataData as Record<string, unknown>).urlTargets,
      (metaDataData as Record<string, unknown>).urlRule,
      true
    );

    updateUrlRules([...currentRules, { path: "", rule: "exact" }]);
  };

  const handleUpdateRouteRule = (index: number, updates: Partial<UrlRule>) => {
    const currentRules = normalizeUrlRules(
      (metaDataData as Record<string, unknown>).urlRules,
      (metaDataData as Record<string, unknown>).urlTargets,
      (metaDataData as Record<string, unknown>).urlRule,
      true
    );
    const nextRules = currentRules.map((rule, ruleIndex) =>
      ruleIndex === index ? { ...rule, ...updates } : rule
    );
    updateUrlRules(nextRules);
  };

  const handleRemoveRouteRule = (index: number) => {
    const currentRules = normalizeUrlRules(
      (metaDataData as Record<string, unknown>).urlRules,
      (metaDataData as Record<string, unknown>).urlTargets,
      (metaDataData as Record<string, unknown>).urlRule,
      true
    );
    const nextRules = currentRules.filter(
      (_, ruleIndex) => ruleIndex !== index
    );
    updateUrlRules(
      nextRules.length > 0 ? nextRules : [{ path: "", rule: "exact" }]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="flex items-center justify-center gap-4">
          <Field>
            <FieldLabel htmlFor="metaData.type">
              {t("notifications.form.templateTypeRequired")}
            </FieldLabel>
            <Select
              value={templateType || "simple_popup"}
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
                {TEMPLATE_TYPES.filter((type) => type !== "simple").map(
                  (type: string) => {
                    const templateKey =
                      `notifications.templates.${type}` as const;
                    return (
                      <SelectItem key={type} value={type}>
                        {t(templateKey)}
                      </SelectItem>
                    );
                  }
                )}
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
        </div>

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
                  {(() => {
                    const currentValue =
                      ((metaDataData as Record<string, unknown>)[
                        field.name
                      ] as string) || "";
                    const maxLength = getFieldMaxLength(
                      templateType || undefined,
                      field.name
                    );
                    const remainingChars =
                      typeof maxLength === "number"
                        ? Math.max(maxLength - currentValue.length, 0)
                        : undefined;

                    return (
                      <>
                        <div className="relative">
                          <Textarea
                            id={`metaData.data.${field.name}`}
                            placeholder={t(
                              "notifications.form.fieldPlaceholder",
                              {
                                label: t(field.label),
                              }
                            )}
                            value={currentValue}
                            onChange={(e) => {
                              const nextValue =
                                typeof maxLength === "number"
                                  ? e.target.value.slice(0, maxLength)
                                  : e.target.value;
                              updateMetaDataField(field.name, nextValue);
                            }}
                            disabled={
                              createNotification.isPending ||
                              updateNotification.isPending
                            }
                            rows={4}
                            maxLength={maxLength}
                            className={
                              typeof maxLength === "number" ? "pb-7" : ""
                            }
                          />
                          {typeof maxLength === "number" && (
                            <FieldDescription
                              className={cn(
                                "bg-background/80 pointer-events-none absolute bottom-2 left-3 rounded px-1",
                                remainingChars === 0
                                  ? "text-destructive! text-xs"
                                  : "text-muted-foreground text-xs"
                              )}
                            >
                              {remainingChars}/{maxLength}{" "}
                              {t("notifications.promotionalItems.characters")}
                            </FieldDescription>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <>
                  {(() => {
                    const currentValue =
                      ((metaDataData as Record<string, unknown>)[
                        field.name
                      ] as string) || "";
                    const maxLength = getFieldMaxLength(
                      templateType || undefined,
                      field.name
                    );
                    const remainingChars =
                      typeof maxLength === "number"
                        ? Math.max(maxLength - currentValue.length, 0)
                        : undefined;

                    return (
                      <>
                        <div className="relative">
                          <Input
                            id={`metaData.data.${field.name}`}
                            type={field.type === "number" ? "number" : "text"}
                            placeholder={t(
                              "notifications.form.fieldPlaceholder",
                              {
                                label: t(field.label),
                              }
                            )}
                            value={currentValue}
                            onChange={(e) => {
                              const nextValue =
                                typeof maxLength === "number"
                                  ? e.target.value.slice(0, maxLength)
                                  : e.target.value;
                              updateMetaDataField(field.name, nextValue);
                            }}
                            disabled={
                              createNotification.isPending ||
                              updateNotification.isPending
                            }
                            maxLength={maxLength}
                            className={
                              typeof maxLength === "number" ? "pl-24" : ""
                            }
                          />
                          {typeof maxLength === "number" && (
                            <FieldDescription
                              className={cn(
                                "bg-background/80 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 rounded px-1",
                                remainingChars === 0
                                  ? "text-destructive! text-xs"
                                  : "text-muted-foreground text-xs"
                              )}
                            >
                              {remainingChars}/{maxLength}
                            </FieldDescription>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </Field>
          ))}

        {templateType === "simple_popup" && (
          <>
            <Field>
              <FieldLabel>
                {t("notifications.form.fields.mediaOptional")}
              </FieldLabel>
              <FileUploader
                value={(metaDataData as Record<string, string>).media_url || ""}
                onChange={(url) => updateMetaDataField("media_url", url)}
                showUrlInput
                showFileName
              />
            </Field>

            <Field className="space-y-3 rounded-md border p-4">
              <FieldLabel>{t("notifications.form.targeting.title")}</FieldLabel>
              <FieldDescription>
                {t("notifications.form.targeting.description")}
              </FieldDescription>
              <ToggleGroup
                type="single"
                value={isAllPagesTargeting ? "all" : "custom"}
                onValueChange={(value) =>
                  value && handleTargetModeChange(value)
                }
                className="mb-2 w-full justify-center"
              >
                <ToggleGroupItem value="all">
                  {t("notifications.form.targeting.allPages")}
                </ToggleGroupItem>
                <ToggleGroupItem value="custom">
                  {t("notifications.form.targeting.specificPaths")}
                </ToggleGroupItem>
              </ToggleGroup>

              {!isAllPagesTargeting && (
                <div className="space-y-3">
                  {customRouteRules.map((rule, index) => (
                    <div
                      key={`simple-route-${index}`}
                      className="flex items-start gap-2"
                    >
                      <ToggleGroup
                        type="single"
                        value={rule.rule}
                        onValueChange={(value) =>
                          value &&
                          handleUpdateRouteRule(index, {
                            rule: value as RuleType,
                          })
                        }
                        className="shrink-0 justify-start"
                      >
                        <ToggleGroupItem value="exact">
                          {t("notifications.form.targeting.matchExact")}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="include">
                          {t("notifications.form.targeting.matchInclude")}
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <Input
                        dir="ltr"
                        className="text-left"
                        value={rule.path}
                        onChange={(event) =>
                          handleUpdateRouteRule(index, {
                            path: event.target.value,
                          })
                        }
                        placeholder={t(
                          "notifications.form.targeting.specificPathsPlaceholder"
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRouteRule(index)}
                        disabled={customRouteRules.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddRouteRule}
                    className="w-fit"
                  >
                    <Plus className="mr-2 size-4" />
                    {t("notifications.form.targeting.addPath")}
                  </Button>
                </div>
              )}
            </Field>
          </>
        )}

        {templateType === "float_banner" && (
          <>
            <Field className="space-y-3 rounded-md border p-4">
              <FieldLabel>{t("notifications.form.targeting.title")}</FieldLabel>
              <FieldDescription>
                {t("notifications.form.targeting.description")}
              </FieldDescription>
              <ToggleGroup
                type="single"
                value={isAllPagesTargeting ? "all" : "custom"}
                onValueChange={(value) =>
                  value && handleTargetModeChange(value)
                }
                className="mb-2 w-full justify-start"
              >
                <ToggleGroupItem value="all">
                  {t("notifications.form.targeting.allPages")}
                </ToggleGroupItem>
                <ToggleGroupItem value="custom">
                  {t("notifications.form.targeting.specificPaths")}
                </ToggleGroupItem>
              </ToggleGroup>

              {!isAllPagesTargeting && (
                <div className="space-y-3">
                  {customRouteRules.map((rule, index) => (
                    <div
                      key={`banner-route-${index}`}
                      className="flex items-start gap-2"
                    >
                      <ToggleGroup
                        type="single"
                        value={rule.rule}
                        onValueChange={(value) =>
                          value &&
                          handleUpdateRouteRule(index, {
                            rule: value as RuleType,
                          })
                        }
                        className="shrink-0 justify-start"
                      >
                        <ToggleGroupItem value="exact">
                          {t("notifications.form.targeting.matchExact")}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="include">
                          {t("notifications.form.targeting.matchInclude")}
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <Input
                        dir="ltr"
                        className="text-left"
                        value={rule.path}
                        onChange={(event) =>
                          handleUpdateRouteRule(index, {
                            path: event.target.value,
                          })
                        }
                        placeholder={t(
                          "notifications.form.targeting.specificPathsPlaceholder"
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRouteRule(index)}
                        disabled={customRouteRules.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddRouteRule}
                    className="w-fit"
                  >
                    <Plus className="mr-2 size-4" />
                    {t("notifications.form.targeting.addPath")}
                  </Button>
                </div>
              )}
            </Field>
          </>
        )}

        {["simple_popup", "float_banner"].includes(templateType || "") && (
          <Field className="space-y-3 rounded-md border p-4">
            <FieldLabel>{t("notifications.form.audience.title")}</FieldLabel>
            <ToggleGroup
              type="single"
              value={selectedAudience}
              onValueChange={(value) => value && setValue("targetGroup", value)}
              className="w-full justify-start"
            >
              <ToggleGroupItem value="ALL">
                {t("notifications.form.audience.allUsers")}
              </ToggleGroupItem>
              <ToggleGroupItem value="LOGGINED">
                {t("notifications.form.audience.loggedInUsers")}
              </ToggleGroupItem>
              <ToggleGroupItem value="NOT_LOGGINED">
                {t("notifications.form.audience.guests")}
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        )}

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

        {!["promotional", "simple_popup", "float_banner"].includes(
          templateType || ""
        ) && (
          <div className="flex justify-between gap-4">
            <Field className="flex-1">
              <FieldLabel htmlFor="isPopup" className="mb-2">
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
                <SelectTrigger id="isPopup" className="w-full">
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
            </Field>

            <Field className="flex-1">
              <FieldLabel htmlFor="isPublic" className="mb-2">
                {t("notifications.form.isPublic")}
                {isFieldRequired("isPublic", {
                  metaData: { type: templateType },
                }) && <span className="text-destructive"> *</span>}
              </FieldLabel>
              <Select
                value={watch("isPublic") ? "true" : "false"}
                onValueChange={(value) =>
                  setValue("isPublic", value === "true")
                }
                disabled={
                  createNotification.isPending || updateNotification.isPending
                }
              >
                <SelectTrigger id="isPublic" className="w-full">
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
            </Field>
          </div>
        )}

        <Field>
          <div className="flex gap-2">
            {!isEditing && (
              <Button
                type="submit"
                variant="secondary"
                onClick={() => {
                  submitModeRef.current = "draft";
                }}
                disabled={
                  createNotification.isPending || updateNotification.isPending
                }
                className="flex-1"
              >
                {createNotification.isPending ||
                updateNotification.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("notifications.form.savingDraft")}
                  </>
                ) : (
                  t("notifications.form.saveDraft")
                )}
              </Button>
            )}
            <Button
              type="submit"
              onClick={() => {
                submitModeRef.current = "publish";
              }}
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
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
