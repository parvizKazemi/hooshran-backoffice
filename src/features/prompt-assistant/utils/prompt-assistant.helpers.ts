import type {
  EditablePromptOption,
  PageResult,
  PromptCategory,
  PromptDisplayKind,
  PromptDisplayKindFilter,
  PromptItem,
  PromptStatus,
  ServicePromptAssignment,
} from "../types";
import {
  PROMPT_DISPLAY_KIND,
  PROMPT_DISPLAY_KIND_FILTER,
  PROMPT_DISPLAY_TYPE,
  PROMPT_STATUS,
} from "../constants";

export function getCategoryDisplayKind(
  tags: string[] | undefined | null
): PromptDisplayKind {
  if (tags?.includes(PROMPT_DISPLAY_KIND.STYLE)) {
    return PROMPT_DISPLAY_KIND.STYLE;
  }
  return PROMPT_DISPLAY_KIND.PROMPT;
}

export function tagsFromDisplayKind(displayKind: PromptDisplayKind): string[] {
  return displayKind === PROMPT_DISPLAY_KIND.STYLE
    ? [PROMPT_DISPLAY_KIND.STYLE]
    : [PROMPT_DISPLAY_KIND.PROMPT];
}

export function isCategoryGloballyActive(
  status: PromptStatus | string | undefined | null
): boolean {
  return status === PROMPT_STATUS.ACTIVE;
}

export function filterActiveCategories(
  categories: PromptCategory[]
): PromptCategory[] {
  return categories.filter((category) =>
    isCategoryGloballyActive(category.status)
  );
}

export function filterCategoriesByDisplayKind(
  categories: PromptCategory[],
  filter: PromptDisplayKindFilter
): PromptCategory[] {
  if (filter === PROMPT_DISPLAY_KIND_FILTER.ALL) return categories;
  return categories.filter(
    (category) => getCategoryDisplayKind(category.tags) === filter
  );
}

export function normalizeCategory(
  raw: Record<string, unknown>
): PromptCategory {
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const prompts = Array.isArray(raw.prompts) ? raw.prompts : undefined;
  const rawCount =
    raw.promptsCount ?? raw.promptCount ?? raw.count ?? prompts?.length;

  return {
    uuid: String(raw.uuid ?? ""),
    title: String(raw.title ?? ""),
    icon: typeof raw.icon === "string" ? raw.icon : null,
    systemKey: typeof raw.systemKey === "string" ? raw.systemKey : null,
    status:
      raw.status === PROMPT_STATUS.INACTIVE
        ? PROMPT_STATUS.INACTIVE
        : PROMPT_STATUS.ACTIVE,
    tags,
    promptsCount: typeof rawCount === "number" ? rawCount : 0,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

export function normalizePrompt(raw: Record<string, unknown>): PromptItem {
  const pictures = Array.isArray(raw.pictures)
    ? raw.pictures.filter((item): item is string => typeof item === "string")
    : [];

  return {
    uuid: String(raw.uuid ?? ""),
    promptCategoryUuid:
      typeof raw.promptCategoryUuid === "string"
        ? raw.promptCategoryUuid
        : undefined,
    title: String(raw.title ?? ""),
    prompt: String(raw.prompt ?? ""),
    pictures,
    displayType:
      raw.displayType === PROMPT_DISPLAY_TYPE.VIDEO
        ? PROMPT_DISPLAY_TYPE.VIDEO
        : PROMPT_DISPLAY_TYPE.PICTURE,
    status:
      raw.status === PROMPT_STATUS.INACTIVE
        ? PROMPT_STATUS.INACTIVE
        : PROMPT_STATUS.ACTIVE,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

export function normalizePageResult<T>(
  response: unknown,
  mapItem: (item: Record<string, unknown>) => T
): PageResult<T> {
  if (Array.isArray(response)) {
    return {
      data: response
        .filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === "object"
        )
        .map(mapItem),
      meta: {
        page: 1,
        take: response.length,
        itemCount: response.length,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const record = (response ?? {}) as Record<string, unknown>;
  const dataRaw = Array.isArray(record.data) ? record.data : [];
  const metaRaw = (record.meta ?? {}) as Record<string, unknown>;

  return {
    data: dataRaw
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object"
      )
      .map(mapItem),
    meta: {
      page: Number(metaRaw.page ?? 1),
      take: Number(metaRaw.take ?? dataRaw.length),
      itemCount: Number(metaRaw.itemCount ?? dataRaw.length),
      pageCount: Number(metaRaw.pageCount ?? 1),
      hasPreviousPage: Boolean(metaRaw.hasPreviousPage),
      hasNextPage: Boolean(metaRaw.hasNextPage),
    },
  };
}

export function normalizeAssignment(
  raw: Record<string, unknown>
): ServicePromptAssignment {
  return {
    uuid: String(raw.uuid ?? ""),
    serviceUuid: String(raw.serviceUuid ?? ""),
    serviceName: String(raw.serviceName ?? ""),
    categoryUuid: String(raw.categoryUuid ?? ""),
    categoryTitle: String(raw.categoryTitle ?? ""),
    priority: Number(raw.priority ?? 0),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
  };
}

export function promptToEditable(prompt: PromptItem): EditablePromptOption {
  return {
    localId: prompt.uuid,
    uuid: prompt.uuid,
    title: prompt.title,
    prompt: prompt.prompt,
    pictures: [...prompt.pictures],
    displayType: prompt.displayType,
    status: prompt.status,
  };
}

export function createEmptyPromptOption(
  status: PromptStatus = PROMPT_STATUS.ACTIVE
): EditablePromptOption {
  return {
    localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    prompt: "",
    pictures: [],
    displayType: PROMPT_DISPLAY_TYPE.PICTURE,
    status,
  };
}

export function buildPromptOptionPayload(option: EditablePromptOption) {
  return {
    title: option.title.trim(),
    prompt: option.prompt.trim(),
    pictures: option.pictures.filter(Boolean),
    displayType: option.displayType,
    status: option.status ?? PROMPT_STATUS.ACTIVE,
  };
}

export function isSamePromptOption(
  current: EditablePromptOption,
  baseline: EditablePromptOption
): boolean {
  const a = buildPromptOptionPayload(current);
  const b = buildPromptOptionPayload(baseline);
  return (
    a.title === b.title &&
    a.prompt === b.prompt &&
    a.displayType === b.displayType &&
    a.status === b.status &&
    a.pictures.join("|") === b.pictures.join("|")
  );
}

export function moveItem<T>(items: T[], index: number, direction: 1 | -1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const current = next[index];
  const target = next[nextIndex];
  if (!current || !target) return items;
  next[index] = target;
  next[nextIndex] = current;
  return next;
}

export function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(url);
}

export function isVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) ||
    /youtube\.com|youtu\.be|aparat\.com|\/embed/i.test(url)
  );
}
