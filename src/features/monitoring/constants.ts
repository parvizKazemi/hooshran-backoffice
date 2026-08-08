import {
  MONITORING_ERROR_TYPES,
  MONITORING_SEVERITIES,
  MONITORING_SOURCES,
  type MonitoringErrorType,
  type MonitoringSeverity,
  type MonitoringSource,
} from "./types";

export const MONITORING_QUERY_KEY = "monitoring-errors" as const;
export const MONITORING_DETAIL_QUERY_KEY = "monitoring-error-detail" as const;
export const MONITORING_CHART_QUERY_KEY = "monitoring-errors-chart" as const;

export const MONITORING_PAGE_SIZES = [10, 25, 50] as const;
export const MONITORING_DEFAULT_TAKE = 10;
export const MONITORING_CHART_TAKE = 100;

export const MONITORING_TYPE_OPTIONS: MonitoringErrorType[] = [
  MONITORING_ERROR_TYPES.FRONTEND_ERROR,
  MONITORING_ERROR_TYPES.API_FAILURE,
  MONITORING_ERROR_TYPES.UNCAUGHT_EXCEPTION,
  MONITORING_ERROR_TYPES.SUSPICIOUS_ACTIVITY,
  MONITORING_ERROR_TYPES.SECURITY_ALERT,
];

export const MONITORING_SEVERITY_OPTIONS: MonitoringSeverity[] = [
  MONITORING_SEVERITIES.LOW,
  MONITORING_SEVERITIES.MEDIUM,
  MONITORING_SEVERITIES.HIGH,
  MONITORING_SEVERITIES.CRITICAL,
];

export const MONITORING_SOURCE_OPTIONS: MonitoringSource[] = [
  MONITORING_SOURCES.FRONTEND,
  MONITORING_SOURCES.BACKEND,
  MONITORING_SOURCES.SYSTEM,
];

export const MONITORING_SEVERITY_COLORS: Record<MonitoringSeverity, string> = {
  LOW: "hsl(142 76% 36%)",
  MEDIUM: "hsl(45 93% 47%)",
  HIGH: "hsl(25 95% 53%)",
  CRITICAL: "hsl(0 84% 60%)",
};

export const MONITORING_TYPE_COLORS: Record<MonitoringErrorType, string> = {
  FRONTEND_ERROR: "hsl(221 83% 53%)",
  API_FAILURE: "hsl(0 84% 60%)",
  UNCAUGHT_EXCEPTION: "hsl(280 67% 50%)",
  SUSPICIOUS_ACTIVITY: "hsl(25 95% 53%)",
  SECURITY_ALERT: "hsl(0 72% 40%)",
};
