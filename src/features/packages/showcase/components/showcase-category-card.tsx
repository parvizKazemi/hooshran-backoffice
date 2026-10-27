import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  GripVertical,
  Image as ImageIcon,
  Mic,
  Video,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import type {
  ServiceIconType,
  ShowcaseCategory,
  ShowcaseService,
} from "../types";
import { ShowcaseServiceRow } from "./showcase-service-row";

interface ShowcaseCategoryCardProps {
  category: ShowcaseCategory;
  filteredServices: ShowcaseService[];
  onToggleServiceActive: (serviceId: string) => void;
  onToggleServicePin: (serviceId: string) => void;
  onToggleCategoryBulk: (categoryId: string, checked: boolean) => void;
}

export function CategoryIcon({
  icon,
  theme,
}: {
  icon: ServiceIconType;
  theme: ShowcaseCategory["colorTheme"];
}) {
  const colorMap = {
    emerald:
      "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400",
    blue: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400",
    indigo:
      "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400",
    amber:
      "bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400",
  };

  const IconComp = (() => {
    switch (icon) {
      case "wand-2":
        return Wand2;
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "mic":
        return Mic;
      default:
        return Wand2;
    }
  })();

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg font-bold transition-colors",
        colorMap[theme] || colorMap.blue
      )}
    >
      <IconComp className="size-4" />
    </div>
  );
}

export function ShowcaseCategoryCard({
  category,
  filteredServices,
  onToggleServiceActive,
  onToggleServicePin,
  onToggleCategoryBulk,
}: ShowcaseCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: "category",
      category,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const totalInCat = category.services.length;
  const activeInCat = category.services.filter((s) => s.isActive).length;
  const anyActive = activeInCat > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border-border overflow-hidden rounded-2xl border shadow-xs transition-all",
        isDragging && "ring-primary z-20 opacity-50 shadow-xl ring-2"
      )}
    >
      {/* Category Header */}
      <div className="bg-muted/40 border-border/80 flex flex-wrap items-center justify-between gap-3 border-b p-4 select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-muted-foreground/60 hover:text-foreground cursor-grab touch-none rounded-md p-1 transition-colors active:cursor-grabbing"
            title="جابجایی ترتیب دسته‌بندی"
            aria-label="جابجایی ترتیب دسته‌بندی"
          >
            <GripVertical className="size-5" />
          </button>

          <CategoryIcon icon={category.icon} theme={category.colorTheme} />

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-right transition-colors hover:opacity-80"
            title={isExpanded ? "بستن لیست سرویس‌ها" : "باز کردن لیست سرویس‌ها"}
          >
            <h2 className="text-foreground text-sm font-black sm:text-base">
              {category.name}
            </h2>
            <ChevronDown
              className={cn(
                "text-muted-foreground size-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>

          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold">
            {activeInCat.toLocaleString("fa-IR")} از{" "}
            {totalInCat.toLocaleString("fa-IR")} فعال
          </span>
        </div>

        {/* Category Controls */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-xs font-bold sm:block">
            وضعیت کلی دسته:
          </span>
          <label
            htmlFor={`bulk-toggle-${category.id}`}
            className="flex cursor-pointer items-center gap-2"
            title="فعال/مخفی‌سازی کل دسته"
          >
            <Switch
              dir="ltr"
              id={`bulk-toggle-${category.id}`}
              checked={anyActive}
              onCheckedChange={(checked) =>
                onToggleCategoryBulk(category.id, checked)
              }
              className="data-[state=checked]:bg-emerald-600"
            />
          </label>
        </div>
      </div>

      {/* Services List inside Category */}
      {isExpanded ? (
        <div className="divide-border/60 divide-y">
          <SortableContext
            items={filteredServices.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredServices.map((service) => (
              <ShowcaseServiceRow
                key={service.id}
                service={service}
                onToggleActive={onToggleServiceActive}
                onTogglePin={onToggleServicePin}
              />
            ))}
          </SortableContext>

          {filteredServices.length === 0 && (
            <div className="text-muted-foreground py-8 text-center text-xs">
              سرویسی متناسب با فیلتر یا جستجوی شما در این دسته‌بندی یافت نشد.
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="hover:bg-muted/40 text-muted-foreground flex w-full cursor-pointer items-center justify-center gap-2 py-3 text-xs font-medium transition-colors"
        >
          <span>
            مشاهده و مدیریت {totalInCat.toLocaleString("fa-IR")} سرویس این
            دسته‌بندی
          </span>
          <ChevronDown className="size-3.5" />
        </button>
      )}
    </div>
  );
}
