import type { ServiceHintConfig } from "./types";

export const PLATFORM_SERVICES_LIMIT = 200;

export const SERVICE_HINT_LIMITS = {
  minSections: 1,
  maxSections: 8,
  minBlocksPerSection: 1,
  maxBlocksPerSection: 6,
  tipMaxLength: 150,
} as const;

export const EMPTY_SERVICE_HINT_CONFIG: ServiceHintConfig = [
  {
    id: "sec-1",
    title: "سرفصل اول",
    blocks: [{ type: "text", value: "" }],
  },
];
