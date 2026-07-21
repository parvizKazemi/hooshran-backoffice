export type ServiceHintBlockType = "text" | "image" | "video" | "tip";

export type ServiceHintTipStyle = "info" | "warning" | "success";

export type ServiceHintBlockBase = {
  type: ServiceHintBlockType;
};

export type ServiceHintTextBlock = ServiceHintBlockBase & {
  type: "text";
  value: string;
};

export type ServiceHintImageBlock = ServiceHintBlockBase & {
  type: "image";
  source: "url" | "upload";
  value: string;
  fileName: string;
};

export type ServiceHintVideoBlock = ServiceHintBlockBase & {
  type: "video";
  source: "iframe" | "upload";
  value: string;
  fileName: string;
};

export type ServiceHintTipBlock = ServiceHintBlockBase & {
  type: "tip";
  value: string;
  style: ServiceHintTipStyle;
};

export type ServiceHintBlock =
  | ServiceHintTextBlock
  | ServiceHintImageBlock
  | ServiceHintVideoBlock
  | ServiceHintTipBlock;

export type ServiceHintSection = {
  id: string;
  title: string;
  blocks: ServiceHintBlock[];
};

export type ServiceHintConfig = ServiceHintSection[];

export type PlatformService = {
  uuid: string;
  name: string;
  slug: string;
  isActive: boolean;
  templateName?: string | null;
  cost?: unknown;
  endpoint?: string;
  description?: string;
  imageUrl?: string;
};

export type ServiceHintConfigPayload = {
  serviceUuid: string;
  sections: ServiceHintConfig;
};
