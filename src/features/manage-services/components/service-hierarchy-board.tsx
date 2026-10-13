import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconChevronDown,
  IconDeviceFloppy,
  IconFolder,
  IconGripVertical,
  IconSearch,
  IconTarget,
  IconX,
} from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ManageService } from "../types";
import {
  ancestorsOf,
  childrenOf,
  cloneSnapshot,
  countDescendants,
  createHierarchySnapshot,
  isInSubtree,
  listHierarchyChanges,
  moveHierarchyItems,
  normalizeSearch,
  reorderHierarchyChildren,
  snapshotsEqual,
  sortServicesByName,
  type HierarchySnapshot,
} from "../utils/hierarchy.helpers";

type PoolFilter = "all" | "free" | "child";

type ServiceHierarchyBoardProps = {
  services: ManageService[];
  isSaving?: boolean;
  onSave: (
    current: HierarchySnapshot,
    baseline: HierarchySnapshot
  ) => Promise<void>;
};

export function ServiceHierarchyBoard({
  services,
  isSaving = false,
  onSave,
}: ServiceHierarchyBoardProps) {
  const { t } = useTranslation("common");
  const byUuid = useMemo(
    () => new Map(services.map((item) => [item.uuid, item])),
    [services]
  );

  const [baseline, setBaseline] = useState(() =>
    createHierarchySnapshot(services)
  );
  const [snapshot, setSnapshot] = useState(() =>
    createHierarchySnapshot(services)
  );
  const [rootId, setRootId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"structure" | "pool">("structure");
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [poolQuery, setPoolQuery] = useState("");
  const [poolFilter, setPoolFilter] = useState<PoolFilter>("all");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoStack, setUndoStack] = useState<HierarchySnapshot[]>([]);
  const [dropTarget, setDropTarget] = useState<{
    id: string | "pool";
    ok: boolean;
  } | null>(null);
  const dragIdsRef = useRef<string[]>([]);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const next = createHierarchySnapshot(services);
    setBaseline(next);
    setSnapshot(next);
    setUndoStack([]);
    setSelected(new Set());
  }, [services]);

  const isDirty = !snapshotsEqual(baseline, snapshot);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
  const changes = useMemo(
    () => listHierarchyChanges(baseline, snapshot, services),
    [baseline, snapshot, services]
  );

  const applyMove = useCallback(
    (ids: string[], targetParentUuid: string | null) => {
      const { next, moved, skipped } = moveHierarchyItems(
        snapshot,
        ids,
        targetParentUuid
      );
      if (moved.length === 0) {
        if (skipped > 0) {
          toast.error(t("manageServices.hierarchy.cycleBlocked"));
        }
        return;
      }
      setUndoStack((prev) => [...prev.slice(-40), cloneSnapshot(snapshot)]);
      setSnapshot(next);
      setSelected((prev) => {
        const copy = new Set(prev);
        moved.forEach((id) => copy.delete(id));
        return copy;
      });
      if (targetParentUuid) {
        setOpenNodes((prev) => new Set([...prev, targetParentUuid]));
      }
      toast.success(
        targetParentUuid
          ? t("manageServices.hierarchy.movedToParent", { count: moved.length })
          : t("manageServices.hierarchy.detached", { count: moved.length })
      );
    },
    [snapshot, t]
  );

  const handleSetRoot = (uuid: string) => {
    setRootId(uuid);
    setMobileTab("structure");
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.delete(uuid);
      return copy;
    });
    const nextOpen = new Set<string>([uuid]);
    const { count } = countDescendants(uuid, snapshot);
    const walk = (id: string, depth: number) => {
      for (const child of childrenOf(id, snapshot)) {
        if (
          childrenOf(child, snapshot).length > 0 &&
          (count <= 80 || depth < 2)
        ) {
          nextOpen.add(child);
        }
        walk(child, depth + 1);
      }
    };
    walk(uuid, 1);
    setOpenNodes(nextOpen);
    setPickerOpen(false);
  };

  const pooled = useMemo(() => {
    const tokens = normalizeSearch(poolQuery).split(/\s+/).filter(Boolean);
    let list = services;
    if (poolFilter === "free") {
      list = list.filter((item) => !snapshot.parentByUuid[item.uuid]);
    }
    if (poolFilter === "child") {
      list = list.filter((item) => Boolean(snapshot.parentByUuid[item.uuid]));
    }
    if (tokens.length > 0) {
      list = list.filter((item) => {
        const hay = normalizeSearch(`${item.name} ${item.slug}`);
        return tokens.every((token) => hay.includes(token));
      });
    }
    return sortServicesByName(list);
  }, [poolQuery, poolFilter, services, snapshot.parentByUuid]);

  const pickerItems = useMemo(() => {
    const tokens = normalizeSearch(pickerQuery).split(/\s+/).filter(Boolean);
    const parents = sortServicesByName(
      services.filter((item) => childrenOf(item.uuid, snapshot).length > 0)
    );
    if (tokens.length > 0) {
      return sortServicesByName(
        services.filter((item) => {
          const hay = normalizeSearch(`${item.name} ${item.slug}`);
          return tokens.every((token) => hay.includes(token));
        })
      ).slice(0, 40);
    }
    const rest = sortServicesByName(
      services.filter((item) => childrenOf(item.uuid, snapshot).length === 0)
    ).slice(0, 20);
    return [...parents, ...rest];
  }, [pickerQuery, services, snapshot]);

  const rootFamilies = useMemo(
    () =>
      sortServicesByName(
        services.filter(
          (item) =>
            !snapshot.parentByUuid[item.uuid] &&
            childrenOf(item.uuid, snapshot).length > 0
        )
      ),
    [services, snapshot]
  );

  const toggleSelect = (uuid: string) => {
    if (uuid === rootId) return;
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(uuid)) copy.delete(uuid);
      else copy.add(uuid);
      return copy;
    });
  };

  const startDrag = (event: DragEvent, uuid: string) => {
    const ids = (selected.has(uuid) ? [...selected] : [uuid]).filter(
      (id) => id !== rootId
    );
    dragIdsRef.current = ids;
    isDraggingRef.current = true;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", ids.join(","));
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDropTarget(null);
    window.setTimeout(() => {
      dragIdsRef.current = [];
      isDraggingRef.current = false;
    }, 100);
  };

  const handleDragLeave = (uuid: string) => {
    setDropTarget((prev) => (prev?.id === uuid ? null : prev));
  };

  const handleReorder = useCallback(
    (parentUuid: string, childUuid: string, direction: "up" | "down") => {
      const next = reorderHierarchyChildren(
        snapshot,
        parentUuid,
        childUuid,
        direction
      );
      if (next !== snapshot) {
        setUndoStack((prev) => [...prev.slice(-40), cloneSnapshot(snapshot)]);
        setSnapshot(next);
      }
    },
    [snapshot]
  );

  const canDropOn = (
    targetId: string | "pool",
    ids: string[] = dragIdsRef.current
  ) => {
    if (ids.length === 0) return false;
    if (targetId === "pool") {
      return ids.some((id) => snapshot.parentByUuid[id]);
    }
    return ids.some(
      (id) =>
        id !== targetId &&
        !isInSubtree(targetId, id, snapshot.parentByUuid) &&
        (snapshot.parentByUuid[id] ?? null) !== targetId
    );
  };

  const readDragIds = (event?: DragEvent) => {
    if (dragIdsRef.current.length > 0) return [...dragIdsRef.current];
    const fromData = event?.dataTransfer.getData("text/plain") ?? "";
    return fromData.split(",").map((id) => id.trim()).filter(Boolean);
  };

  const handleDrop = (targetId: string | "pool", event?: DragEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const ids = readDragIds(event);
    setDropTarget(null);
    dragIdsRef.current = [];
    isDraggingRef.current = false;
    if (!canDropOn(targetId, ids)) return;
    applyMove(ids, targetId === "pool" ? null : targetId);
  };

  const handleDragOverTarget = (
    targetId: string | "pool",
    event: DragEvent
  ) => {
    const ids = readDragIds(event);
    const ok = canDropOn(targetId, ids);
    if (!ok) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget({ id: targetId, ok: true });
  };

  const handleSaveConfirm = async () => {
    await onSave(snapshot, baseline);
    setBaseline(cloneSnapshot(snapshot));
    setUndoStack([]);
    setConfirmOpen(false);
  };

  const root = rootId ? byUuid.get(rootId) : null;
  const rootStats = rootId ? countDescendants(rootId, snapshot) : null;

  return (
    <div dir="rtl" className="flex min-h-[70vh] flex-col gap-4">
      <div className="sticky top-0 z-20 flex flex-col gap-3 rounded-2xl bg-background/95 pb-2 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {t("manageServices.hierarchy.hint")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={undoStack.length === 0}
            onClick={() => {
              const previous = undoStack[undoStack.length - 1];
              if (!previous) return;
              setUndoStack((prev) => prev.slice(0, -1));
              setSnapshot(previous);
            }}
          >
            {t("manageServices.hierarchy.undo")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isDirty}
            onClick={() => {
              setUndoStack((prev) => [...prev, cloneSnapshot(snapshot)]);
              setSnapshot(cloneSnapshot(baseline));
            }}
          >
            {t("manageServices.actions.cancelChanges")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isDirty || isSaving}
            onClick={() => setConfirmOpen(true)}
          >
            <IconDeviceFloppy className="size-4" />
            {t("manageServices.actions.saveAll")}
            {changes.length > 0 ? (
              <span className="bg-primary-foreground/20 rounded-full px-2 text-xs">
                {changes.length}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="flex rounded-xl border bg-muted/40 p-1 lg:hidden">
        <button
          type="button"
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-xs font-medium transition sm:text-sm",
            mobileTab === "structure"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setMobileTab("structure")}
        >
          {t("manageServices.hierarchy.mobileTabs.structure")}
          {root ? ` (${root.name})` : ""}
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-xs font-medium transition sm:text-sm",
            mobileTab === "pool"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setMobileTab("pool")}
        >
          {t("manageServices.hierarchy.mobileTabs.pool")}
          <span className="ms-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {pooled.length}
          </span>
        </button>
      </div>

      <div className="grid min-h-[32rem] flex-1 grid-cols-1 overflow-hidden rounded-2xl border lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section
          className={cn(
            "flex min-h-0 flex-col border-b lg:border-e lg:border-b-0",
            mobileTab !== "structure" && "hidden lg:flex"
          )}
        >
          <div className="space-y-3 p-4 sm:p-5">
            {rootId ? (
              <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
                {ancestorsOf(rootId, snapshot.parentByUuid).map((uuid) => (
                  <button
                    key={uuid}
                    type="button"
                    className="hover:text-foreground inline-flex items-center gap-1"
                    onClick={() => handleSetRoot(uuid)}
                  >
                    {byUuid.get(uuid)?.name}
                    <IconArrowLeft className="size-3" />
                  </button>
                ))}
                <span className="text-foreground">{root?.name}</span>
              </div>
            ) : null}

            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full justify-between rounded-xl"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <IconSearch className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate">
                      {root?.name ?? t("manageServices.hierarchy.pickParent")}
                    </span>
                  </span>
                  <IconChevronDown className="size-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(36rem,92vw)] p-0">
                <div className="border-b p-2">
                  <Input
                    value={pickerQuery}
                    onChange={(event) => setPickerQuery(event.target.value)}
                    placeholder={t("manageServices.hierarchy.searchParent")}
                    autoFocus
                  />
                </div>
                <div className="max-h-80 overflow-auto p-1.5">
                  {pickerItems.length === 0 ? (
                    <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                      {t("manageServices.noResults")}
                    </p>
                  ) : (
                    pickerItems.map((item) => {
                      const stats = countDescendants(item.uuid, snapshot);
                      return (
                        <button
                          key={item.uuid}
                          type="button"
                          className="hover:bg-muted/60 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-start"
                          onClick={() => handleSetRoot(item.uuid)}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {item.name}
                            </span>
                            <span
                              className="text-muted-foreground block truncate text-xs"
                              dir="ltr"
                            >
                              {item.slug}
                            </span>
                          </span>
                          {stats.count > 0 ? (
                            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                              {t("manageServices.hierarchy.childCount", {
                                count: stats.count,
                              })}
                            </span>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div
            className="min-h-0 flex-1 overflow-auto px-4 pb-28 sm:px-5"
            onDragOver={(event) => {
              if (rootId) handleDragOverTarget(rootId, event);
            }}
            onDrop={(event) => {
              if (rootId) handleDrop(rootId, event);
            }}
          >
            {!root ? (
              <div className="mx-auto max-w-3xl py-10 text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-4 grid size-12 place-items-center rounded-2xl">
                  <IconFolder className="size-5" />
                </div>
                <h2 className="text-lg font-semibold">
                  {t("manageServices.hierarchy.emptyTitle")}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("manageServices.hierarchy.emptyHint")}
                </p>
                {rootFamilies.length > 0 ? (
                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {rootFamilies.map((item) => {
                      const stats = countDescendants(item.uuid, snapshot);
                      return (
                        <button
                          key={item.uuid}
                          type="button"
                          className="hover:border-primary rounded-2xl border p-4 text-start"
                          onClick={() => handleSetRoot(item.uuid)}
                        >
                          <div className="truncate font-medium">
                            {item.name}
                          </div>
                          <div className="text-muted-foreground mt-1 text-sm">
                            {t("manageServices.hierarchy.familyMeta", {
                              count: stats.count,
                              depth: stats.depth,
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="max-w-4xl space-y-3">
                <div
                  data-drop-id={root.uuid}
                  onDragOver={(event) => handleDragOverTarget(root.uuid, event)}
                  onDrop={(event) => handleDrop(root.uuid, event)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border px-4 py-4",
                    dropTarget?.id === root.uuid &&
                      dropTarget.ok &&
                      "ring-primary bg-primary/5 ring-2"
                  )}
                >
                  <div className="bg-primary/10 text-primary grid size-11 place-items-center rounded-xl">
                    <IconFolder className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-lg font-semibold">
                      {root.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {rootStats?.count
                        ? t("manageServices.hierarchy.familyMeta", {
                            count: rootStats.count,
                            depth: rootStats.depth,
                          })
                        : t("manageServices.hierarchy.noChildren")}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs" dir="ltr">
                    {root.slug}
                  </span>
                </div>

                {childrenOf(root.uuid, snapshot).length === 0 ? (
                  <div
                    className={cn(
                      "text-muted-foreground rounded-2xl border-2 border-dashed px-6 py-16 text-center text-sm",
                      dropTarget?.id === root.uuid &&
                        dropTarget.ok &&
                        "border-primary bg-primary/5 text-foreground"
                    )}
                    onDragOver={(event) => handleDragOverTarget(root.uuid, event)}
                    onDrop={(event) => handleDrop(root.uuid, event)}
                  >
                    {t("manageServices.hierarchy.dropHint", {
                      name: root.name,
                    })}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {childrenOf(root.uuid, snapshot).map((childUuid) => (
                      <HierarchyNode
                        key={childUuid}
                        uuid={childUuid}
                        snapshot={snapshot}
                        byUuid={byUuid}
                        openNodes={openNodes}
                        selected={selected}
                        dropTarget={dropTarget}
                        onToggleOpen={(uuid) => {
                          setOpenNodes((prev) => {
                            const copy = new Set(prev);
                            if (copy.has(uuid)) copy.delete(uuid);
                            else copy.add(uuid);
                            return copy;
                          });
                        }}
                        onSelect={toggleSelect}
                        onFocus={handleSetRoot}
                        onDetach={(uuid) => applyMove([uuid], null)}
                        onReorder={handleReorder}
                        onDragStart={startDrag}
                        onDragEnd={handleDragEnd}
                        canDropOn={canDropOn}
                        onDragOver={(uuid, ok) =>
                          setDropTarget({ id: uuid, ok })
                        }
                        onDragLeave={handleDragLeave}
                        onDrop={(uuid, event) => handleDrop(uuid, event)}
                        isDraggingRef={isDraggingRef}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside
          className={cn(
            "bg-card relative flex min-h-0 flex-col",
            mobileTab !== "pool" && "hidden lg:flex"
          )}
          onDragOver={(event) => handleDragOverTarget("pool", event)}
          onDrop={(event) => handleDrop("pool", event)}
        >
          <div className="space-y-3 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-semibold">
                {t("manageServices.hierarchy.poolTitle")}
              </h2>
              <span className="text-muted-foreground text-xs">
                {t("manageServices.hierarchy.poolCount", {
                  count: pooled.length,
                })}
              </span>
            </div>
            <div className="relative">
              <IconSearch className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={poolQuery}
                onChange={(event) => setPoolQuery(event.target.value)}
                placeholder={t("manageServices.hierarchy.searchPool")}
                className="ps-9"
              />
            </div>
            <div className="bg-muted flex rounded-xl p-0.5 text-sm">
              {(["all", "free", "child"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={cn(
                    "flex-1 rounded-lg px-2 py-1.5",
                    poolFilter === filter
                      ? "bg-background font-medium shadow-sm"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setPoolFilter(filter)}
                >
                  {t(`manageServices.hierarchy.filters.${filter}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[70vh] min-h-0 flex-1 overflow-auto px-2 pb-28">
            {pooled.length === 0 ? (
              <p className="text-muted-foreground px-4 py-12 text-center text-sm">
                {t("manageServices.noResults")}
              </p>
            ) : (
              pooled.map((item) => {
                const isRoot = item.uuid === rootId;
                const parentName = snapshot.parentByUuid[item.uuid]
                  ? byUuid.get(snapshot.parentByUuid[item.uuid] ?? "")?.name
                  : null;
                const childCount = childrenOf(item.uuid, snapshot).length;
                const checked = selected.has(item.uuid);
                return (
                  <div
                    key={item.uuid}
                    draggable={!isRoot}
                    onDragStart={(event) => startDrag(event, item.uuid)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (isDraggingRef.current) return;
                      toggleSelect(item.uuid);
                    }}
                    className={cn(
                      "flex h-14 items-center gap-3 rounded-lg px-3",
                      isRoot ? "opacity-60" : "cursor-grab",
                      checked ? "bg-primary/10" : "hover:bg-muted/60"
                    )}
                  >
                    {isRoot ? (
                      <span className="w-4" />
                    ) : (
                      <Checkbox
                        checked={checked}
                        className="pointer-events-none"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {item.name}
                      </div>
                      <div
                        className="text-muted-foreground truncate text-xs"
                        dir="ltr"
                      >
                        {item.slug}
                      </div>
                    </div>
                    {isRoot ? (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px]">
                        {t("manageServices.hierarchy.selectedRoot")}
                      </span>
                    ) : null}
                    {parentName ? (
                      <span className="bg-muted text-muted-foreground max-w-28 truncate rounded-full px-2 py-0.5 text-[11px]">
                        {parentName}
                      </span>
                    ) : null}
                    {childCount > 0 ? (
                      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]">
                        {childCount}
                      </span>
                    ) : null}
                    {!isRoot ? (
                      <IconGripVertical className="text-muted-foreground size-4 opacity-40" />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {dropTarget?.id === "pool" ? (
            <div className="border-primary bg-background/90 pointer-events-none absolute inset-3 z-10 grid place-items-center rounded-2xl border-2 border-dashed">
              <div className="text-center">
                <IconX className="text-primary mx-auto mb-2 size-8" />
                <div className="font-medium">
                  {t("manageServices.hierarchy.dropDetach")}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {selected.size > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
          <div className="bg-foreground text-background pointer-events-auto flex max-w-full flex-wrap items-center justify-between gap-2 rounded-2xl p-2 px-4 shadow-xl sm:flex-nowrap sm:ps-5">
            <span className="text-sm font-medium">
              {t("manageServices.hierarchy.selectedCount", {
                count: selected.size,
              })}
            </span>
            <div className="flex items-center gap-1">
              {root ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-background hover:bg-background/10 text-xs sm:text-sm"
                  onClick={() => {
                    applyMove([...selected], root.uuid);
                    setMobileTab("structure");
                  }}
                >
                  {t("manageServices.hierarchy.addToNamedRoot", {
                    name: root.name,
                    defaultValue: t("manageServices.hierarchy.addToRoot"),
                  })}
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-background hover:bg-background/10 text-xs sm:text-sm"
                onClick={() => applyMove([...selected], null)}
              >
                {t("manageServices.hierarchy.detach")}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-background hover:bg-background/10 size-8"
                onClick={() => setSelected(new Set())}
              >
                <IconX className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {t("manageServices.hierarchy.confirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("manageServices.hierarchy.confirmHint", {
                count: changes.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-auto">
            {changes.map((change) => (
              <div key={change.uuid} className="text-sm">
                <span className="font-medium">{change.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {t("manageServices.hierarchy.fromTo", {
                    from: change.from
                      ? byUuid.get(change.from)?.name
                      : t("manageServices.hierarchy.noParent"),
                    to: change.to
                      ? byUuid.get(change.to)?.name
                      : t("manageServices.hierarchy.noParent"),
                  })}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              {t("manageServices.form.cancel")}
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSaveConfirm()}
            >
              {t("manageServices.actions.saveAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HierarchyNode({
  uuid,
  snapshot,
  byUuid,
  openNodes,
  selected,
  dropTarget,
  isDraggingRef,
  onToggleOpen,
  onSelect,
  onFocus,
  onDetach,
  onReorder,
  onDragStart,
  onDragEnd,
  canDropOn,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  uuid: string;
  snapshot: HierarchySnapshot;
  byUuid: Map<string, ManageService>;
  openNodes: Set<string>;
  selected: Set<string>;
  dropTarget: { id: string | "pool"; ok: boolean } | null;
  isDraggingRef: React.MutableRefObject<boolean>;
  onToggleOpen: (uuid: string) => void;
  onSelect: (uuid: string) => void;
  onFocus: (uuid: string) => void;
  onDetach: (uuid: string) => void;
  onReorder: (
    parentUuid: string,
    childUuid: string,
    direction: "up" | "down"
  ) => void;
  onDragStart: (event: DragEvent, uuid: string) => void;
  onDragEnd: () => void;
  canDropOn: (targetId: string | "pool") => boolean;
  onDragOver: (uuid: string, ok: boolean) => void;
  onDragLeave: (uuid: string) => void;
  onDrop: (uuid: string, event: DragEvent) => void;
}) {
  const { t } = useTranslation("common");
  const service = byUuid.get(uuid);
  const kids = childrenOf(uuid, snapshot);
  const open = openNodes.has(uuid);
  if (!service) return null;

  const parentUuid = snapshot.parentByUuid[uuid];
  const siblings = parentUuid ? snapshot.childrenByUuid[parentUuid] ?? [] : [];
  const siblingIndex = siblings.indexOf(uuid);
  const canMoveUp = siblingIndex > 0;
  const canMoveDown = siblingIndex >= 0 && siblingIndex < siblings.length - 1;

  return (
    <div>
      <div
        draggable
        data-drop-id={uuid}
        onDragStart={(event) => onDragStart(event, uuid)}
        onDragEnd={onDragEnd}
        onDragOver={(event) => {
          const ok = canDropOn(uuid);
          if (ok) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = "move";
          }
          onDragOver(uuid, ok);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            onDragLeave(uuid);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDrop(uuid, event);
        }}
        onClick={() => {
          if (isDraggingRef.current) return;
          onSelect(uuid);
        }}
        className={cn(
          "group flex h-11 cursor-grab items-center gap-2 rounded-lg px-1.5 transition-colors",
          selected.has(uuid) ? "bg-primary/10" : "hover:bg-muted/60",
          dropTarget?.id === uuid && dropTarget.ok && "ring-primary ring-2"
        )}
      >
        {kids.length > 0 ? (
          <button
            type="button"
            className="hover:bg-muted grid size-6 place-items-center rounded"
            onClick={(event) => {
              event.stopPropagation();
              onToggleOpen(uuid);
            }}
          >
            <IconChevronDown
              className={cn("size-4 transition", open ? "" : "-rotate-90")}
            />
          </button>
        ) : (
          <span className="w-6" />
        )}
        <Checkbox
          checked={selected.has(uuid)}
          className="pointer-events-none"
        />
        <span className="min-w-0 flex-1 truncate text-sm">{service.name}</span>
        {kids.length > 0 ? (
          <span className="bg-muted text-muted-foreground rounded-full px-2 text-[11px]">
            {countDescendants(uuid, snapshot).count}
          </span>
        ) : null}
        <span className="ms-auto flex items-center gap-0.5 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          {canMoveUp && parentUuid ? (
            <button
              type="button"
              className="hover:bg-muted text-muted-foreground hover:text-foreground grid size-7 place-items-center rounded-lg transition-colors"
              title={t("manageServices.hierarchy.moveUp")}
              onClick={(event) => {
                event.stopPropagation();
                onReorder(parentUuid, uuid, "up");
              }}
            >
              <IconArrowUp className="size-3.5" />
            </button>
          ) : null}
          {canMoveDown && parentUuid ? (
            <button
              type="button"
              className="hover:bg-muted text-muted-foreground hover:text-foreground grid size-7 place-items-center rounded-lg transition-colors"
              title={t("manageServices.hierarchy.moveDown")}
              onClick={(event) => {
                event.stopPropagation();
                onReorder(parentUuid, uuid, "down");
              }}
            >
              <IconArrowDown className="size-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            className="hover:bg-muted text-muted-foreground hover:text-foreground grid size-7 place-items-center rounded-lg transition-colors"
            title={t("manageServices.hierarchy.focus")}
            onClick={(event) => {
              event.stopPropagation();
              onFocus(uuid);
            }}
          >
            <IconTarget className="size-3.5" />
          </button>
          <button
            type="button"
            className="hover:bg-muted text-muted-foreground hover:text-destructive grid size-7 place-items-center rounded-lg transition-colors"
            title={t("manageServices.hierarchy.detach")}
            onClick={(event) => {
              event.stopPropagation();
              onDetach(uuid);
            }}
          >
            <IconX className="size-3.5" />
          </button>
        </span>
      </div>
      {open && kids.length > 0 ? (
        <div className="border-border ms-[18px] space-y-0.5 border-s ps-3">
          {kids.map((childUuid) => (
            <HierarchyNode
              key={childUuid}
              uuid={childUuid}
              snapshot={snapshot}
              byUuid={byUuid}
              openNodes={openNodes}
              selected={selected}
              dropTarget={dropTarget}
              isDraggingRef={isDraggingRef}
              onToggleOpen={onToggleOpen}
              onSelect={onSelect}
              onFocus={onFocus}
              onDetach={onDetach}
              onReorder={onReorder}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              canDropOn={canDropOn}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ServiceHierarchyBoardSkeleton() {
  return (
    <div className="grid min-h-[32rem] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <Skeleton className="h-[28rem] rounded-2xl" />
      <Skeleton className="h-[28rem] rounded-2xl" />
    </div>
  );
}
