import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PROMPT_DISPLAY_TYPE, PROMPT_STATUS } from "../constants";
import {
  usePromptsByCategory,
  useSaveCategoryPrompts,
} from "../hooks/use-prompt-assistant";
import type {
  EditablePromptOption,
  PromptCategory,
  PromptItem,
} from "../types";
import {
  createEmptyPromptOption,
  promptToEditable,
} from "../utils/prompt-assistant.helpers";
import { MultiMediaField } from "./multi-media-field";

const EMPTY_PROMPTS: PromptItem[] = [];

type CategoryValuesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PromptCategory | null;
};

export function CategoryValuesDialog({
  open,
  onOpenChange,
  category,
}: CategoryValuesDialogProps) {
  const { t } = useTranslation("common");
  const categoryUuid = category?.uuid;
  const { data, isLoading, isFetched, dataUpdatedAt } = usePromptsByCategory(
    open ? categoryUuid : undefined
  );
  const saveMutation = useSaveCategoryPrompts();
  const [options, setOptions] = useState<EditablePromptOption[]>([]);
  const [baselineOptions, setBaselineOptions] = useState<
    EditablePromptOption[]
  >([]);

  useEffect(() => {
    if (!open || !isFetched) return;

    const list = data ?? EMPTY_PROMPTS;
    const next = list.map(promptToEditable);
    setOptions(next);
    setBaselineOptions(next);
  }, [open, categoryUuid, isFetched, dataUpdatedAt, data]);

  const updateOption = (
    localId: string,
    patch: Partial<EditablePromptOption>
  ) => {
    setOptions((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item
      )
    );
  };

  const handleSave = async () => {
    if (!categoryUuid) return;

    const invalid = options.some(
      (item) => !item.title.trim() || !item.prompt.trim()
    );
    if (invalid) {
      toast.error(t("promptAssistant.valuesDialog.validationRequired"));
      return;
    }

    await saveMutation.mutateAsync({
      categoryUuid,
      options,
      baselineOptions,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>
                {t("promptAssistant.valuesDialog.title", {
                  title: category?.title ?? "",
                })}
              </DialogTitle>
              <DialogDescription>
                {t("promptAssistant.valuesDialog.description")}
              </DialogDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                setOptions((prev) => [...prev, createEmptyPromptOption()])
              }
            >
              <IconPlus className="size-4" />
              {t("promptAssistant.valuesDialog.addOption")}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
              <IconLoader2 className="size-4 animate-spin" />
              {t("promptAssistant.loading")}
            </div>
          ) : null}

          {!isLoading && options.length === 0 ? (
            <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-xs">
              {t("promptAssistant.valuesDialog.empty")}
            </div>
          ) : null}

          {options.map((option) => {
            const isVideo = option.displayType === PROMPT_DISPLAY_TYPE.VIDEO;

            return (
              <div
                key={option.localId}
                className="bg-muted/20 relative rounded-2xl border p-4"
              >
                <div className="absolute top-3 left-3">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive size-7"
                    onClick={() =>
                      setOptions((prev) =>
                        prev.filter((item) => item.localId !== option.localId)
                      )
                    }
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div className="space-y-3 pt-8 md:pt-0">
                    <div className="space-y-1.5">
                      <Label>
                        {t("promptAssistant.valuesDialog.optionTitle")}
                      </Label>
                      <Input
                        value={option.title}
                        onChange={(event) =>
                          updateOption(option.localId, {
                            title: event.target.value,
                          })
                        }
                        placeholder={t(
                          "promptAssistant.valuesDialog.optionTitlePlaceholder"
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        {t("promptAssistant.valuesDialog.optionPrompt")}
                      </Label>
                      <Input
                        dir="ltr"
                        className="font-mono text-xs"
                        value={option.prompt}
                        onChange={(event) =>
                          updateOption(option.localId, {
                            prompt: event.target.value,
                          })
                        }
                        placeholder={t(
                          "promptAssistant.valuesDialog.optionPromptPlaceholder"
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        {t("promptAssistant.valuesDialog.mediaType")}
                      </Label>
                      <div className="bg-background grid grid-cols-2 gap-1 rounded-xl border p-1">
                        <button
                          type="button"
                          className={cn(
                            "rounded-lg py-2 text-[11px] font-bold transition",
                            !isVideo
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() =>
                            updateOption(option.localId, {
                              displayType: PROMPT_DISPLAY_TYPE.PICTURE,
                            })
                          }
                        >
                          {t("promptAssistant.valuesDialog.picture")}
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "rounded-lg py-2 text-[11px] font-bold transition",
                            isVideo
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() =>
                            updateOption(option.localId, {
                              displayType: PROMPT_DISPLAY_TYPE.VIDEO,
                            })
                          }
                        >
                          {t("promptAssistant.valuesDialog.video")}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">
                          {t("promptAssistant.valuesDialog.status")}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {option.status === PROMPT_STATUS.ACTIVE
                            ? t("promptAssistant.status.active")
                            : t("promptAssistant.status.inactive")}
                        </p>
                      </div>
                      <Switch
                        dir="ltr"
                        checked={option.status === PROMPT_STATUS.ACTIVE}
                        onCheckedChange={(checked) =>
                          updateOption(option.localId, {
                            status: checked
                              ? PROMPT_STATUS.ACTIVE
                              : PROMPT_STATUS.INACTIVE,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("promptAssistant.valuesDialog.media")}</Label>
                    <MultiMediaField
                      value={option.pictures}
                      onChange={(pictures) =>
                        updateOption(option.localId, { pictures })
                      }
                      accept={isVideo ? "video/*" : "image/*,video/*"}
                    />
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
            disabled={saveMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("promptAssistant.actions.cancel")}
          </Button>
          <Button
            type="button"
            disabled={saveMutation.isPending || isLoading}
            onClick={() => void handleSave()}
          >
            {saveMutation.isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : null}
            {t("promptAssistant.valuesDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
