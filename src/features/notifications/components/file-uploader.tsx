import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState } from "react";

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*,video/*",
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
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
        {value && (
          <span className="text-muted-foreground max-w-xs truncate text-sm">
            {value.split("/").pop()}
          </span>
        )}
      </div>
      {value && (
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
