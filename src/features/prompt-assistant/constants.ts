export const PROMPT_ASSISTANT_PAGE_TAKE = 200;

export const PROMPT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const PROMPT_DISPLAY_TYPE = {
  PICTURE: "PICTURE",
  VIDEO: "VIDEO",
} as const;

/** Category display kind stored in `tags` as a single canonical tag. */
export const PROMPT_DISPLAY_KIND = {
  STYLE: "style",
  PROMPT: "prompt",
} as const;

export const PROMPT_DISPLAY_KIND_FILTER = {
  ALL: "all",
  STYLE: "style",
  PROMPT: "prompt",
} as const;

export const PROMPT_CATEGORY_ICONS = [
  "sun",
  "sunset",
  "palette",
  "camera",
  "video",
  "film",
  "gauge",
  "move",
  "sparkles",
  "wand",
] as const;

export const PLATFORM_SERVICES_QUERY_LIMIT = 300;
