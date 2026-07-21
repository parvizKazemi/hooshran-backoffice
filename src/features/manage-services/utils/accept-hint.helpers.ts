/**
 * Same source as front ParentServiceGrid:
 * `inputs.service.frontend.accept_hint` → child model endpoints.
 */

export type AcceptHintOption = {
  name: string;
  endpoint: string;
  image?: string | null;
  introduction?: string | null;
  cost?: string;
  active?: boolean;
};

export function endpointToSlug(endpoint: string): string {
  return endpoint.replaceAll("/", "-");
}

export function normalizeAcceptHint(hint: unknown): AcceptHintOption[] {
  if (!hint) return [];

  const options: AcceptHintOption[] = [];

  if (Array.isArray(hint)) {
    for (const entry of hint) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const endpoint = record.endpoint;
      const name = record.name;
      if (typeof endpoint !== "string" || typeof name !== "string") continue;

      options.push({
        endpoint,
        name,
        image: typeof record.image === "string" ? record.image : undefined,
        introduction:
          typeof record.introduction === "string"
            ? record.introduction
            : undefined,
        cost: record.cost != null ? String(record.cost) : undefined,
        active: typeof record.active === "boolean" ? record.active : undefined,
      });
    }
    return options;
  }

  if (typeof hint === "object") {
    for (const [endpoint, value] of Object.entries(
      hint as Record<string, unknown>
    )) {
      const name =
        typeof value === "string"
          ? value
          : typeof value === "object" && value !== null
            ? ((value as Record<string, unknown>).name as string | undefined)
            : undefined;
      if (!endpoint || !name) continue;

      const record =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)
          : null;

      options.push({
        endpoint,
        name,
        image: typeof record?.image === "string" ? record.image : undefined,
        introduction:
          typeof record?.introduction === "string"
            ? record.introduction
            : undefined,
        cost: record?.cost != null ? String(record.cost) : undefined,
        active: typeof record?.active === "boolean" ? record.active : undefined,
      });
    }
  }

  return options;
}
