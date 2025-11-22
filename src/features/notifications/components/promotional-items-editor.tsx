import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FileUploader } from "./file-uploader";

const MAX_DESCRIPTION_LENGTH = 200;

// فیلدهای required برای هر آیتم promotional
const PROMOTIONAL_ITEM_REQUIRED_FIELDS = {
  title: true,
  description: true,
  featured_media: false,
  reference_label: false,
  reference_link: false,
  list: false,
  cta_label: false,
  cta_link: false,
};

// Helper component برای نمایش label با علامت *
function FieldLabelWithRequired({
  fieldKey,
  children,
}: {
  fieldKey: keyof typeof PROMOTIONAL_ITEM_REQUIRED_FIELDS;
  children: React.ReactNode;
}) {
  return (
    <FieldLabel>
      {children}
      {PROMOTIONAL_ITEM_REQUIRED_FIELDS[fieldKey] && (
        <span className="text-destructive"> *</span>
      )}
    </FieldLabel>
  );
}

export interface PromotionalItem {
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
}

export function PromotionalItemsEditor({
  value,
  onChange,
}: PromotionalItemsEditorProps) {
  const { t } = useTranslation("common");
  const items = value || [];
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0])); // First item expanded by default

  const addItem = () => {
    const newItem: PromotionalItem = {
      title: "",
      description: "",
      list: [],
    };
    const newItems = [...items, newItem];
    onChange(newItems);
    // Expand the newly added item
    setExpandedItems((prev) => new Set([...prev, newItems.length - 1]));
  };

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const updateItem = (
    index: number,
    field: keyof PromotionalItem,
    fieldValue: unknown
  ) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
      // برای list فقط string رو ذخیره می‌کنیم
      (item as unknown as Record<string, unknown>)[field] = fieldValue;
      onChange(newItems);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {t("notifications.promotionalItems.title")}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="ml-2 h-4 w-4" />
            {t("notifications.promotionalItems.addItem")}
          </Button>
        </div>
      </div>

      {items.map((item, index) => {
        // برای نمایش، اگر list یک array است، به string تبدیل می‌کنیم
        const listValue = Array.isArray(item.list)
          ? item.list.join("\n")
          : (item.list as unknown as string) || "";

        // برای پیش‌نمایش زنده
        const listItems = listValue.split("\n").filter((line) => line.trim());

        return (
          <Card key={index} className="relative p-2 pb-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItem(index)}
                    className="h-6 w-6 p-0"
                  >
                    {expandedItems.has(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-sm">
                    {t("notifications.promotionalItems.itemNumber", {
                      number: index + 1,
                    })}
                  </CardTitle>
                </div>
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
            {expandedItems.has(index) && (
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabelWithRequired fieldKey="featured_media">
                    {t("notifications.promotionalItems.media")}
                  </FieldLabelWithRequired>
                  {item.featured_media && (
                    <div className="mb-3">
                      <img
                        src={item.featured_media}
                        alt="پیش‌نمایش رسانه"
                        className="max-h-32 max-w-full rounded-md border object-cover"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <FileUploader
                    value={item.featured_media}
                    onChange={(url) => updateItem(index, "featured_media", url)}
                    showUrlInput={false}
                    showFileName={false}
                  />
                </Field>

                <Field>
                  <FieldLabelWithRequired fieldKey="title">
                    {t("notifications.promotionalItems.fieldTitle")}
                  </FieldLabelWithRequired>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder={t("notifications.form.fieldPlaceholder", {
                      label: t(
                        "notifications.promotionalItems.fieldTitle"
                      ).toLowerCase(),
                    })}
                  />
                  {PROMOTIONAL_ITEM_REQUIRED_FIELDS.title &&
                    !item.title?.trim() && (
                      <FieldDescription className="text-destructive text-xs">
                        {t("notifications.promotionalItems.titleRequired")}
                      </FieldDescription>
                    )}
                </Field>

                <Field>
                  <FieldLabelWithRequired fieldKey="description">
                    {t("notifications.promotionalItems.description")}
                  </FieldLabelWithRequired>
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= MAX_DESCRIPTION_LENGTH) {
                        updateItem(index, "description", value);
                      }
                    }}
                    placeholder={t("notifications.form.fieldPlaceholder", {
                      label: t(
                        "notifications.promotionalItems.description"
                      ).toLowerCase(),
                    })}
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <FieldDescription className="text-muted-foreground text-xs">
                    {item.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}{" "}
                    {t("notifications.promotionalItems.characters")}
                  </FieldDescription>
                  {PROMOTIONAL_ITEM_REQUIRED_FIELDS.description &&
                    !item.description?.trim() && (
                      <FieldDescription className="text-destructive text-xs">
                        {t(
                          "notifications.promotionalItems.descriptionRequired"
                        )}
                      </FieldDescription>
                    )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabelWithRequired fieldKey="reference_label">
                      {t("notifications.promotionalItems.referenceLabel")}
                    </FieldLabelWithRequired>
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
                    <FieldLabelWithRequired fieldKey="reference_link">
                      {t("notifications.promotionalItems.referenceLink")}
                    </FieldLabelWithRequired>
                    <Input
                      value={item.reference_link || ""}
                      dir="ltr"
                      type="url"
                      onChange={(e) =>
                        updateItem(index, "reference_link", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabelWithRequired fieldKey="list">
                    {t("notifications.promotionalItems.listItems")}
                  </FieldLabelWithRequired>
                  <Textarea
                    value={listValue}
                    onChange={(e) => updateItem(index, "list", e.target.value)}
                    placeholder={t("notifications.form.fieldPlaceholder", {
                      label: t(
                        "notifications.promotionalItems.listItems"
                      ).toLowerCase(),
                    })}
                    rows={4}
                  />
                  <FieldDescription className="text-muted-foreground text-xs">
                    هر خط یک آیتم جداگانه
                  </FieldDescription>

                  {/* پیش‌نمایش زنده لیست */}
                  {listItems.length > 0 && (
                    <div className="bg-muted mt-2 rounded-md p-3">
                      <div className="mb-2 text-xs font-medium">
                        پیش‌نمایش لیست:
                      </div>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {listItems.map((listItem, i) => (
                          <li key={i} className="text-muted-foreground">
                            {listItem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Field>

                <div className="mb-3 grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabelWithRequired fieldKey="cta_label">
                      {t("notifications.promotionalItems.ctaLabel")}
                    </FieldLabelWithRequired>
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
                    <FieldLabelWithRequired fieldKey="cta_link">
                      {t("notifications.promotionalItems.ctaLink")}
                    </FieldLabelWithRequired>
                    <Input
                      value={item.cta_link || ""}
                      onChange={(e) =>
                        updateItem(index, "cta_link", e.target.value)
                      }
                      placeholder="https://..."
                      dir="ltr"
                      type="url"
                    />
                  </Field>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {items.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          {t("notifications.promotionalItems.noItems")}
        </div>
      )}
    </div>
  );
}
