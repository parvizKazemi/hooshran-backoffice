import type { ServiceHintBlock, ServiceHintConfig } from "../types";

const hasBlockValue = (block: ServiceHintBlock): boolean => {
  if ("value" in block) {
    return block.value.trim().length > 0;
  }
  return true;
};

const normalizeBlockForApi = (block: ServiceHintBlock): ServiceHintBlock => {
  if (block.type === "text") {
    return { type: "text", value: block.value.trim() };
  }

  if (block.type === "tip") {
    return {
      type: "tip",
      value: block.value.trim(),
      style: block.style,
    };
  }

  if (block.type === "image") {
    return {
      type: "image",
      source: "url",
      value: block.value.trim(),
      fileName: "",
    };
  }

  return {
    type: "video",
    source: "iframe",
    value: block.value.trim(),
    fileName: "",
  };
};

export const prepareServiceHintPayload = (
  sections: ServiceHintConfig
): ServiceHintConfig =>
  sections
    .map((section) => ({
      ...section,
      title: section.title.trim(),
      blocks: section.blocks.filter(hasBlockValue).map(normalizeBlockForApi),
    }))
    .filter((section) => section.blocks.length > 0);

export const hasPendingBlobMedia = (sections: ServiceHintConfig): boolean =>
  sections.some((section) =>
    section.blocks.some(
      (block) =>
        (block.type === "image" || block.type === "video") &&
        block.value.startsWith("blob:")
    )
  );
