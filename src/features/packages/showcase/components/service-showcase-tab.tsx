import { Skeleton } from "@/components/ui/skeleton";
import {
  type CollisionDetection,
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useSaveServiceShowcase,
  useServiceShowcase,
} from "../hooks/use-service-showcase";
import type {
  ShowcaseCategory,
  ShowcaseConfig,
  ShowcaseData,
  ShowcaseService,
  ShowcaseStatusFilter,
} from "../types";
import { ShowcaseAlertBanner } from "./showcase-alert-banner";
import { CategoryIcon, ShowcaseCategoryCard } from "./showcase-category-card";
import { ShowcaseFooter } from "./showcase-footer";
import { ShowcaseToolbar } from "./showcase-toolbar";

export function ServiceShowcaseTab() {
  const { data: initialData, isLoading } = useServiceShowcase();
  const saveMutation = useSaveServiceShowcase();

  const [categories, setCategories] = useState<ShowcaseCategory[]>([]);
  const [config, setConfig] = useState<ShowcaseConfig>({
    defaultRowsBeforeExpand: 4,
  });
  const [baseline, setBaseline] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShowcaseStatusFilter>("all");

  // Track active dragging item for DragOverlay
  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    type: "category" | "service";
    category?: ShowcaseCategory;
    service?: ShowcaseService;
  } | null>(null);

  // Sync data from query
  useEffect(() => {
    if (initialData) {
      setCategories(initialData.categories);
      setConfig(initialData.config);
      setBaseline(JSON.stringify(initialData));
    }
  }, [initialData]);

  // Check unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!baseline) return false;
    const current: ShowcaseData = { categories, config };
    return JSON.stringify(current) !== baseline;
  }, [categories, config, baseline]);

  // Sensor configuration: Responsive mouse and touch sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required for desktop drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms press before drag on touch devices to avoid scroll conflict
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection prioritizing pointerWithin, falling back to closestCorners
  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  }, []);

  // Toggle active status for single service
  const handleToggleServiceActive = useCallback((serviceId: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        services: cat.services.map((srv) =>
          srv.id === serviceId ? { ...srv, isActive: !srv.isActive } : srv
        ),
      }))
    );
  }, []);

  // Toggle Pin for single service
  const handleToggleServicePin = useCallback((serviceId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        const foundIndex = cat.services.findIndex((s) => s.id === serviceId);
        if (foundIndex === -1) return cat;

        const target = cat.services[foundIndex];
        if (!target) return cat;

        const nextPinned = !target.isPinned;

        if (nextPinned) {
          // Pinning: set pinned and move to top of category
          const updatedTarget: ShowcaseService = {
            ...target,
            isPinned: true,
          };
          const rest = cat.services.filter((s) => s.id !== serviceId);
          const reordered = [updatedTarget, ...rest].map((s, idx) => ({
            ...s,
            order: idx + 1,
          }));
          toast.success("سرویس به عنوان پرچمدار پین و به صدر لیست منتقل شد.");
          return { ...cat, services: reordered };
        } else {
          // Unpinning
          const updated = cat.services.map((s) =>
            s.id === serviceId ? { ...s, isPinned: false } : s
          );
          toast.info("سرویس از حالت پین خارج شد.");
          return { ...cat, services: updated };
        }
      })
    );
  }, []);

  // Toggle all services in category
  const handleToggleCategoryBulk = useCallback(
    (categoryId: string, checked: boolean) => {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            services: cat.services.map((s) => ({ ...s, isActive: checked })),
          };
        })
      );
      if (checked) {
        toast.success("سرویس‌های این دسته فعال شدند.");
      } else {
        toast.info("تمامی سرویس‌های این دسته مخفی شدند.");
      }
    },
    []
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type as
      | "category"
      | "service"
      | undefined;
    if (type === "category") {
      const cat = active.data.current?.category as ShowcaseCategory | undefined;
      setActiveDragItem({
        id: String(active.id),
        type: "category",
        category: cat,
      });
    } else if (type === "service") {
      const srv = active.data.current?.service as ShowcaseService | undefined;
      setActiveDragItem({
        id: String(active.id),
        type: "service",
        service: srv,
      });
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragItem(null);
  }, []);

  // Drag and Drop End Handler (both Category reordering & Service reordering)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragItem(null);

      if (!over || active.id === over.id) return;

      const activeType = active.data.current?.type;

      // 1. Reordering Categories
      if (activeType === "category") {
        const oldIndex = categories.findIndex((c) => c.id === active.id);
        const newIndex = categories.findIndex((c) => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          setCategories((prev) => {
            const reordered = arrayMove(prev, oldIndex, newIndex);
            return reordered.map((cat, idx) => ({ ...cat, order: idx + 1 }));
          });
          toast.success("ترتیب دسته‌بندی با موفقیت تغییر کرد.");
        }
        return;
      }

      // 2. Reordering Services within same category
      if (activeType === "service") {
        const activeService = active.data.current?.service as
          | ShowcaseService
          | undefined;
        if (!activeService) return;

        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== activeService.categoryId) return cat;

            const oldIndex = cat.services.findIndex((s) => s.id === active.id);
            if (oldIndex === -1) return cat;

            let newIndex = cat.services.findIndex((s) => s.id === over.id);

            // If dropped directly onto category container or header
            if (newIndex === -1 && over.id === cat.id) {
              newIndex = cat.services.length - 1;
            }

            if (newIndex === -1 || oldIndex === newIndex) return cat;

            const reordered = arrayMove(cat.services, oldIndex, newIndex).map(
              (srv, idx) => ({ ...srv, order: idx + 1 })
            );

            toast.success("اولویت نمایش سرویس تغییر یافت.");
            return { ...cat, services: reordered };
          })
        );
      }
    },
    [categories]
  );

  // Filtered services logic
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return categories
      .map((cat) => {
        const matchesCatName = cat.name.toLowerCase().includes(q);

        const filteredServices = cat.services.filter((srv) => {
          const matchesSearch =
            !q || matchesCatName || srv.title.toLowerCase().includes(q);

          let matchesStatus = true;
          if (statusFilter === "active") {
            matchesStatus = srv.isActive;
          } else if (statusFilter === "inactive") {
            matchesStatus = !srv.isActive;
          } else if (statusFilter === "pinned") {
            matchesStatus = srv.isPinned;
          }

          return matchesSearch && matchesStatus;
        });

        return {
          ...cat,
          filteredServices,
        };
      })
      .filter((cat) => {
        if (!searchQuery.trim() && statusFilter === "all") return true;
        return cat.filteredServices.length > 0;
      });
  }, [categories, searchQuery, statusFilter]);

  // Overall counters for alert banner
  const totalServicesCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.services.length, 0);
  }, [categories]);

  // Revert unsaved changes
  const handleCancel = useCallback(() => {
    if (baseline) {
      try {
        const parsed = JSON.parse(baseline) as ShowcaseData;
        setCategories(parsed.categories);
        setConfig(parsed.config);
        toast.info("تغییرات به آخرین حالت ذخیره‌شده بازگردانده شد.");
      } catch {
        // Fallback
      }
    }
  }, [baseline]);

  // Save changes
  const handleSave = useCallback(() => {
    const payload: ShowcaseData = { categories, config };
    saveMutation.mutate(payload, {
      onSuccess: () => {
        setBaseline(JSON.stringify(payload));
      },
    });
  }, [categories, config, saveMutation]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6 pb-24">
      {/* 1. Toolbar */}
      <ShowcaseToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        defaultRowsLimit={config.defaultRowsBeforeExpand}
        onDefaultRowsLimitChange={(limit) =>
          setConfig((prev) => ({ ...prev, defaultRowsBeforeExpand: limit }))
        }
      />

      {/* 2. Alert Information Banner */}
      <ShowcaseAlertBanner
        totalServices={totalServicesCount}
        totalCategories={categories.length}
      />

      {/* 3. Drag and Drop Sortable Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <ShowcaseCategoryCard
                key={category.id}
                category={category}
                filteredServices={category.filteredServices}
                onToggleServiceActive={handleToggleServiceActive}
                onToggleServicePin={handleToggleServicePin}
                onToggleCategoryBulk={handleToggleCategoryBulk}
              />
            ))}

            {filteredCategories.length === 0 && (
              <div className="bg-card border-border rounded-2xl border p-12 text-center shadow-xs">
                <p className="text-muted-foreground text-sm font-medium">
                  هیچ سرویسی مطابق با جستجو یا فیلتر انتخابی یافت نشد.
                </p>
              </div>
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay for smooth, jitter-free dragging UX */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeDragItem?.type === "category" && activeDragItem.category ? (
            <div className="bg-card border-primary/50 ring-primary/40 flex items-center justify-between rounded-2xl border p-4 opacity-95 shadow-2xl ring-2 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <GripVertical className="text-primary size-5" />
                <CategoryIcon
                  icon={activeDragItem.category.icon}
                  theme={activeDragItem.category.colorTheme}
                />
                <h2 className="text-foreground text-sm font-black sm:text-base">
                  {activeDragItem.category.name}
                </h2>
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  {activeDragItem.category.services.length.toLocaleString(
                    "fa-IR"
                  )}{" "}
                  سرویس
                </span>
              </div>
            </div>
          ) : activeDragItem?.type === "service" && activeDragItem.service ? (
            <div className="bg-card border-primary/50 ring-primary/40 flex items-center justify-between rounded-xl border p-3.5 opacity-95 shadow-2xl ring-2 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <GripVertical className="text-primary size-4" />
                <span className="text-foreground text-xs font-bold">
                  {activeDragItem.service.title}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px] font-medium">
                {activeDragItem.service.costDescription}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 4. Sticky Save Action Footer */}
      <ShowcaseFooter
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={saveMutation.isPending}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
}
