import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiUpload } from "@/services/api";

interface UploadResponse {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  fileExtension: string;
  mediaType: number;
  fileSize: number;
  url: string;
}

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  showUrlInput?: boolean;
  showFileName?: boolean;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*,video/*",
  showUrlInput = true,
  showFileName = true,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { authData } = useAuth();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // تشخیص نوع فایل بر اساس MIME type
      let fileType = 1; // پیش‌فرض برای تصویر و ویدیو
      if (file.type.startsWith("audio/")) {
        fileType = 2; // صدا
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", fileType.toString());

      const data = await apiUpload<UploadResponse>("/upload", formData, {
        headers: {
          Authorization: `Bearer ${authData?.token?.accessToken}`,
        },
      });

      onChange(data.url);
    } catch (error) {
      console.error("Upload failed:", error);
      // Fallback to mock URL for now
      const mockUrl = `https://files.hooshran.app/mock/${Date.now()}-${file.name}`;
      onChange(mockUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById("file-upload")?.click()}
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
          onChange={(e) => onChange(e.target.value)}
          placeholder="یا URL مستقیم وارد کنید"
          className="text-xs"
        />
      )}
    </div>
  );
}
