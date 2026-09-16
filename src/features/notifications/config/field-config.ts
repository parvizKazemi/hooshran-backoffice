export interface FormData {
  metaData?: {
    type?: string;
    data?: Record<string, unknown>;
  };
  type?: string;
  isPopup?: boolean;
  [key: string]: unknown;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "boolean" | "custom";
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  condition?: (formData: FormData) => boolean;
}

// Template-specific field configurations
export const TEMPLATE_FIELD_CONFIGS: Record<string, FieldConfig[]> = {
  service_result: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
    },
    {
      name: "service_name",
      label: "notifications.form.fields.serviceName",
      type: "text",
      required: true,
    },
    {
      name: "action_label",
      label: "notifications.form.fields.actionLabel",
      type: "text",
      required: false,
    },
    {
      name: "action_link",
      label: "notifications.form.fields.actionLink",
      type: "text",
      required: false,
    },
    {
      name: "is_success",
      label: "notifications.form.fields.isSuccess",
      type: "boolean",
      required: true,
    },
  ],
  payment_success: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
    },
    {
      name: "amount",
      label: "notifications.form.fields.amount",
      type: "text",
      required: true,
    },
    {
      name: "receipt_link",
      label: "notifications.form.fields.receiptLink",
      type: "text",
      required: false,
    },
    {
      name: "receipt_label",
      label: "notifications.form.fields.receiptLabel",
      type: "text",
      required: false,
    },
    {
      name: "transaction_id",
      label: "notifications.form.fields.transactionId",
      type: "text",
      required: true,
    },
  ],
  security_alert: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
    },
    {
      name: "alert_type",
      label: "notifications.form.fields.alertType",
      type: "text",
      required: true,
    },
    {
      name: "security_link",
      label: "notifications.form.fields.securityLink",
      type: "text",
      required: false,
    },
    {
      name: "security_label",
      label: "notifications.form.fields.securityLabel",
      type: "text",
      required: false,
    },
    {
      name: "ip_address",
      label: "notifications.form.fields.ipAddress",
      type: "text",
      required: false,
    },
    {
      name: "device_info",
      label: "notifications.form.fields.deviceInfo",
      type: "text",
      required: false,
    },
  ],
  promotional: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: false,
      maxLength: 300,
    },
    // Note: changelog field is handled by PromotionalItemsEditor component
  ],
  dynamic: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
    },
  ],
  simple: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
    },
  ],
  simple_popup: [
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
    },
    {
      name: "badge",
      label: "notifications.form.fields.badge",
      type: "text",
      required: false,
    },
  ],
  float_banner: [
    {
      name: "variant",
      label: "notifications.form.fields.bannerVariant",
      type: "select",
      required: true,
      options: [
        {
          value: "oneline",
          label: "notifications.form.fields.bannerVariantOneLine",
        },
        {
          value: "notice",
          label: "notifications.form.fields.bannerVariantNotice",
        },
        {
          value: "update",
          label: "notifications.form.fields.bannerVariantUpdate",
        },
        {
          value: "critical",
          label: "notifications.form.fields.bannerVariantCritical",
        },
      ],
    },
    {
      name: "title",
      label: "notifications.form.fields.title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      label: "notifications.form.fields.message",
      type: "textarea",
      required: true,
      condition: (formData) => formData.metaData?.data?.variant !== "oneline",
    },
    {
      name: "badge",
      label: "notifications.form.fields.badge",
      type: "text",
      required: false,
      condition: (formData) => formData.metaData?.data?.variant !== "oneline",
    },
    {
      name: "button_text",
      label: "notifications.form.fields.buttonText",
      type: "text",
      required: false,
      condition: (formData) => formData.metaData?.data?.variant !== "oneline",
    },
    {
      name: "target_url",
      label: "notifications.form.fields.targetUrl",
      type: "text",
      required: false,
    },
  ],
};

// Form-level field configurations
export const FORM_FIELD_CONFIGS: Record<string, FieldConfig> = {
  templateType: {
    name: "metaData.type",
    label: "notifications.form.templateTypeRequired",
    type: "select",
    required: true,
  },
  notificationType: {
    name: "type",
    label: "notifications.form.typeRequired",
    type: "select",
    required: true,
  },
  isPopup: {
    name: "isPopup",
    label: "notifications.form.popup",
    type: "boolean",
    required: false,
    condition: (formData) => formData.metaData?.type !== "promotional",
  },
  isPublic: {
    name: "isPublic",
    label: "notifications.form.isPublic",
    type: "boolean",
    required: false,
    condition: (formData) => formData.metaData?.type !== "promotional",
  },
  changelog: {
    name: "metaData.data.changelog",
    label: "notifications.form.fields.changelog",
    type: "custom",
    required: true,
    condition: (formData) => formData.metaData?.type === "promotional",
  },
};

const isFloatBannerOnelineVariant = (formData: FormData): boolean =>
  formData.metaData?.type === "float_banner" &&
  formData.metaData?.data?.variant === "oneline";

const isTemplateFieldVisible = (
  field: FieldConfig,
  formData: FormData
): boolean => !field.condition || field.condition(formData);

const isTemplateFieldRequired = (
  field: FieldConfig,
  formData: FormData
): boolean => {
  if (!isTemplateFieldVisible(field, formData)) {
    return false;
  }

  if (field.name === "target_url" && isFloatBannerOnelineVariant(formData)) {
    return true;
  }

  return field.required ?? false;
};

// Helper function to get required fields for a template
export function getRequiredFields(
  templateType: string,
  formData?: FormData
): string[] {
  const fields = TEMPLATE_FIELD_CONFIGS[templateType] || [];
  const effectiveFormData: FormData = formData ?? {
    metaData: { type: templateType, data: {} },
  };

  const requiredFields = fields
    .filter((field) => isTemplateFieldRequired(field, effectiveFormData))
    .map((field) => `metaData.data.${field.name}`);

  // Add form-level required fields
  Object.values(FORM_FIELD_CONFIGS).forEach((config) => {
    if (
      config.required &&
      (!config.condition || config.condition(effectiveFormData))
    ) {
      requiredFields.push(config.name);
    }
  });

  return requiredFields;
}

// Helper function to check if a field is required
export function isFieldRequired(
  fieldName: string,
  formData: FormData
): boolean {
  const templateType = formData.metaData?.type || "simple";
  const fields = TEMPLATE_FIELD_CONFIGS[templateType] || [];
  const field = fields.find((f) => f.name === fieldName);

  if (field) {
    return isTemplateFieldRequired(field, formData);
  }

  // Check form-level fields
  const formField = Object.values(FORM_FIELD_CONFIGS).find(
    (config) =>
      config.name === fieldName || config.name.endsWith(`.${fieldName}`)
  );

  if (formField) {
    return (
      (formField.required ?? false) &&
      (!formField.condition || formField.condition(formData))
    );
  }

  return false;
}
