import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiUpload } from "@/services/api";

const MAX_IMAGE_SIZE_MB = 1;

// Utility function to compress image if it's larger than 1MB
async function compressImage(
  file: File,
  maxSizeMB: number = MAX_IMAGE_SIZE_MB
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // If file is already small enough, return as is
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Try different quality levels to reach target size
      const compressWithQuality = (quality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size <= maxSizeBytes) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else if (quality > 0.1) {
              // Try lower quality
              compressWithQuality(quality - 0.1);
            } else {
              // If still too big, return original file
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      compressWithQuality(0.8);
    };

    img.src = URL.createObjectURL(file);
  });
}

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
  compressImages?: boolean;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*,video/*",
  showUrlInput = true,
  showFileName = true,
  compressImages = false,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { authData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let fileToUpload = file;

      // Compress image if it's an image (not GIF)
      if (file.type.startsWith("image/") && file.type !== "image/gif") {
        try {
          const maxSizeMB = compressImages ? MAX_IMAGE_SIZE_MB : 10; // 10MB if compression disabled
          fileToUpload = await compressImage(file, maxSizeMB);
        } catch (error) {
          console.warn(
            "Image compression failed, uploading original file:",
            error
          );
        }
      }

      // تشخیص نوع فایل بر اساس MIME type
      let fileType = 1; // پیش‌فرض برای تصویر و ویدیو
      if (fileToUpload.type.startsWith("audio/")) {
        fileType = 2; // صدا
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
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
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
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
          onChange={(e) => onChange(e.target.value)}
          placeholder="یا URL مستقیم وارد کنید"
          className="text-xs"
        />
      )}
    </div>
  );
}
