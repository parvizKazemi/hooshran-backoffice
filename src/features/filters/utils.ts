export function normalizeFilterList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const filters: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const value = item.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    filters.push(value);
  }

  return filters;
}

export function unwrapFilterList(response: unknown): string[] {
  if (Array.isArray(response)) return normalizeFilterList(response);

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    if (Array.isArray(record.data)) return normalizeFilterList(record.data);
    if (Array.isArray(record.filters))
      return normalizeFilterList(record.filters);
  }

  return [];
}

export function extractServiceFilters(response: unknown): string[] {
  if (!response || typeof response !== "object") return [];

  const record = response as Record<string, unknown>;
  const information =
    record.information && typeof record.information === "object"
      ? (record.information as Record<string, unknown>)
      : null;

  return normalizeFilterList(record.filters ?? information?.filters);
}

export function isSameFilterList(a: string[], b: string[]): boolean {
  const left = normalizeFilterList(a)
    .slice()
    .sort((x, y) => x.localeCompare(y));
  const right = normalizeFilterList(b)
    .slice()
    .sort((x, y) => x.localeCompare(y));
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

export function hasFilterName(filters: string[], name: string): boolean {
  const needle = name.trim().toLowerCase();
  if (!needle) return false;
  return filters.some((item) => item.toLowerCase() === needle);
}
