export const PROMPT_ASSISTANT_ENDPOINTS = {
  categories: "/prompt-categories",
  category: (uuid: string) => `/prompt-categories/${encodeURIComponent(uuid)}`,
  assignToService: "/prompt-categories/service/assign",
  serviceAssignments: "/prompt-categories/service/assignments",
  serviceCategories: (serviceUuid: string) =>
    `/prompt-categories/service/${encodeURIComponent(serviceUuid)}`,
  prompts: "/prompts",
  prompt: (uuid: string) => `/prompts/${encodeURIComponent(uuid)}`,
  promptsByCategory: (categoryUuid: string) =>
    `/prompts/category/${encodeURIComponent(categoryUuid)}`,
  platformServices: "/admin/api-services",
} as const;
