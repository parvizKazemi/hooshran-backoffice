import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type {
  AdminFeedbackQuery,
  AutoMessageRule,
  FeedbackAdminNote,
  FeedbackAnalytics,
  FeedbackConfig,
  FeedbackItem,
  FeedbackRulesConfig,
  FeedbackStatus,
  PaginatedFeedbacksResponse,
  ReadyMessageRule,
  UpdateFeedbackConfigPayload,
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
 * Fetch feedback rules. Attempts API call first, falls back gracefully to localStorage.
 */
export async function getFeedbackRules(): Promise<FeedbackRulesConfig> {
  try {
    const remote = await apiGet<FeedbackRulesConfig>(FEEDBACK_ENDPOINTS.rules);
    if (
      remote &&
      Array.isArray(remote.readyRules) &&
      Array.isArray(remote.autoRules)
    ) {
      setLocalRules(remote);
      return remote;
    }
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.statusCode === 404 || error.statusCode === 502)
    ) {
      return getLocalRules();
    }
  }
  return getLocalRules();
}

/**
 * Save feedback rules. Persists to localStorage and sends to API.
 */
export async function saveFeedbackRules(
  rules: FeedbackRulesConfig
): Promise<FeedbackRulesConfig> {
  setLocalRules(rules);

  try {
    const response = await apiPost<FeedbackRulesConfig>(
      FEEDBACK_ENDPOINTS.rules,
      rules
    );
    if (response && Array.isArray(response.readyRules)) {
      setLocalRules(response);
      return response;
    }
  } catch (error) {
    // If endpoint is not yet mounted in backend, local persistence succeeds seamlessly
    if (error instanceof ApiError && error.statusCode === 404) {
      return rules;
    }
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
