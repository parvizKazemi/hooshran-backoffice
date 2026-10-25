import { Button } from "@/components/ui/button";
import { Clock, RotateCcw, Save } from "lucide-react";

interface ShowcaseFooterProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ShowcaseFooter({
  hasUnsavedChanges,
  isSaving,
  onCancel,
  onSave,
}: ShowcaseFooterProps) {
  return (
    <div className="bg-card/95 border-border fixed start-0 end-0 bottom-0 z-30 flex flex-col items-center justify-between gap-3 border-t px-4 py-3 shadow-lg backdrop-blur-md sm:flex-row sm:px-8">
      {/* Notice info */}
      <div className="text-muted-foreground hidden items-center gap-2 text-xs sm:flex">
        <Clock className="text-muted-foreground/70 size-4 shrink-0" />
        <span>
          تغییرات در لحظه در حافظه مرورگر نگهداری می‌شوند. برای ذخیره دائمی کلیک
          کنید.
        </span>
        {hasUnsavedChanges && (
          <span className="ms-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
            تغییرات ذخیره‌نشده
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={!hasUnsavedChanges || isSaving}
          className="text-muted-foreground hover:text-foreground text-xs font-bold sm:text-sm"
        >
          <RotateCcw className="me-1.5 size-4" />
          انصراف
        </Button>

        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 shadow-md sm:flex-none"
        >
          <Save className="me-1.5 size-4" />
          {isSaving ? "در حال ذخیره..." : "ذخیره چیدمان و تنظیمات"}
        </Button>
      </div>
    </div>
  );
}
