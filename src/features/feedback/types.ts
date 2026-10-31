export type FeedbackMatchType = "contains" | "exact";

export type FeedbackType = "INLINE_AI" | "BUG_REPORT";

export type FeedbackStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "ARCHIVED";

export type FeedbackRating = "GOOD" | "NEUTRAL" | "BAD";

export interface ReadyMessageRule {
  id: string | number;
  matchType: FeedbackMatchType;
  url: string;
  messages: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutoMessageRule {
  id: string | number;
  matchType: FeedbackMatchType;
  url: string;
  delay: number; // in seconds, minimum 5
  message: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackRulesConfig {
  readyRules: ReadyMessageRule[];
  autoRules: AutoMessageRule[];
}

export interface FeedbackPageConfig {
  uuid: string;
  pagePath: string;
  title: string;
  promptMessage?: string | null;
  showAfterSeconds: number;
  defaultMessages: string[];
  isActive: boolean;
  order: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeedbackPageConfigPayload {
  pagePath: string;
  title: string;
  promptMessage?: string;
  showAfterSeconds?: number;
  defaultMessages?: string[];
  isActive?: boolean;
  order?: number;
  metadata?: Record<string, unknown>;
}

export type UpdateFeedbackPageConfigPayload =
  Partial<CreateFeedbackPageConfigPayload>;

export interface FeedbackUserSubscription {
  packageId?: number | null;
  packageName?: string | null;
  planQueue?: string | null;
}

export interface FeedbackUserSummary {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  activeSubscription?: FeedbackUserSubscription;
}

export interface FeedbackAdminNote {
  uuid: string;
  note: string;
  author?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  createdAt: string;
}

export interface FeedbackItem {
  id: number;
  uuid: string;
  type: FeedbackType;
  status: FeedbackStatus;
  rating?: FeedbackRating | null;
  categoryTags: string[];
  comment?: string | null;
  currentUrl: string;
  clarityId?: string | null;
  clarityUrl?: string | null;
  outputId?: string | null;
  deviceType: string;
  browser?: string | null;
  os?: string | null;
  metadata?: Record<string, unknown>;
  user?: FeedbackUserSummary | null;
  adminNotesCount?: number;
  adminNotes?: FeedbackAdminNote[];
  createdAt: string;
  updatedAt?: string;
}

export interface AdminFeedbackQuery {
  page?: number;
  limit?: number;
  type?: FeedbackType;
  status?: FeedbackStatus;
  rating?: FeedbackRating;
  tag?: string;
  userId?: number;
  clarityId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedFeedbacksResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FeedbackConfig {
  maxFeedbackPromptsPerUser: number;
  feedbackCooldownDays: number;
}

export interface UpdateFeedbackConfigPayload {
  maxFeedbackPromptsPerUser?: number;
  feedbackCooldownDays?: number;
}

export interface FeedbackAnalytics {
  total: number;
  inlineAi: number;
  bugReports: number;
  statusBreakdown: Record<string, number>;
  ratingBreakdown: Record<string, number>;
}
