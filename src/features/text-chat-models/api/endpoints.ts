export const TEXT_CHAT_MODEL_ENDPOINTS = {
  models: "/admin/text-chat/models",
  model: (code: string) => `/admin/text-chat/models/${encodeURIComponent(code)}`,
} as const;

/**
 * Suggested system-config route. Replace this string when the backend lands.
 * GET and PATCH body/response: { isActive: boolean, message: string }
 */
export const TEXT_CHAT_AVAILABILITY_ENDPOINT = "/system-config/text-chat";
