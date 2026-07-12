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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconKey } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ACTION_LABEL_KEYS,
  isKnownSmsAction,
  isKnownSmsProviderId,
  PROVIDER_LABEL_KEYS,
  resolveTemplateActions,
} from "../constants";
import type { SmsProviderConfigItem, SmsTemplateConfig } from "../types";

type TemplatesDialogProps = {
  open: boolean;
  provider: SmsProviderConfigItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (provider: SmsProviderConfigItem) => void;
};

type ParamRow = { key: string; value: string };

type DraftTemplate = {
  templateId: string;
  params: ParamRow[];
};

type DraftTemplates = Record<string, DraftTemplate>;

function toDraft(
  templates: Record<string, SmsTemplateConfig>,
  actions: string[]
): DraftTemplates {
  return actions.reduce<DraftTemplates>((acc, action) => {
    const template = templates[action];
    acc[action] = {
      templateId: template?.templateId ?? "",
      params: Object.entries(template?.params ?? {}).map(([key, value]) => ({
        key,
        value,
      })),
    };
    return acc;
  }, {});
}

function fromDraft(
  provider: SmsProviderConfigItem,
  draft: DraftTemplates,
  actions: string[]
): SmsProviderConfigItem {
  const templates = actions.reduce<Record<string, SmsTemplateConfig>>(
    (acc, action) => {
      const item = draft[action];
      if (!item) return acc;
      acc[action] = {
        templateId: item.templateId.trim(),
        params: Object.fromEntries(
          item.params
            .filter((row) => row.key.trim())
            .map((row) => [row.key.trim(), row.value])
        ),
      };
      return acc;
    },
    {}
  );

  return { ...provider, templates };
}

export function TemplatesDialog({
  open,
  provider,
  onOpenChange,
  onSave,
}: TemplatesDialogProps) {
  const { t } = useTranslation("common");
  const [draft, setDraft] = useState<DraftTemplates | null>(null);
  const [activeTab, setActiveTab] = useState("");

  const actions = useMemo(
    () => (provider ? resolveTemplateActions(provider.templates) : []),
    [provider]
  );

  useEffect(() => {
    if (open && provider) {
      const nextActions = resolveTemplateActions(provider.templates);
      setDraft(toDraft(provider.templates, nextActions));
      setActiveTab(nextActions[0] ?? "");
    }
  }, [open, provider]);

  if (!provider || !draft || actions.length === 0) {
    return null;
  }

  const getActionLabel = (action: string) =>
    isKnownSmsAction(action) ? t(ACTION_LABEL_KEYS[action]) : action;

  const updateTemplateId = (action: string, templateId: string) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [action]: { ...prev[action]!, templateId },
          }
        : prev
    );
  };

  const updateParamValue = (action: string, index: number, value: string) => {
    setDraft((prev) => {
      if (!prev?.[action]) return prev;
      const params = prev[action].params.map((row, i) =>
        i === index ? { ...row, value } : row
      );
      return { ...prev, [action]: { ...prev[action], params } };
    });
  };

  const handleSave = () => {
    const missing = actions.some((action) => !draft[action]?.templateId.trim());
    if (missing) {
      toast.error(t("smsConfig.toasts.templateIdRequired"));
      return;
    }

    onSave(fromDraft(provider, draft, actions));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <IconKey className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm">
                {t("smsConfig.templatesDialog.title")}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {t("smsConfig.templatesDialog.description", {
                  name: isKnownSmsProviderId(provider.id)
                    ? t(PROVIDER_LABEL_KEYS[provider.id])
                    : provider.id,
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-1">
            {actions.map((action) => (
              <TabsTrigger key={action} value={action} className="text-[11px]">
                {getActionLabel(action)}
              </TabsTrigger>
            ))}
          </TabsList>

          {actions.map((action) => {
            const item = draft[action];
            if (!item) return null;

            return (
              <TabsContent key={action} value={action} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">
                    {t("smsConfig.templatesDialog.templateId")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    dir="ltr"
                    className="font-mono text-sm"
                    value={item.templateId}
                    onChange={(e) => updateTemplateId(action, e.target.value)}
                    placeholder={t(
                      "smsConfig.templatesDialog.templateIdPlaceholder"
                    )}
                  />
                </div>

                {item.params.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">
                      {t("smsConfig.templatesDialog.params")}
                    </Label>
                    <div className="text-muted-foreground grid grid-cols-[1fr_1.2fr] gap-2 text-[10px] font-semibold tracking-wide uppercase">
                      <span>{t("smsConfig.templatesDialog.paramKey")}</span>
                      <span>{t("smsConfig.templatesDialog.paramValue")}</span>
                    </div>
                    {item.params.map((row, index) => (
                      <div
                        key={`${action}-${row.key}-${index}`}
                        className="grid grid-cols-[1fr_1.2fr] gap-2"
                      >
                        <Input
                          dir="ltr"
                          className="bg-muted/40 font-mono text-xs"
                          value={row.key}
                          readOnly
                        />
                        <Input
                          dir="ltr"
                          className="font-mono text-sm"
                          value={row.value}
                          onChange={(e) =>
                            updateParamValue(action, index, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            {t("smsConfig.actions.cancel")}
          </Button>
          <Button type="button" className="flex-1" onClick={handleSave}>
            {t("smsConfig.actions.saveTemplates")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
