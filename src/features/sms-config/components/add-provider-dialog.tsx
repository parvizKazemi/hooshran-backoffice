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
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateSmsProvider } from "../hooks/use-sms-config";
import type { CreateSmsProviderPayload } from "../types";

type AddProviderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: CreateSmsProviderPayload = {
  name: "",
  apiUrl: "",
  apiKey: "",
  sender: "",
};

export function AddProviderDialog({
  open,
  onOpenChange,
}: AddProviderDialogProps) {
  const { t } = useTranslation("common");
  const createProvider = useCreateSmsProvider();
  const [form, setForm] = useState<CreateSmsProviderPayload>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
    }
  }, [open]);

  const updateField = <K extends keyof CreateSmsProviderPayload>(
    key: K,
    value: CreateSmsProviderPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload: CreateSmsProviderPayload = {
      name: form.name.trim(),
      apiUrl: form.apiUrl.trim(),
      apiKey: form.apiKey.trim(),
      sender: form.sender.trim(),
    };

    if (
      !payload.name ||
      !payload.apiUrl ||
      !payload.apiKey ||
      !payload.sender
    ) {
      toast.error(t("smsConfig.toasts.addFieldsRequired"));
      return;
    }

    try {
      await createProvider.mutateAsync(payload);
      onOpenChange(false);
    } catch {
      // Error toast is handled in the mutation hook (backend message).
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <IconPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm">
                {t("smsConfig.addDialog.title")}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {t("smsConfig.addDialog.description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="font-bold">
              {t("smsConfig.addDialog.nameLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("smsConfig.addDialog.namePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold">
              {t("smsConfig.addDialog.apiUrlLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              dir="ltr"
              className="text-left font-mono"
              value={form.apiUrl}
              onChange={(e) => updateField("apiUrl", e.target.value)}
              placeholder={t("smsConfig.addDialog.apiUrlPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold">
              {t("smsConfig.addDialog.apiKeyLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              dir="ltr"
              className="text-left font-mono"
              value={form.apiKey}
              onChange={(e) => updateField("apiKey", e.target.value)}
              placeholder={t("smsConfig.addDialog.apiKeyPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold">
              {t("smsConfig.addDialog.senderLabel")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              dir="ltr"
              className="font-mono"
              value={form.sender}
              onChange={(e) => updateField("sender", e.target.value)}
              placeholder={t("smsConfig.addDialog.senderPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={createProvider.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("smsConfig.actions.cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            disabled={createProvider.isPending}
            onClick={handleSubmit}
          >
            {createProvider.isPending && (
              <IconLoader2 className="size-4 animate-spin" />
            )}
            {t("smsConfig.actions.confirmAdd")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
