import { EMPTY_SERVICE_HINT_CONFIG } from "../constants";
import type { ServiceHintBlock, ServiceHintConfig } from "../types";

export const guideHasPersistedContent = (
  sections: ServiceHintConfig
): boolean =>
  sections.some((section) =>
    section.blocks.some(
      (block) => "value" in block && block.value.trim().length > 0
    )
  );

const normalizeBlockForForm = (block: ServiceHintBlock): ServiceHintBlock => {
  if (block.type === "image") {
    return {
      type: "image",
      source: "url",
      value: block.value ?? "",
      fileName: block.fileName ?? "",
    };
  }

  if (block.type === "video") {
    return {
      type: "video",
      source: "iframe",
      value: block.value ?? "",
      fileName: block.fileName ?? "",
    };
  }

  if (block.type === "tip") {
    return {
      type: "tip",
      value: block.value ?? "",
      style: block.style ?? "info",
    };
  }

  return {
    type: "text",
    value: block.value ?? "",
  };
};

export const normalizeApiConfigToForm = (
  sections: ServiceHintConfig
): { sections: ServiceHintConfig; hasExisting: boolean } => {
  const hasExisting = guideHasPersistedContent(sections);

  if (!sections.length || !hasExisting) {
    return {
      sections: structuredClone(EMPTY_SERVICE_HINT_CONFIG),
      hasExisting: false,
    };
  }

  return {
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      blocks: section.blocks.map(normalizeBlockForForm),
    })),
    hasExisting: true,
  };
};
