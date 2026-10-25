import { Skeleton } from "@/components/ui/skeleton";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
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
import { ShowcaseCategoryCard } from "./showcase-category-card";
import { ShowcaseFooter } from "./showcase-footer";
import { ShowcaseToolbar } from "./showcase-toolbar";

export function ServiceShowcaseTab() {
  const { data: initialData, isLoading } = useServiceShowcase();
  const saveMutation = useSaveServiceShowcase();

  const [categories, setCategories] = useState<ShowcaseCategory[]>([]);
  const [config, setConfig] = useState<ShowcaseConfig>({
    defaultRowsBeforeExpand: 3,
  });
  const [baseline, setBaseline] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShowcaseStatusFilter>("all");

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

  // Sensor configuration for mobile & desktop drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (allows clean clicks on switches/buttons)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Drag and Drop End Handler (both Category reordering & Service reordering)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
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
            const newIndex = cat.services.findIndex((s) => s.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return cat;

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
      .filter((cat) => cat.filteredServices.length > 0 || !searchQuery);
  }, [categories, searchQuery, statusFilter]);

  // Total count computations
  const totalServicesCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.services.length, 0),
    [categories]
  );

  // Cancel changes
  const handleCancel = useCallback(() => {
    if (!baseline) return;
    try {
      const parsed: ShowcaseData = JSON.parse(baseline);
      setCategories(parsed.categories);
      setConfig(parsed.config);
      toast.info("تغییرات لغو شد و به حالت ذخیره شده بازگشت.");
    } catch {
      // ignore
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
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
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
