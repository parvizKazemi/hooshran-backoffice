import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateTextChatModel,
  usePatchTextChatModel,
} from "../hooks/use-text-chat-models";
import type { TextChatModel, TextChatModelFormValues } from "../types";
import {
  EMPTY_TEXT_CHAT_MODEL_FORM,
  modelToFormValues,
  toCreatePayload,
  toUpdatePayload,
  validateTextChatModelForm,
  type TextChatModelFormErrorKey,
} from "../utils/text-chat-model-form";

type TextChatModelFormDialogProps = {
  open: boolean;
  model?: TextChatModel | null;
  onOpenChange: (open: boolean) => void;
};

export function TextChatModelFormDialog({
  open,
  model,
  onOpenChange,
}: TextChatModelFormDialogProps) {
  const { t } = useTranslation("common");
  const isEditing = Boolean(model);
  const createModel = useCreateTextChatModel();
  const patchModel = usePatchTextChatModel();
  const [values, setValues] = useState<TextChatModelFormValues>(EMPTY_TEXT_CHAT_MODEL_FORM);
  const [errorKey, setErrorKey] = useState<TextChatModelFormErrorKey | null>(null);
  const isSaving = createModel.isPending || patchModel.isPending;

  useEffect(() => {
    if (!open) return;
    setValues(model ? modelToFormValues(model) : EMPTY_TEXT_CHAT_MODEL_FORM);
    setErrorKey(null);
  }, [open, model]);

  const setField = <K extends keyof TextChatModelFormValues>(
    key: K,
    value: TextChatModelFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrorKey(null);
  };

  const handleSubmit = async () => {
    const validation = validateTextChatModelForm(values, isEditing ? "edit" : "create");
    if (validation) {
      setErrorKey(validation);
      return;
    }

    try {
      if (isEditing && model) {
        await patchModel.mutateAsync({
          code: model.code,
          payload: toUpdatePayload(values),
          toastKey: "updated",
        });
      } else {
        await createModel.mutateAsync(toCreatePayload(values));
      }
      onOpenChange(false);
    } catch {
      /* toast is shown by the mutation */
    }
  };

  const errorMessage = errorKey
    ? errorKey === "outputOverMax" || errorKey === "inputOverMax"
      ? t(`textChatModels.${errorKey}`)
      : t(`textChatModels.validation.${errorKey}`)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("textChatModels.form.editTitle")
              : t("textChatModels.form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("textChatModels.form.editDescription")
              : t("textChatModels.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Field
            label={t("textChatModels.form.code")}
            hint={t("textChatModels.form.codeHint")}
          >
            <Input
              dir="ltr"
              value={values.code}
              disabled={isEditing || isSaving}
              onChange={(event) => setField("code", event.target.value)}
              placeholder="grok-4.6"
            />
          </Field>

          <Field label={t("textChatModels.form.name")}>
            <Input
              value={values.name}
              disabled={isSaving}
              onChange={(event) => setField("name", event.target.value)}
            />
          </Field>

          <Field
            label={t("textChatModels.form.priceRatio")}
            hint={t("textChatModels.form.priceRatioHint")}
          >
            <Input
              dir="ltr"
              inputMode="decimal"
              value={values.priceRatio}
              disabled={isSaving}
              onChange={(event) => setField("priceRatio", event.target.value)}
            />
          </Field>

          <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
            <Label htmlFor="text-chat-model-active">{t("textChatModels.form.isActive")}</Label>
            <Switch
              id="text-chat-model-active"
              dir="ltr"
              checked={values.isActive}
              disabled={isSaving}
              onCheckedChange={(checked) => setField("isActive", checked)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TokenField
              label={t("textChatModels.form.outputToken")}
              value={values.outputToken}
              disabled={isSaving}
              onChange={(value) => setField("outputToken", value)}
            />
            <TokenField
              label={t("textChatModels.form.inputToken")}
              value={values.inputToken}
              disabled={isSaving}
              onChange={(value) => setField("inputToken", value)}
            />
            <TokenField
              label={t("textChatModels.form.maxToken")}
              value={values.maxToken}
              disabled={isSaving}
              onChange={(value) => setField("maxToken", value)}
            />
          </div>
          <p className="text-muted-foreground text-xs">{t("textChatModels.tokenHint")}</p>

          {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("textChatModels.form.cancel")}
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSaving}>
            {isSaving ? <IconLoader2 className="size-4 animate-spin" /> : null}
            {isSaving ? t("textChatModels.form.saving") : t("textChatModels.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function TokenField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("common");
  return (
    <Field label={label} hint={t("textChatModels.form.tokenOptional")}>
      <Input
        dir="ltr"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
