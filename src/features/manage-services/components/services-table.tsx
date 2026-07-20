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
import type { ManageService } from "../types";
import { ServiceBadgePill } from "./service-badge-pill";

type ServicesTableProps = {
  items: ManageService[];
  isLoading?: boolean;
  onReorder: (activeUuid: string, overUuid: string) => void;
  onEdit: (service: ManageService) => void;
  onDelete: (service: ManageService) => void;
};

function SortableServiceRow({
  service,
  onEdit,
  onDelete,
}: {
  service: ManageService;
  onEdit: (service: ManageService) => void;
  onDelete: (service: ManageService) => void;
}) {
  const { t } = useTranslation("common");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.uuid });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className={cn(
        "bg-background relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80",
        !service.isActive && "bg-rose-50/40 dark:bg-rose-950/20",
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
        </Button>
      </TableCell>
      <TableCell>
        <span className="bg-muted text-muted-foreground inline-flex size-7 items-center justify-center rounded-lg text-xs font-bold">
          {service.order}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-muted relative aspect-video w-16 overflow-hidden rounded-lg border">
            {service.imageUrl ? (
              <img
                src={service.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : null}
            {!service.isActive ? (
              <div className="absolute inset-0 flex items-center justify-center bg-rose-600/70 text-[9px] font-black text-white">
                {t("manageServices.table.inactive")}
              </div>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{service.name}</p>
            <p className="text-muted-foreground truncate text-[11px]" dir="ltr">
              {service.slug}
            </p>
            <p className="text-muted-foreground text-[10px]">
              {service.isAutoCredit
                ? t("manageServices.table.autoCredit")
                : service.creditHint}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground max-w-[220px] truncate text-xs">
        {service.description}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
            service.modelType === "multi"
              ? "border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300"
              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          )}
        >
          {t(`manageServices.modelTypes.${service.modelType}`)}
        </span>
      </TableCell>
      <TableCell>
        <ServiceBadgePill badge={service.badge} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => onEdit(service)}
          >
            <IconEdit className="size-3.5" />
            {t("manageServices.actions.edit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 gap-1.5 text-xs"
            onClick={() => onDelete(service)}
          >
            <IconTrash className="size-3.5" />
            {t("manageServices.actions.delete")}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ServicesTable({
  items,
  isLoading = false,
  onReorder,
  onEdit,
  onDelete,
}: ServicesTableProps) {
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
          <Skeleton key={index} className="h-14 w-full" />
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
                {t("manageServices.table.drag")}
              </TableHead>
              <TableHead className="text-xs">
                {t("manageServices.table.order")}
              </TableHead>
              <TableHead className="text-xs">
                {t("manageServices.table.service")}
              </TableHead>
              <TableHead className="text-xs">
                {t("manageServices.table.description")}
              </TableHead>
              <TableHead className="text-xs">
                {t("manageServices.table.modelType")}
              </TableHead>
              <TableHead className="text-xs">
                {t("manageServices.table.badge")}
              </TableHead>
              <TableHead className="text-center text-xs">
                {t("manageServices.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t("manageServices.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={items.map((item) => item.uuid)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((service) => (
                  <SortableServiceRow
                    key={service.uuid}
                    service={service}
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
