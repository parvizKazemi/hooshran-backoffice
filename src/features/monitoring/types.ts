export const MONITORING_ERROR_TYPES = {
  FRONTEND_ERROR: "FRONTEND_ERROR",
  BACKEND_ERROR: "BACKEND_ERROR",
  API_FAILURE: "API_FAILURE",
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  SECURITY_ALERT: "SECURITY_ALERT",
  UNCAUGHT_EXCEPTION: "UNCAUGHT_EXCEPTION",
} as const;

export type MonitoringErrorType =
  (typeof MONITORING_ERROR_TYPES)[keyof typeof MONITORING_ERROR_TYPES];

export const MONITORING_SEVERITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type MonitoringSeverity =
  (typeof MONITORING_SEVERITIES)[keyof typeof MONITORING_SEVERITIES];

export const MONITORING_SOURCES = {
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  SYSTEM: "SYSTEM",
} as const;

export type MonitoringSource =
  (typeof MONITORING_SOURCES)[keyof typeof MONITORING_SOURCES];

export interface MonitoringErrorDetails {
  stackTrace?: string;
  apiUrl?: string;
  httpStatus?: number;
  browser?: string;
  os?: string;
  viewport?: string;
  userAgent?: string;
  clarityId?: string;
  ip?: string;
  customData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MonitoringErrorUser {
  id: number;
  phoneNumber?: string;
  email?: string;
  role?: string;
}

export interface MonitoringErrorLog {
  id: string;
  uuid: string;
  type: MonitoringErrorType | string;
  severity: MonitoringSeverity | string;
  location: string;
  error: string;
  details?: MonitoringErrorDetails | null;
  source: MonitoringSource | string;
  isNotifSent: boolean;
  userId?: number | null;
  user?: MonitoringErrorUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringErrorsMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MonitoringErrorsResponse {
  data: MonitoringErrorLog[];
  meta: MonitoringErrorsMeta;
}

export interface MonitoringErrorsQueryParams {
  dateFrom?: string;
  dateTo?: string;
  type?: MonitoringErrorType | "all";
  severity?: MonitoringSeverity | "all";
  source?: MonitoringSource | "all";
  location?: string;
  userId?: number;
  isNotifSent?: boolean | "all";
  search?: string;
  page?: number;
  take?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
}
