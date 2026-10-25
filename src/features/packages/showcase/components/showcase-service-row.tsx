import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pin, PinOff, Sparkles } from "lucide-react";
import type { ShowcaseService } from "../types";

interface ShowcaseServiceRowProps {
  service: ShowcaseService;
  onToggleActive: (serviceId: string) => void;
  onTogglePin: (serviceId: string) => void;
}

export function ShowcaseServiceRow({
  service,
  onToggleActive,
  onTogglePin,
}: ShowcaseServiceRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: service.id,
    data: {
      type: "service",
      service,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isPinned = service.isPinned;
  const isActive = service.isActive;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border-border/60 relative flex flex-col justify-between gap-3 border-b p-4 transition-all last:border-b-0 sm:flex-row sm:items-center",
        // Pinned state styling
        isPinned
          ? "border-e-4 border-e-amber-500 bg-linear-to-l from-amber-500/10 to-amber-500/5 dark:from-amber-500/15 dark:to-transparent"
          : "bg-card hover:bg-muted/30 border-e-4 border-e-transparent",
        // Inactive state styling
        !isActive && "bg-muted/20 border-dashed opacity-80",
        // Dragging state styling
        isDragging && "ring-primary bg-card z-30 opacity-50 shadow-lg ring-2"
      )}
    >
      {/* Service Info with Drag Handle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab touch-none rounded-md p-1 transition-colors active:cursor-grabbing",
            isPinned
              ? "text-amber-500 hover:text-amber-600 dark:text-amber-400"
              : "text-muted-foreground/60 hover:text-foreground"
          )}
          title="جابجایی ترتیب سرویس"
          aria-label="جابجایی ترتیب سرویس"
        >
          <GripVertical className="size-4.5" />
        </button>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "text-sm font-bold transition-colors",
                isPinned
                  ? "text-amber-950 dark:text-amber-200"
                  : !isActive
                    ? "text-muted-foreground"
                    : "text-foreground"
              )}
            >
              {service.title}
            </h3>

            {/* Pinned flagship badge */}
            {isPinned && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 rounded-md border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-900 dark:text-amber-300"
              >
                <Sparkles className="size-3 text-amber-600 dark:text-amber-400" />
                پرچمدار
              </Badge>
            )}

            {/* Custom status badge like 'مخفی موقت' or 'نسخه قدیمی' */}
            {service.badge && (
              <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-bold">
                {service.badge}
              </span>
            )}
          </div>

          <p
            className={cn(
              "text-[11px]",
              isPinned
                ? "text-amber-900/80 dark:text-amber-300/80"
                : "text-muted-foreground"
            )}
          >
            {service.costDescription}
          </p>
        </div>
      </div>

      {/* Actions & Controls */}
      <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
        {/* Status Badge */}
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            نمایش فعال
          </span>
        ) : (
          <span className="bg-muted border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold">
            <span className="bg-muted-foreground/60 size-1.5 rounded-full" />
            مخفی از جدول
          </span>
        )}

        {/* Pin / Unpin Button */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={isPinned ? "default" : "outline"}
                size="icon"
                onClick={() => onTogglePin(service.id)}
                className={cn(
                  "size-8 cursor-pointer rounded-lg transition-colors",
                  isPinned
                    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600 dark:bg-amber-500 dark:text-slate-950"
                    : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                )}
                aria-label={
                  isPinned ? "خارج کردن از حالت پین" : "پین کردن (پرچمدار)"
                }
              >
                {isPinned ? (
                  <PinOff className="size-4" />
                ) : (
                  <Pin className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isPinned ? "خارج کردن از حالت پین" : "پین کردن در صدر دسته"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* High-Contrast Visibility Switch */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Switch
                  dir="ltr"
                  checked={isActive}
                  onCheckedChange={() => onToggleActive(service.id)}
                  aria-label="تغییر وضعیت نمایش سرویس"
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isActive ? "مخفی کردن از ویترین" : "فعال کردن نمایش"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
