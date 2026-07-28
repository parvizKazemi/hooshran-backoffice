import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/features/notifications/components/file-uploader";
import { cn } from "@/lib/utils";
import {
  IconLink,
  IconPhoto,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ImageSourceMode = "upload" | "link";

type CategoryImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
};

export function CategoryImageField({
  value,
  onChange,
  error,
  disabled = false,
}: CategoryImageFieldProps) {
  const { t } = useTranslation("common");
  const [mode, setMode] = useState<ImageSourceMode>(value ? "link" : "upload");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            {
              key: "upload",
              icon: IconUpload,
              label: t("categories.form.imageUpload"),
            },
            {
              key: "link",
              icon: IconLink,
              label: t("categories.form.imageLink"),
            },
          ] as const
        ).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => setMode(key)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors",
              mode === key
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <FileUploader
          value={value}
          onChange={onChange}
          accept="image/*"
          showUrlInput={false}
          showFileName
          compressImages
          disabled={disabled}
        />
      ) : (
        <Input
          dir="ltr"
          className="text-start font-mono text-xs"
          placeholder={t("categories.form.imageLinkPlaceholder")}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {value ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
              <IconPhoto className="size-3.5" />
              {t("categories.form.imagePreview")}
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive h-7 px-2 text-[11px]"
              disabled={disabled}
              onClick={() => onChange("")}
            >
              <IconTrash className="size-3.5" />
              {t("categories.form.imageClear")}
            </Button>
          </div>
          <div className="bg-muted aspect-video max-h-40 overflow-hidden rounded-xl border">
            <img
              src={value}
              alt=""
              className="size-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
          <p
            className="text-muted-foreground truncate font-mono text-[10px]"
            dir="ltr"
          >
            {value}
          </p>
        </div>
      ) : (
        <div className="bg-muted/30 text-muted-foreground flex aspect-video max-h-36 items-center justify-center rounded-xl border border-dashed text-xs">
          {t("categories.form.imageEmpty")}
        </div>
      )}

      {error ? (
        <p className="text-destructive text-[11px] font-medium">{error}</p>
      ) : null}
    </div>
  );
}
