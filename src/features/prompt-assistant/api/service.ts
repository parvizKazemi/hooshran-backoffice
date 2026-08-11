import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import {
  PLATFORM_SERVICES_QUERY_LIMIT,
  PROMPT_ASSISTANT_PAGE_TAKE,
  PROMPT_STATUS,
} from "../constants";
import type {
  AssignCategoriesPayload,
  CreatePromptCategoryPayload,
  CreatePromptPayload,
  PageResult,
  PlatformServiceOption,
  PromptCategory,
  PromptItem,
  ServicePromptAssignment,
  UpdatePromptCategoryPayload,
  UpdatePromptPayload,
} from "../types";
import {
  normalizeAssignment,
  normalizeCategory,
  normalizePageResult,
  normalizePrompt,
} from "../utils/prompt-assistant.helpers";
import { PROMPT_ASSISTANT_ENDPOINTS } from "./endpoints";

export async function fetchPromptCategories(): Promise<PromptCategory[]> {
  const response = await apiGet<unknown>(
    `${PROMPT_ASSISTANT_ENDPOINTS.categories}?page=1&take=${PROMPT_ASSISTANT_PAGE_TAKE}`
  );
  const page = normalizePageResult(response, (item) => normalizeCategory(item));
  return page.data;
}

export async function fetchPromptCategoryDetail(
  uuid: string
): Promise<PromptCategory & { prompts: PromptItem[] }> {
  const response = await apiGet<Record<string, unknown>>(
    PROMPT_ASSISTANT_ENDPOINTS.category(uuid)
  );
  const category = normalizeCategory(response);
  const prompts = Array.isArray(response.prompts)
    ? response.prompts
        .filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === "object"
        )
        .map(normalizePrompt)
    : [];

  return { ...category, prompts, promptsCount: prompts.length };
}

export async function createPromptCategory(
  payload: CreatePromptCategoryPayload
): Promise<PromptCategory> {
  const response = await apiPost<Record<string, unknown>>(
    PROMPT_ASSISTANT_ENDPOINTS.categories,
    {
      ...payload,
      status: payload.status ?? PROMPT_STATUS.INACTIVE,
      tags: payload.tags ?? [],
    }
  );
  return normalizeCategory(response);
}

export async function updatePromptCategory(
  uuid: string,
  payload: UpdatePromptCategoryPayload
): Promise<PromptCategory> {
  const response = await apiPatch<Record<string, unknown>>(
    PROMPT_ASSISTANT_ENDPOINTS.category(uuid),
    payload
  );
  return normalizeCategory(response);
}

export async function deletePromptCategory(uuid: string): Promise<void> {
  await apiDelete(PROMPT_ASSISTANT_ENDPOINTS.category(uuid));
}

export async function fetchPromptsByCategory(
  categoryUuid: string
): Promise<PromptItem[]> {
  const response = await apiGet<unknown>(
    `${PROMPT_ASSISTANT_ENDPOINTS.promptsByCategory(categoryUuid)}?page=1&take=${PROMPT_ASSISTANT_PAGE_TAKE}`
  );
  const page = normalizePageResult(response, normalizePrompt);
  return page.data;
}

export async function createPrompt(
  payload: CreatePromptPayload
): Promise<PromptItem> {
  const response = await apiPost<Record<string, unknown>>(
    PROMPT_ASSISTANT_ENDPOINTS.prompts,
    {
      ...payload,
      pictures: payload.pictures ?? [],
      status: payload.status ?? PROMPT_STATUS.INACTIVE,
    }
  );
  return normalizePrompt(response);
}

export async function updatePrompt(
  uuid: string,
  payload: UpdatePromptPayload
): Promise<PromptItem> {
  const response = await apiPatch<Record<string, unknown>>(
    PROMPT_ASSISTANT_ENDPOINTS.prompt(uuid),
    payload
  );
  return normalizePrompt(response);
}

export async function deletePrompt(uuid: string): Promise<void> {
  await apiDelete(PROMPT_ASSISTANT_ENDPOINTS.prompt(uuid));
}

export async function assignCategoriesToService(
  payload: AssignCategoriesPayload
): Promise<void> {
  await apiPost(PROMPT_ASSISTANT_ENDPOINTS.assignToService, payload);
}

export async function fetchServiceAssignments(): Promise<
  ServicePromptAssignment[]
> {
  const response = await apiGet<unknown>(
    `${PROMPT_ASSISTANT_ENDPOINTS.serviceAssignments}?page=1&take=${PROMPT_ASSISTANT_PAGE_TAKE}`
  );
  const page = normalizePageResult(response, normalizeAssignment);
  return page.data;
}

export async function fetchServiceAssignedCategories(
  serviceUuid: string
): Promise<PromptCategory[]> {
  const response = await apiGet<unknown>(
    PROMPT_ASSISTANT_ENDPOINTS.serviceCategories(serviceUuid)
  );

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object"
    )
    .map((item) => normalizeCategory(item));
}

export async function fetchPlatformServices(): Promise<
  PlatformServiceOption[]
> {
  const response = await apiGet<
    | { services?: Array<Record<string, unknown>> }
    | Array<Record<string, unknown>>
  >(
    `${PROMPT_ASSISTANT_ENDPOINTS.platformServices}?limit=${PLATFORM_SERVICES_QUERY_LIMIT}&type=all`
  );

  const list = Array.isArray(response) ? response : (response.services ?? []);

  return list
    .filter((service) => Boolean(service?.uuid && service?.name))
    .map((service) => ({
      uuid: String(service.uuid),
      name: String(service.name),
      slug: String(service.slug ?? ""),
      isActive: service.isActive !== false,
    }));
}

export type { PageResult };
