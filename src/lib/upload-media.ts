import { apiUpload } from "@/services/api";

const MAX_IMAGE_SIZE_MB = 1;

export type UploadMediaResponse = {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  fileExtension: string;
  mediaType: number;
  fileSize: number;
  url: string;
};

async function compressImage(
  file: File,
  maxSizeMB: number = MAX_IMAGE_SIZE_MB
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      const compressWithQuality = (quality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size <= maxSizeBytes) {
              resolve(
                new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
              );
            } else if (quality > 0.1) {
              compressWithQuality(quality - 0.1);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      compressWithQuality(0.8);
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

type UploadMediaOptions = {
  accessToken?: string;
  compressImages?: boolean;
};

export async function uploadMediaFile(
  file: File,
  options: UploadMediaOptions = {}
): Promise<string> {
  let fileToUpload = file;

  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      const maxSizeMB = options.compressImages ? MAX_IMAGE_SIZE_MB : 10;
      fileToUpload = await compressImage(file, maxSizeMB);
    } catch {
      fileToUpload = file;
    }
  }

  let fileType = 1;
  if (fileToUpload.type.startsWith("audio/")) {
    fileType = 2;
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("type", fileType.toString());

  const headers: HeadersInit = {};
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const data = await apiUpload<UploadMediaResponse>("/upload", formData, {
    headers,
  });

  return data.url;
}
