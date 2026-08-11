import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAssignCategoriesToService } from "../hooks/use-prompt-assistant";
import type {
  PromptCategory,
  ServiceAssignmentRow,
  ServiceCategoryConfigItem,
} from "../types";
import { moveItem } from "../utils/prompt-assistant.helpers";

const EMPTY_CATEGORIES: PromptCategory[] = [];

type ServiceAssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ServiceAssignmentRow | null;
  categories: PromptCategory[];
};

function buildConfigItems(
  categories: PromptCategory[],
  row: ServiceAssignmentRow | null
): ServiceCategoryConfigItem[] {
  const assignedMap = new Map(
    (row?.assignedCategories ?? []).map((item) => [
      item.categoryUuid,
      item.priority,
    ])
  );

  const items = categories.map((category) => ({
    categoryUuid: category.uuid,
    title: category.title,
    icon: category.icon,
    systemKey: category.systemKey,
    active: assignedMap.has(category.uuid),
    priority: assignedMap.get(category.uuid) ?? Number.MAX_SAFE_INTEGER,
  }));

  return items.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.title.localeCompare(b.title, "fa");
  });
}

export function ServiceAssignDialog({
  open,
  onOpenChange,
  row,
  categories = EMPTY_CATEGORIES,
}: ServiceAssignDialogProps) {
  const { t } = useTranslation("common");
  const assignMutation = useAssignCategoriesToService();
  const [items, setItems] = useState<ServiceCategoryConfigItem[]>([]);
  const categoriesKey = categories.map((item) => item.uuid).join("|");
  const assignedKey = (row?.assignedCategories ?? [])
    .map((item) => `${item.categoryUuid}:${item.priority}`)
    .join("|");

  useEffect(() => {
    if (!open) return;
    setItems(buildConfigItems(categories, row));
  }, [open, row?.service.uuid, categoriesKey, assignedKey]);

  const handleSave = async () => {
    if (!row) return;

    const assignments = items
      .map((item, index) => ({
        categoryUuid: item.categoryUuid,
        priority: index + 1,
        active: item.active,
      }))
      .filter((item) => item.active)
      .map(({ categoryUuid, priority }) => ({ categoryUuid, priority }));

    await assignMutation.mutateAsync({
      serviceUuid: row.service.uuid,
      assignments,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {t("promptAssistant.assignDialog.title", {
              name: row?.service.name ?? "",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("promptAssistant.assignDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-xs">
              {t("promptAssistant.assignDialog.empty")}
            </div>
          ) : null}

          {items.map((item, index) => (
            <div
              key={item.categoryUuid}
              className="bg-muted/20 flex items-center justify-between gap-3 rounded-2xl border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    disabled={index === 0}
                    onClick={() =>
                      setItems((prev) => moveItem(prev, index, -1))
                    }
                  >
                    <IconChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    disabled={index === items.length - 1}
                    onClick={() => setItems((prev) => moveItem(prev, index, 1))}
                  >
                    <IconChevronDown className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 border-e pe-3">
                  <Switch
                    dir="ltr"
                    checked={item.active}
                    onCheckedChange={(checked) =>
                      setItems((prev) =>
                        prev.map((entry) =>
                          entry.categoryUuid === item.categoryUuid
                            ? { ...entry, active: checked }
                            : entry
                        )
                      )
                    }
                  />
                  <span
                    className={cn(
                      "text-[10px] font-black",
                      item.active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.active
                      ? t("promptAssistant.status.active")
                      : t("promptAssistant.status.inactive")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p
                    className="text-muted-foreground font-mono text-[10px]"
                    dir="ltr"
                  >
                    {item.systemKey || "—"}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary border-primary/20 flex size-10 items-center justify-center rounded-xl border">
                  <IconSparkles className="size-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={assignMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("promptAssistant.actions.cancel")}
          </Button>
          <Button
            type="button"
            disabled={assignMutation.isPending}
            onClick={() => void handleSave()}
          >
            {assignMutation.isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : null}
            {t("promptAssistant.assignDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
