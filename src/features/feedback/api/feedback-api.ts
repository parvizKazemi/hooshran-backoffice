import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type {
  AdminFeedbackQuery,
  AutoMessageRule,
  CreateFeedbackPageConfigPayload,
  FeedbackAdminNote,
  FeedbackAnalytics,
  FeedbackConfig,
  FeedbackItem,
  FeedbackMatchType,
  FeedbackPageConfig,
  FeedbackRulesConfig,
  FeedbackStatus,
  PaginatedFeedbacksResponse,
  ReadyMessageRule,
  UpdateFeedbackConfigPayload,
  UpdateFeedbackPageConfigPayload,
} from "../types";
import { FEEDBACK_ENDPOINTS } from "./endpoints";

const STORAGE_KEY_FEEDBACK_RULES = "hooshran_feedback_rules";

const DEFAULT_RULES: FeedbackRulesConfig = {
  readyRules: [],
  autoRules: [],
};

function getLocalRules(): FeedbackRulesConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK_RULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed?.readyRules) &&
        Array.isArray(parsed?.autoRules)
      ) {
        return {
          readyRules: parsed.readyRules.filter(
            (r: ReadyMessageRule) => r.id !== "ready_1" && r.id !== "ready_2"
          ),
          autoRules: parsed.autoRules.filter(
            (r: AutoMessageRule) => r.id !== "auto_1"
          ),
        };
      }
    }
  } catch {
    // ignore parse error and fall back
  }
  return DEFAULT_RULES;
}

function setLocalRules(rules: FeedbackRulesConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACK_RULES, JSON.stringify(rules));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Admin: List all page-specific feedback configurations from backend
 */
export async function getFeedbackPageConfigs(): Promise<FeedbackPageConfig[]> {
  try {
    const data = await apiGet<FeedbackPageConfig[]>(
      FEEDBACK_ENDPOINTS.pageConfigs
    );
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Admin: Create a new page feedback configuration
 */
export async function createFeedbackPageConfig(
  payload: CreateFeedbackPageConfigPayload
): Promise<FeedbackPageConfig> {
  return apiPost<FeedbackPageConfig>(FEEDBACK_ENDPOINTS.pageConfigs, payload);
}

/**
 * Admin: Update an existing page feedback configuration
 */
export async function updateFeedbackPageConfig(
  uuid: string,
  payload: UpdateFeedbackPageConfigPayload
): Promise<FeedbackPageConfig> {
  return apiPatch<FeedbackPageConfig>(
    FEEDBACK_ENDPOINTS.pageConfigByUuid(uuid),
    payload
  );
}

/**
 * Admin: Delete a page feedback configuration
 */
export async function deleteFeedbackPageConfig(uuid: string): Promise<void> {
  return apiDelete<void>(FEEDBACK_ENDPOINTS.pageConfigByUuid(uuid));
}

/**
 * Helper: Converts FeedbackPageConfig array into readyRules and autoRules
 */
export function mapPageConfigsToFeedbackRules(
  configs: FeedbackPageConfig[]
): FeedbackRulesConfig {
  const readyRules: ReadyMessageRule[] = [];
  const autoRules: AutoMessageRule[] = [];

  for (const c of configs) {
    const rawMatch = c.metadata?.matchType;
    const matchType: FeedbackMatchType =
      rawMatch === "exact" || rawMatch === "contains"
        ? rawMatch
        : c.pagePath === "*" || !c.pagePath.startsWith("/")
          ? "contains"
          : "exact";

    const cleanUrl = c.pagePath === "*" ? "*" : c.pagePath.replace(/^\/+/, "");

    if (Array.isArray(c.defaultMessages) && c.defaultMessages.length > 0) {
      readyRules.push({
        id: c.uuid,
        matchType,
        url: cleanUrl,
        messages: c.defaultMessages,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      });
    }

    if (c.promptMessage || c.showAfterSeconds > 0) {
      autoRules.push({
        id: c.uuid,
        matchType,
        url: cleanUrl,
        delay: c.showAfterSeconds || 5,
        message: c.promptMessage || "",
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      });
    }
  }

  return { readyRules, autoRules };
}

/**
 * Fetch feedback rules. Fetches real page-configs from backend, falls back gracefully to local storage if offline.
 */
export async function getFeedbackRules(): Promise<FeedbackRulesConfig> {
  try {
    const configs = await getFeedbackPageConfigs();
    if (configs && configs.length > 0) {
      const mapped = mapPageConfigsToFeedbackRules(configs);
      setLocalRules(mapped);
      return mapped;
    }
  } catch (error) {
    if (
      !(
        error instanceof ApiError &&
        (error.statusCode === 404 || error.statusCode === 502)
      )
    ) {
      // ignore network errors and fallback
    }
  }
  return getLocalRules();
}

/**
 * Save feedback rules in batch (syncs to backend page-configs)
 */
export async function saveFeedbackRules(
  rules: FeedbackRulesConfig
): Promise<FeedbackRulesConfig> {
  setLocalRules(rules);

  try {
    // Sync each rule to real backend page-configs
    const existingConfigs = await getFeedbackPageConfigs();
    const configMap = new Map<string, FeedbackPageConfig>();
    existingConfigs.forEach((c) => configMap.set(c.uuid, c));

    // Update or create ready rules
    for (const ready of rules.readyRules) {
      const pagePath =
        !ready.url || ready.url === "*" || ready.url === "/"
          ? "*"
          : `/${ready.url.replace(/^\/+/, "")}`;
      const existing =
        typeof ready.id === "string" ? configMap.get(ready.id) : undefined;

      if (existing) {
        await updateFeedbackPageConfig(existing.uuid, {
          pagePath,
          defaultMessages: ready.messages,
          isActive: ready.isActive,
          metadata: { ...existing.metadata, matchType: ready.matchType },
        });
      } else {
        const created = await createFeedbackPageConfig({
          pagePath,
          title: "پیام‌های آماده بازخورد",
          defaultMessages: ready.messages,
          showAfterSeconds: 5,
          isActive: ready.isActive,
          metadata: { matchType: ready.matchType },
        });
        configMap.set(created.uuid, created);
      }
    }

    // Update or create auto rules
    for (const auto of rules.autoRules) {
      const pagePath =
        !auto.url || auto.url === "*" || auto.url === "/"
          ? "*"
          : `/${auto.url.replace(/^\/+/, "")}`;
      const existing =
        typeof auto.id === "string" ? configMap.get(auto.id) : undefined;

      if (existing) {
        await updateFeedbackPageConfig(existing.uuid, {
          pagePath,
          promptMessage: auto.message,
          showAfterSeconds: auto.delay,
          isActive: auto.isActive,
          metadata: { ...existing.metadata, matchType: auto.matchType },
        });
      } else {
        const created = await createFeedbackPageConfig({
          pagePath,
          title: "پیام خودکار به کاربر",
          promptMessage: auto.message,
          showAfterSeconds: auto.delay,
          defaultMessages: [],
          isActive: auto.isActive,
          metadata: { matchType: auto.matchType },
        });
        configMap.set(created.uuid, created);
      }
    }

    // Find active UUIDs in current rule set
    const activeUuids = new Set<string>();
    rules.readyRules.forEach((r) => {
      if (typeof r.id === "string" && !r.id.startsWith("ready_")) {
        activeUuids.add(r.id);
      }
    });
    rules.autoRules.forEach((a) => {
      if (typeof a.id === "string" && !a.id.startsWith("auto_")) {
        activeUuids.add(a.id);
      }
    });

    // Delete configs that were removed completely
    for (const c of existingConfigs) {
      if (!activeUuids.has(c.uuid)) {
        await deleteFeedbackPageConfig(c.uuid);
      }
    }
  } catch {
    // If backend endpoint is temporarily unreachable, local rules are already preserved
  }

  return rules;
}

/**
 * Query and list feedback items & bug reports
 */
export async function getFeedbacks(
  query: AdminFeedbackQuery = {}
): Promise<PaginatedFeedbacksResponse> {
  const searchParams = new URLSearchParams();

  if (query.page !== undefined)
    searchParams.append("page", query.page.toString());
  if (query.limit !== undefined)
    searchParams.append("limit", query.limit.toString());
  if (query.type) searchParams.append("type", query.type);
  if (query.status) searchParams.append("status", query.status);
  if (query.rating) searchParams.append("rating", query.rating);
  if (query.tag) searchParams.append("tag", query.tag);
  if (query.userId !== undefined)
    searchParams.append("userId", query.userId.toString());
  if (query.clarityId) searchParams.append("clarityId", query.clarityId);
  if (query.search) searchParams.append("search", query.search);
  if (query.startDate) searchParams.append("startDate", query.startDate);
  if (query.endDate) searchParams.append("endDate", query.endDate);

  const qs = searchParams.toString();
  const endpoint = `${FEEDBACK_ENDPOINTS.feedbacks}${qs ? `?${qs}` : ""}`;

  try {
    const res = await apiGet<PaginatedFeedbacksResponse>(endpoint);
    return res;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return {
        items: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 20,
      };
    }
    throw error;
  }
}

/**
 * Get single feedback item details with notes and Clarity link
 */
export async function getFeedbackByUuid(uuid: string): Promise<FeedbackItem> {
  return apiGet<FeedbackItem>(FEEDBACK_ENDPOINTS.feedbackByUuid(uuid));
}

/**
 * Update feedback workflow status
 */
export async function updateFeedbackStatus(
  uuid: string,
  status: FeedbackStatus
): Promise<FeedbackItem> {
  return apiPatch<FeedbackItem>(FEEDBACK_ENDPOINTS.feedbackStatus(uuid), {
    status,
  });
}

/**
 * Add an internal note to feedback
 */
export async function addFeedbackAdminNote(
  uuid: string,
  note: string
): Promise<FeedbackAdminNote> {
  return apiPost<FeedbackAdminNote>(FEEDBACK_ENDPOINTS.feedbackNotes(uuid), {
    note,
  });
}

/**
 * Delete an internal note from feedback
 */
export async function deleteFeedbackAdminNote(
  uuid: string,
  noteUuid: string
): Promise<void> {
  return apiDelete<void>(FEEDBACK_ENDPOINTS.feedbackNoteDelete(uuid, noteUuid));
}

/**
 * Get dynamic threshold configuration
 */
export async function getFeedbackConfig(): Promise<FeedbackConfig> {
  try {
    return await apiGet<FeedbackConfig>(FEEDBACK_ENDPOINTS.config);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return { maxFeedbackPromptsPerUser: 5, feedbackCooldownDays: 30 };
    }
    throw error;
  }
}

/**
 * Update dynamic threshold configuration
 */
export async function updateFeedbackConfig(
  payload: UpdateFeedbackConfigPayload
): Promise<FeedbackConfig> {
  return apiPatch<FeedbackConfig>(FEEDBACK_ENDPOINTS.config, payload);
}

/**
 * Get feedback & bug report analytics
 */
export async function getFeedbackAnalytics(): Promise<FeedbackAnalytics> {
  try {
    return await apiGet<FeedbackAnalytics>(FEEDBACK_ENDPOINTS.analytics);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return {
        total: 0,
        inlineAi: 0,
        bugReports: 0,
        statusBreakdown: {},
        ratingBreakdown: {},
      };
    }
    throw error;
  }
}
