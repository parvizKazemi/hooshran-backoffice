import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PROMPT_DISPLAY_KIND, PROMPT_DISPLAY_KIND_FILTER } from "../constants";
import { useAssignCategoriesToService } from "../hooks/use-prompt-assistant";
import type {
  PromptCategory,
  PromptDisplayKindFilter,
  ServiceAssignmentRow,
  ServiceCategoryConfigItem,
} from "../types";
import {
  filterActiveCategories,
  getCategoryDisplayKind,
  moveItem,
} from "../utils/prompt-assistant.helpers";

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
    displayKind: getCategoryDisplayKind(category.tags),
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
  const [displayKindFilter, setDisplayKindFilter] =
    useState<PromptDisplayKindFilter>(PROMPT_DISPLAY_KIND_FILTER.ALL);
  const [assignmentOverrides, setAssignmentOverrides] = useState<
    Record<string, boolean>
  >({});
  const [orderOverrides, setOrderOverrides] = useState<string[] | null>(null);

  const activeCategories = useMemo(
    () => filterActiveCategories(categories),
    [categories]
  );

  const baseItems = useMemo(
    () => buildConfigItems(activeCategories, row),
    [activeCategories, row]
  );

  const items = useMemo(() => {
    if (!orderOverrides) return baseItems;
    const byUuid = new Map(baseItems.map((item) => [item.categoryUuid, item]));
    const ordered = orderOverrides
      .map((uuid) => byUuid.get(uuid))
      .filter((item): item is ServiceCategoryConfigItem => Boolean(item));
    const missing = baseItems.filter(
      (item) => !orderOverrides.includes(item.categoryUuid)
    );
    return [...ordered, ...missing];
  }, [baseItems, orderOverrides]);

  const resolvedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        active: assignmentOverrides[item.categoryUuid] ?? item.active,
      })),
    [items, assignmentOverrides]
  );

  const visibleItems = useMemo(() => {
    if (displayKindFilter === PROMPT_DISPLAY_KIND_FILTER.ALL) {
      return resolvedItems;
    }

    return resolvedItems.filter(
      (item) => item.displayKind === displayKindFilter
    );
  }, [resolvedItems, displayKindFilter]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAssignmentOverrides({});
      setOrderOverrides(null);
      setDisplayKindFilter(PROMPT_DISPLAY_KIND_FILTER.ALL);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    if (!row) return;

    const assignments = resolvedItems
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
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <div className="flex items-center justify-between gap-3 border-b px-6 py-3">
          <p className="text-muted-foreground text-xs">
            {t("promptAssistant.assignDialog.filterHint")}
          </p>
          <Select
            value={displayKindFilter}
            onValueChange={(value) =>
              setDisplayKindFilter(value as PromptDisplayKindFilter)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROMPT_DISPLAY_KIND_FILTER.ALL}>
                {t("promptAssistant.displayKind.all")}
              </SelectItem>
              <SelectItem value={PROMPT_DISPLAY_KIND_FILTER.STYLE}>
                {t("promptAssistant.displayKind.style")}
              </SelectItem>
              <SelectItem value={PROMPT_DISPLAY_KIND_FILTER.PROMPT}>
                {t("promptAssistant.displayKind.prompt")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {visibleItems.length === 0 ? (
            <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-xs">
              {t("promptAssistant.assignDialog.empty")}
            </div>
          ) : null}

          {visibleItems.map((item) => {
            const index = resolvedItems.findIndex(
              (entry) => entry.categoryUuid === item.categoryUuid
            );
            const isStyle = item.displayKind === PROMPT_DISPLAY_KIND.STYLE;

            return (
              <div
                key={item.categoryUuid}
                className="bg-muted/20 flex items-center justify-between gap-3 rounded-2xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary border-primary/20 flex size-10 items-center justify-center rounded-xl border">
                    <IconSparkles className="size-5" />
                  </div>
                  <div className="text-end">
                    <div className="mb-1 flex items-center justify-end gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          isStyle
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-primary/20 bg-primary/10 text-primary"
                        )}
                      >
                        {isStyle
                          ? t("promptAssistant.displayKind.style")
                          : t("promptAssistant.displayKind.prompt")}
                      </span>
                      <p className="text-sm font-bold">{item.title}</p>
                    </div>
                    <p
                      className="text-muted-foreground font-mono text-[10px]"
                      dir="ltr"
                    >
                      {item.systemKey || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      dir="ltr"
                      checked={item.active}
                      onCheckedChange={(checked) =>
                        setAssignmentOverrides((prev) => ({
                          ...prev,
                          [item.categoryUuid]: checked,
                        }))
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
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      disabled={index <= 0}
                      onClick={() => {
                        const currentOrder = resolvedItems.map(
                          (entry) => entry.categoryUuid
                        );
                        setOrderOverrides(moveItem(currentOrder, index, -1));
                      }}
                    >
                      <IconChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      disabled={index < 0 || index >= resolvedItems.length - 1}
                      onClick={() => {
                        const currentOrder = resolvedItems.map(
                          (entry) => entry.categoryUuid
                        );
                        setOrderOverrides(moveItem(currentOrder, index, 1));
                      }}
                    >
                      <IconChevronDown className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={assignMutation.isPending}
            onClick={() => handleOpenChange(false)}
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
