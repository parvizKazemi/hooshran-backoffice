import { cn } from "@/lib/utils";

type MediaBlockPreviewProps = {
  type: "image" | "video";
  url: string;
  className?: string;
};

const isEmbeddableVideoUrl = (url: string) =>
  /youtube\.com|youtu\.be|aparat\.com|\/embed/i.test(url);

export function MediaBlockPreview({
  type,
  url,
  className,
}: MediaBlockPreviewProps) {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (type === "image") {
    return (
      <div
        className={cn(
          "bg-muted mt-2 aspect-video max-h-44 overflow-hidden rounded-lg border",
          className
        )}
      >
        <img
          src={trimmed}
          alt=""
          className="size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  if (isEmbeddableVideoUrl(trimmed)) {
    return (
      <div
        className={cn(
          "bg-muted mt-2 aspect-video max-h-52 overflow-hidden rounded-lg border",
          className
        )}
      >
        <iframe
          src={trimmed}
          title="video-preview"
          className="size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-muted mt-2 aspect-video max-h-52 overflow-hidden rounded-lg border",
        className
      )}
    >
      <video src={trimmed} controls className="size-full object-cover" />
    </div>
  );
}
