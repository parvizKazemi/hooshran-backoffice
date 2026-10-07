export const TEXT_CHAT_MODEL_ENDPOINTS = {
  models: "/admin/text-chat/models",
  model: (code: string) =>
    `/admin/text-chat/models/${encodeURIComponent(code)}`,
} as const;

export const TEXT_CHAT_AVAILABILITY_ENDPOINT = "/system-config/text-chat";
