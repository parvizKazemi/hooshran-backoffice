import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMediaFile } from "@/lib/upload-media";
import { useAuth } from "@/contexts/auth-context";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  showUrlInput?: boolean;
  showFileName?: boolean;
  compressImages?: boolean;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*,video/*",
  showUrlInput = true,
  showFileName = true,
  compressImages = false,
  disabled = false,
  onUploadingChange,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { authData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUploading = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const url = await uploadMediaFile(file, {
        accessToken: authData?.token?.accessToken,
        compressImages,
      });
      onChange(url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="ml-2 h-4 w-4" />
          {isUploading ? "در حال آپلود..." : "انتخاب فایل"}
        </Button>
        {value && showFileName && (
          <span className="text-muted-foreground max-w-xs truncate text-sm">
            {value.split("/").pop()}
          </span>
        )}
      </div>
      {value && showUrlInput && (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="یا URL مستقیم وارد کنید"
          className="text-xs"
          disabled={disabled || isUploading}
          dir="ltr"
        />
      )}
    </div>
  );
}
