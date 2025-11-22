import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FileUploader } from "./file-uploader";

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
