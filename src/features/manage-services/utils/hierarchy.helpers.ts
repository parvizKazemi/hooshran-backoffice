import type { ManageService } from "../types";

export type HierarchyParentMap = Record<string, string | null>;
export type HierarchyChildrenMap = Record<string, string[]>;

export type HierarchySnapshot = {
  parentByUuid: HierarchyParentMap;
  childrenByUuid: HierarchyChildrenMap;
};

export type HierarchyChange = {
  uuid: string;
  name: string;
  from: string | null;
  to: string | null;
};

const collator = new Intl.Collator("fa", {
  numeric: true,
  sensitivity: "base",
});

export function normalizeSearch(value: string): string {
  return value
    .replace(/[يك‌]/g, (char) => ({ ي: "ی", ك: "ک", "‌": " " })[char] ?? char)
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .toLowerCase();
}

export function createHierarchySnapshot(
  services: ManageService[]
): HierarchySnapshot {
  const parentByUuid: HierarchyParentMap = {};
  const childrenByUuid: HierarchyChildrenMap = {};

  for (const service of services) {
    parentByUuid[service.uuid] = service.parentUuid ?? null;
  }

  for (const service of services) {
    const ordered = service.submodels
      .map((child) => child.uuid)
      .filter((uuid) => uuid && parentByUuid[uuid] === service.uuid);
    if (ordered.length > 0) {
      childrenByUuid[service.uuid] = Array.from(new Set(ordered));
    }
  }

  for (const service of services) {
    const parentUuid = parentByUuid[service.uuid];
    if (!parentUuid) continue;
    const current = childrenByUuid[parentUuid] ?? [];
    if (!current.includes(service.uuid)) {
      childrenByUuid[parentUuid] = [...current, service.uuid];
    }
  }

  return { parentByUuid, childrenByUuid };
}

export function cloneSnapshot(snapshot: HierarchySnapshot): HierarchySnapshot {
  return {
    parentByUuid: { ...snapshot.parentByUuid },
    childrenByUuid: Object.fromEntries(
      Object.entries(snapshot.childrenByUuid).map(([key, value]) => [
        key,
        [...value],
      ])
    ),
  };
}

export function isInSubtree(
  nodeUuid: string,
  ancestorUuid: string,
  parentByUuid: HierarchyParentMap
): boolean {
  let current: string | null | undefined = nodeUuid;
  let guard = 0;
  while (current && guard < 1000) {
    if (current === ancestorUuid) return true;
    current = parentByUuid[current];
    guard += 1;
  }
  return false;
}

export function ancestorsOf(
  uuid: string,
  parentByUuid: HierarchyParentMap
): string[] {
  const result: string[] = [];
  let current = parentByUuid[uuid];
  let guard = 0;
  while (current && guard < 200) {
    result.unshift(current);
    current = parentByUuid[current];
    guard += 1;
  }
  return result;
}

export function childrenOf(
  uuid: string | null,
  snapshot: HierarchySnapshot
): string[] {
  if (!uuid) {
    return Object.entries(snapshot.parentByUuid)
      .filter(([, parentUuid]) => !parentUuid)
      .map(([id]) => id);
  }
  return snapshot.childrenByUuid[uuid] ?? [];
}

export function countDescendants(
  uuid: string,
  snapshot: HierarchySnapshot
): { count: number; depth: number } {
  let count = 0;
  let depth = 0;

  const walk = (id: string, level: number) => {
    for (const childUuid of childrenOf(id, snapshot)) {
      count += 1;
      depth = Math.max(depth, level);
      walk(childUuid, level + 1);
    }
  };

  walk(uuid, 1);
  return { count, depth };
}

export function moveHierarchyItems(
  snapshot: HierarchySnapshot,
  ids: string[],
  targetParentUuid: string | null
): { next: HierarchySnapshot; moved: string[]; skipped: number } {
  const next = cloneSnapshot(snapshot);
  const moved: string[] = [];
  let skipped = 0;

  for (const id of ids) {
    if (!(id in next.parentByUuid)) continue;
    if (targetParentUuid) {
      if (id === targetParentUuid) continue;
      if (isInSubtree(targetParentUuid, id, next.parentByUuid)) {
        skipped += 1;
        continue;
      }
    }

    const previous = next.parentByUuid[id] ?? null;
    if (previous === targetParentUuid) continue;

    if (previous) {
      next.childrenByUuid[previous] = (
        next.childrenByUuid[previous] ?? []
      ).filter((childUuid) => childUuid !== id);
    }

    next.parentByUuid[id] = targetParentUuid;
    if (targetParentUuid) {
      const current = next.childrenByUuid[targetParentUuid] ?? [];
      next.childrenByUuid[targetParentUuid] = [...current, id];
    }

    moved.push(id);
  }

  return { next, moved, skipped };
}

export function listHierarchyChanges(
  baseline: HierarchySnapshot,
  current: HierarchySnapshot,
  services: ManageService[]
): HierarchyChange[] {
  const nameByUuid = new Map(services.map((item) => [item.uuid, item.name]));
  const changes: HierarchyChange[] = [];

  for (const [uuid, parentUuid] of Object.entries(current.parentByUuid)) {
    const from = baseline.parentByUuid[uuid] ?? null;
    const to = parentUuid ?? null;
    if (from === to) continue;
    changes.push({
      uuid,
      name: nameByUuid.get(uuid) ?? uuid,
      from,
      to,
    });
  }

  return changes;
}

export function affectedParentUuids(
  baseline: HierarchySnapshot,
  current: HierarchySnapshot
): string[] {
  const parents = new Set<string>();

  for (const change of listHierarchyChanges(baseline, current, [])) {
    if (change.from) parents.add(change.from);
    if (change.to) parents.add(change.to);
  }

  const allParentKeys = new Set([
    ...Object.keys(baseline.childrenByUuid),
    ...Object.keys(current.childrenByUuid),
  ]);

  for (const uuid of allParentKeys) {
    const before = (baseline.childrenByUuid[uuid] ?? []).join(",");
    const after = (current.childrenByUuid[uuid] ?? []).join(",");
    if (before !== after) parents.add(uuid);
  }

  return [...parents];
}

export function reorderHierarchyChildren(
  snapshot: HierarchySnapshot,
  parentUuid: string,
  childUuid: string,
  direction: "up" | "down"
): HierarchySnapshot {
  const next = cloneSnapshot(snapshot);
  const current = [...(next.childrenByUuid[parentUuid] ?? [])];
  const index = current.indexOf(childUuid);
  if (index < 0) return snapshot;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= current.length) return snapshot;

  const temp = current[index];
  const target = current[targetIndex];
  if (!temp || !target) return snapshot;

  current[index] = target;
  current[targetIndex] = temp;

  next.childrenByUuid[parentUuid] = current;
  return next;
}

export function reorderHierarchyChildrenToPosition(
  snapshot: HierarchySnapshot,
  parentUuid: string,
  sourceUuid: string,
  targetUuid: string,
  position: "before" | "after"
): HierarchySnapshot {
  if (sourceUuid === targetUuid) return snapshot;

  const next = cloneSnapshot(snapshot);
  const current = [...(next.childrenByUuid[parentUuid] ?? [])];
  const sourceIndex = current.indexOf(sourceUuid);
  const targetIndex = current.indexOf(targetUuid);

  if (sourceIndex < 0 || targetIndex < 0) return snapshot;

  current.splice(sourceIndex, 1);

  const newTargetIndex = current.indexOf(targetUuid);
  if (newTargetIndex < 0) return snapshot;

  const insertIndex =
    position === "before" ? newTargetIndex : newTargetIndex + 1;
  current.splice(insertIndex, 0, sourceUuid);

  next.childrenByUuid[parentUuid] = current;
  return next;
}

export function moveAndPositionHierarchyItem(
  snapshot: HierarchySnapshot,
  parentUuid: string,
  sourceUuid: string,
  targetUuid: string,
  position: "before" | "after"
): HierarchySnapshot {
  if (sourceUuid === targetUuid) return snapshot;

  const currentChildren = snapshot.childrenByUuid[parentUuid] ?? [];
  if (currentChildren.includes(sourceUuid)) {
    return reorderHierarchyChildrenToPosition(
      snapshot,
      parentUuid,
      sourceUuid,
      targetUuid,
      position
    );
  }

  const { next, moved } = moveHierarchyItems(
    snapshot,
    [sourceUuid],
    parentUuid
  );
  if (!moved.includes(sourceUuid)) return snapshot;

  return reorderHierarchyChildrenToPosition(
    next,
    parentUuid,
    sourceUuid,
    targetUuid,
    position
  );
}

export function sortServicesByName(items: ManageService[]): ManageService[] {
  return [...items].sort((left, right) =>
    collator.compare(left.name, right.name)
  );
}

export function snapshotsEqual(
  left: HierarchySnapshot,
  right: HierarchySnapshot
): boolean {
  const leftParents = Object.entries(left.parentByUuid).sort();
  const rightParents = Object.entries(right.parentByUuid).sort();
  if (JSON.stringify(leftParents) !== JSON.stringify(rightParents))
    return false;

  const keys = new Set([
    ...Object.keys(left.childrenByUuid),
    ...Object.keys(right.childrenByUuid),
  ]);
  for (const key of keys) {
    const a = (left.childrenByUuid[key] ?? []).join(",");
    const b = (right.childrenByUuid[key] ?? []).join(",");
    if (a !== b) return false;
  }
  return true;
}
