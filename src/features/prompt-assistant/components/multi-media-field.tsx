import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/features/notifications/components/file-uploader";
import { cn } from "@/lib/utils";
import {
  IconPhoto,
  IconTrash,
  IconUpload,
  IconVideo,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { isVideoUrl } from "../utils/prompt-assistant.helpers";

type MultiMediaFieldProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

export function MultiMediaField({
  value,
  onChange,
  accept = "image/*,video/*",
  disabled = false,
  className,
}: MultiMediaFieldProps) {
  const { t } = useTranslation("common");

  const handleAddUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleManualUrl = (url: string) => {
    handleAddUrl(url);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((url, index) => {
          const isVideo = isVideoUrl(url);
          return (
            <div
              key={`${url}-${index}`}
              className="bg-muted/40 group relative size-20 overflow-hidden rounded-xl border"
            >
              {isVideo ? (
                <video
                  src={url}
                  className="size-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img src={url} alt="" className="size-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-1.5 py-1">
                {isVideo ? (
                  <IconVideo className="size-3 text-white" />
                ) : (
                  <IconPhoto className="size-3 text-white" />
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                  className="text-white/80 hover:text-rose-300"
                >
                  <IconTrash className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <FileUploader
        value=""
        onChange={handleAddUrl}
        accept={accept}
        showUrlInput={false}
        showFileName={false}
        disabled={disabled}
      />

      <div className="flex items-center gap-2">
        <Input
          dir="ltr"
          className="font-mono text-xs"
          placeholder={t("promptAssistant.media.urlPlaceholder")}
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            handleManualUrl(event.currentTarget.value);
            event.currentTarget.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={(event) => {
            const input = event.currentTarget
              .previousElementSibling as HTMLInputElement | null;
            if (!input) return;
            handleManualUrl(input.value);
            input.value = "";
          }}
        >
          <IconUpload className="size-3.5" />
          {t("promptAssistant.media.addLink")}
        </Button>
      </div>
    </div>
  );
}
