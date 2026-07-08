import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconAlertCircle, IconFileImport, IconX } from "@tabler/icons-react";
import { ChangeEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { extractPhoneNumbersFromCsv } from "../utils/parse-phone-csv";

const PHONE_REGEX = /^09\d{9}$/;
const TAG_DELIMITER_REGEX = /[\s,]+/;

type PhoneNumbersTagInputProps = {
  id?: string;
  value: string[];
  onChange: (phones: string[]) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  invalidPhoneMessage?: string;
  serverInvalidPhones?: string[];
};

export function PhoneNumbersTagInput({
  id = "phone-numbers-tag-input",
  value,
  onChange,
  label,
  hint,
  placeholder,
  invalidPhoneMessage,
  serverInvalidPhones = [],
}: PhoneNumbersTagInputProps) {
  const { t } = useTranslation("common");
  const [phoneDraft, setPhoneDraft] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  const serverInvalidPhoneSet = useMemo(
    () => new Set(serverInvalidPhones),
    [serverInvalidPhones]
  );
  const hasServerInvalidPhones = serverInvalidPhoneSet.size > 0;

  const normalizedPhones = useMemo(
    () => value.map((phone) => phone.trim()).filter(Boolean),
    [value]
  );

  const mergePhones = (candidates: string[]) => {
    if (candidates.length === 0) {
      return { addedCount: 0, hasInvalidPhone: false };
    }

    const dedupedNumbers = new Set(normalizedPhones);
    let addedCount = 0;
    let hasInvalidPhone = false;

    for (const phone of candidates) {
      if (!PHONE_REGEX.test(phone)) {
        hasInvalidPhone = true;
        continue;
      }

      if (!dedupedNumbers.has(phone)) {
        addedCount += 1;
      }
      dedupedNumbers.add(phone);
    }

    if (hasInvalidPhone) {
      toast.error(
        invalidPhoneMessage ?? t("discountCodes.form.errors.invalidPhone")
      );
    }

    onChange(Array.from(dedupedNumbers));
    return { addedCount, hasInvalidPhone };
  };

  const applyPhoneTags = (rawValue: string) => {
    const candidates = rawValue
      .split(TAG_DELIMITER_REGEX)
      .map((item) => item.trim())
      .filter(Boolean);

    if (candidates.length === 0) {
      return;
    }

    mergePhones(candidates);
    setPhoneDraft("");
  };

  const handlePhoneDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" ||
      event.key === "," ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      applyPhoneTags(phoneDraft);
    }
  };

  const handlePhoneDraftBlur = () => {
    if (phoneDraft.trim().length > 0) {
      applyPhoneTags(phoneDraft);
    }
  };

  const handleTagRemove = (phoneToRemove: string) => {
    onChange(normalizedPhones.filter((phone) => phone !== phoneToRemove));
  };

  const handleTagEdit = (phoneToEdit: string) => {
    onChange(normalizedPhones.filter((phone) => phone !== phoneToEdit));
    setPhoneDraft(phoneToEdit);
  };

  const handleCsvImportClick = () => {
    csvInputRef.current?.click();
  };

  const handleCsvFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error(t("discountCodes.form.phoneTags.csvInvalidFile"));
      return;
    }

    try {
      const content = await file.text();
      const importedPhones = extractPhoneNumbersFromCsv(content);

      if (importedPhones.length === 0) {
        toast.error(t("discountCodes.form.phoneTags.csvEmpty"));
        return;
      }

      const { addedCount } = mergePhones(importedPhones);

      if (addedCount === 0) {
        toast.info(t("discountCodes.form.phoneTags.csvDuplicate"));
        return;
      }

      toast.success(
        t("discountCodes.form.phoneTags.csvSuccess", { count: addedCount })
      );
    } catch {
      toast.error(t("discountCodes.form.phoneTags.csvReadError"));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-1.5 text-xs"
          onClick={handleCsvImportClick}
        >
          <IconFileImport className="size-3.5" />
          {t("discountCodes.form.phoneTags.importCsv")}
        </Button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleCsvFileChange}
        />
      </div>
      <div
        className={cn(
          "rounded-lg border p-3 transition-colors",
          hasServerInvalidPhones && "border-destructive/50 bg-destructive/5"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          {normalizedPhones.map((phone) => {
            const isServerInvalid = serverInvalidPhoneSet.has(phone);

            return (
              <span
                key={phone}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs",
                  isServerInvalid
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleTagEdit(phone)}
                  className="cursor-pointer"
                >
                  {phone}
                </button>
                <button
                  type="button"
                  onClick={() => handleTagRemove(phone)}
                  className={cn(
                    "rounded-sm p-0.5",
                    isServerInvalid
                      ? "hover:bg-destructive/15"
                      : "hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  )}
                  aria-label={t("discountCodes.form.phoneTags.removeAria")}
                >
                  <IconX className="size-3" />
                </button>
              </span>
            );
          })}
          <Input
            id={id}
            dir="ltr"
            value={phoneDraft}
            onChange={(event) => setPhoneDraft(event.target.value)}
            onKeyDown={handlePhoneDraftKeyDown}
            onBlur={handlePhoneDraftBlur}
            className="h-9 min-w-[220px] flex-1 border-0 px-0 font-mono shadow-none focus-visible:ring-0"
            placeholder={
              placeholder ?? t("discountCodes.form.phoneTags.placeholder")
            }
          />
        </div>
      </div>
      {hasServerInvalidPhones && (
        <div className="border-destructive/30 bg-destructive/5 flex gap-2 rounded-lg border px-3 py-2.5">
          <IconAlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
          <div className="space-y-1 text-xs">
            <p className="text-destructive font-semibold">
              {t("discountCodes.form.phoneTags.serverInvalidTitle")}
            </p>
            <p className="text-destructive/90 font-mono" dir="ltr">
              {serverInvalidPhones.join(" · ")}
            </p>
            <p className="text-muted-foreground">
              {t("discountCodes.form.phoneTags.serverInvalidHint")}
            </p>
          </div>
        </div>
      )}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      <p className="text-muted-foreground text-xs">
        {t("discountCodes.form.phoneTags.csvHint")}
      </p>
    </div>
  );
}
