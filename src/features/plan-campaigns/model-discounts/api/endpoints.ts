export const MODEL_DISCOUNT_ENDPOINTS = {
  list: "/admin/model-discounts",
  detail: (uuid: string) =>
    `/admin/model-discounts/${encodeURIComponent(uuid)}`,
} as const;
