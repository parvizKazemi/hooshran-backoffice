import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconEdit, IconGripVertical, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { Category } from "../types";
import { CategoryBadgePill } from "./category-badge-pill";

type CategoriesTableProps = {
  items: Category[];
  isLoading?: boolean;
  onReorder: (activeUuid: string, overUuid: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const { t } = useTranslation("common");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.uuid });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className={cn(
        "bg-background relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80",
        isDragging && "shadow-md"
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TableCell className="w-12 text-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-8 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-4" />
          <span className="sr-only">{t("table.dragToReorder")}</span>
        </Button>
      </TableCell>
      <TableCell>
        <span className="bg-muted text-muted-foreground inline-flex size-7 items-center justify-center rounded-lg text-xs font-bold">
          {category.order}
        </span>
      </TableCell>
      <TableCell className="font-semibold">{category.name}</TableCell>
      <TableCell>
        <code
          dir="ltr"
          className="bg-muted text-muted-foreground rounded-md px-2 py-1 font-mono text-[11px]"
        >
          {category.slug}
        </code>
      </TableCell>
      <TableCell>
        <CategoryBadgePill badge={category.badge} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => onEdit(category)}
          >
            <IconEdit className="size-3.5" />
            {t("categories.actions.edit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 gap-1.5 text-xs"
            onClick={() => onDelete(category)}
          >
            <IconTrash className="size-3.5" />
            {t("categories.actions.delete")}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesTable({
  items,
  isLoading = false,
  onReorder,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const { t } = useTranslation("common");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center text-xs">
                {t("categories.table.drag")}
              </TableHead>
              <TableHead className="text-xs">
                {t("categories.table.order")}
              </TableHead>
              <TableHead className="text-xs">
                {t("categories.table.name")}
              </TableHead>
              <TableHead className="text-xs">
                {t("categories.table.slug")}
              </TableHead>
              <TableHead className="text-xs">
                {t("categories.table.badge")}
              </TableHead>
              <TableHead className="text-center text-xs">
                {t("categories.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("categories.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={items.map((item) => item.uuid)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((category) => (
                  <SortableCategoryRow
                    key={category.uuid}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}
