import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";
import { KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { normalizePromptFilters } from "../utils/prompt-assistant.helpers";

const TAG_DELIMITER_REGEX = /[,،]+/;

type FilterTagsFieldProps = {
  value: string[];
  onChange: (filters: string[]) => void;
  disabled?: boolean;
};

export function FilterTagsField({
  value,
  onChange,
  disabled = false,
}: FilterTagsFieldProps) {
  const { t } = useTranslation("common");
  const [draft, setDraft] = useState("");
  const filters = normalizePromptFilters(value);

  const commitDraft = (raw: string) => {
    const next = normalizePromptFilters([
      ...filters,
      ...raw.split(TAG_DELIMITER_REGEX),
    ]);
    onChange(next);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (draft.trim()) commitDraft(draft);
    }

    if (event.key === "Backspace" && !draft && filters.length > 0) {
      onChange(filters.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "bg-background flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {filters.map((tag) => (
          <span
            key={tag}
            className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-[11px] font-bold"
            dir="ltr"
          >
            {tag}
            <button
              type="button"
              className="hover:bg-primary/15 rounded-sm p-0.5"
              aria-label={t("promptAssistant.valuesDialog.filterRemoveAria")}
              onClick={() => onChange(filters.filter((item) => item !== tag))}
            >
              <IconX className="size-3" />
            </button>
          </span>
        ))}
        <Input
          dir="ltr"
          disabled={disabled}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) commitDraft(draft);
          }}
          className="h-7 min-w-[140px] flex-1 border-0 px-1 font-mono text-xs shadow-none focus-visible:ring-0"
          placeholder={t("promptAssistant.valuesDialog.filterPlaceholder")}
        />
      </div>
      <p className="text-muted-foreground text-[11px]">
        {t("promptAssistant.valuesDialog.filterHint")}
      </p>
    </div>
  );
}
