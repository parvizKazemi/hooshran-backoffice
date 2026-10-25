import { GripVertical, Info } from "lucide-react";

interface ShowcaseAlertBannerProps {
  totalServices: number;
  totalCategories: number;
}

export function ShowcaseAlertBanner({
  totalServices,
  totalCategories,
}: ShowcaseAlertBannerProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-900 shadow-sm sm:flex-row sm:items-center dark:text-amber-200">
      <div className="flex items-start gap-2 sm:items-center">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600 sm:mt-0 dark:text-amber-400" />
        <span className="leading-relaxed">
          با کشیدن آیکون دستگیره (
          <GripVertical className="text-muted-foreground inline size-3.5 align-middle" />
          ) می‌توانید اولویت دسته‌بندی‌ها و سرویس‌ها را مرتب کنید. با دکمه سنجاق
          می‌توانید سرویس را در صدر دسته‌بندی پین کنید.
        </span>
      </div>
      <span className="bg-card/90 shrink-0 rounded-md border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-xs dark:text-amber-300">
        {totalServices.toLocaleString("fa-IR")} سرویس در{" "}
        {totalCategories.toLocaleString("fa-IR")} دسته
      </span>
    </div>
  );
}
