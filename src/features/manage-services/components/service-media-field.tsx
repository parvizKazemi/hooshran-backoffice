import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/features/notifications/components/file-uploader";
import { MediaBlockPreview } from "@/features/service-hint/components/media-block-preview";
import { cn } from "@/lib/utils";
import {
  IconLink,
  IconPhoto,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type MediaSourceMode = "upload" | "link";

type ServiceMediaFieldProps = {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
};

function detectPreviewType(url: string): "image" | "video" {
  const lower = url.toLowerCase();
  if (
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(lower) ||
    /youtube\.com|youtu\.be|aparat\.com|\/embed/i.test(lower)
  ) {
    return "video";
  }
  return "image";
}

export function ServiceMediaField({
  value,
  onChange,
  error,
  disabled = false,
}: ServiceMediaFieldProps) {
  const { t } = useTranslation("common");
  const [mode, setMode] = useState<MediaSourceMode>(value ? "link" : "upload");

  const previewType = useMemo(() => detectPreviewType(value), [value]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            {
              key: "upload",
              icon: IconUpload,
              label: t("manageServices.form.mediaUpload"),
            },
            {
              key: "link",
              icon: IconLink,
              label: t("manageServices.form.mediaLink"),
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
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-border bg-muted/40 text-muted-foreground hover:border-emerald-500/40"
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
          accept="image/*,video/*"
          showUrlInput={false}
          showFileName
          disabled={disabled}
        />
      ) : (
        <Input
          dir="ltr"
          className="text-start font-mono text-xs"
          placeholder={t("manageServices.form.mediaLinkPlaceholder")}
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
              {t("manageServices.form.mediaPreview")}
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
              {t("manageServices.form.mediaClear")}
            </Button>
          </div>
          <MediaBlockPreview type={previewType} url={value} />
          <p
            className="text-muted-foreground truncate font-mono text-[10px]"
            dir="ltr"
          >
            {value}
          </p>
        </div>
      ) : (
        <div className="bg-muted/30 text-muted-foreground flex aspect-video max-h-40 items-center justify-center rounded-xl border border-dashed text-xs">
          {t("manageServices.form.mediaEmpty")}
        </div>
      )}

      {error ? (
        <p className="text-destructive text-[11px] font-medium">{error}</p>
      ) : null}
    </div>
  );
}
