import {
  MONITORING_ERROR_TYPES,
  MONITORING_SEVERITIES,
  type MonitoringErrorLog,
  type MonitoringErrorType,
  type MonitoringSeverity,
} from "../types";

export function toDayStartIso(dateYmd: string): string {
  return `${dateYmd}T00:00:00.000Z`;
}

export function toDayEndIso(dateYmd: string): string {
  return `${dateYmd}T23:59:59.999Z`;
}

export function formatMonitoringDate(value: string): string {
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return value;
  }
}

export function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case MONITORING_SEVERITIES.CRITICAL:
      return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
    case MONITORING_SEVERITIES.HIGH:
      return "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case MONITORING_SEVERITIES.MEDIUM:
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case MONITORING_SEVERITIES.LOW:
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function getTypeBadgeClass(type: string): string {
  switch (type) {
    case MONITORING_ERROR_TYPES.SECURITY_ALERT:
      return "border-red-600/40 bg-red-600/10 text-red-800 dark:text-red-200";
    case MONITORING_ERROR_TYPES.API_FAILURE:
      return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case MONITORING_ERROR_TYPES.UNCAUGHT_EXCEPTION:
      return "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case MONITORING_ERROR_TYPES.SUSPICIOUS_ACTIVITY:
      return "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case MONITORING_ERROR_TYPES.FRONTEND_ERROR:
      return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function countBySeverity(items: MonitoringErrorLog[]) {
  const counts: Record<MonitoringSeverity, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  for (const item of items) {
    const key = item.severity as MonitoringSeverity;
    if (key in counts) counts[key] += 1;
  }

  return (Object.keys(counts) as MonitoringSeverity[]).map((severity) => ({
    key: severity,
    value: counts[severity],
  }));
}

export function countByType(items: MonitoringErrorLog[]) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}

export function countByDay(items: MonitoringErrorLog[]) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const day = item.createdAt.slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export function summarizeErrors(items: MonitoringErrorLog[]) {
  let criticalOrHigh = 0;
  let notifSent = 0;

  for (const item of items) {
    if (
      item.severity === MONITORING_SEVERITIES.CRITICAL ||
      item.severity === MONITORING_SEVERITIES.HIGH
    ) {
      criticalOrHigh += 1;
    }
    if (item.isNotifSent) notifSent += 1;
  }

  return {
    criticalOrHigh,
    notifSent,
    uniqueTypes: new Set(items.map((item) => item.type)).size,
  };
}

export function isKnownErrorType(type: string): type is MonitoringErrorType {
  return Object.values(MONITORING_ERROR_TYPES).includes(
    type as MonitoringErrorType
  );
}
