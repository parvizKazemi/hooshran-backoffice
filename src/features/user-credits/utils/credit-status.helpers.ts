import { cn } from "@/lib/utils";
import type { CreditStatus, EditableCreditStatus } from "../types";

export const EDITABLE_CREDIT_STATUSES: EditableCreditStatus[] = [
  "active",
  "expired",
  "transferred",
  "canceled",
];

/** Normalize backend spelling (`transfered`) to UI key */
export function normalizeCreditStatus(
  status: string | undefined | null
): CreditStatus | string {
  if (!status) return "active";
  if (status === "transfered") return "transferred";
  return status;
}

export function getCreditStatusBadgeClass(status: string): string {
  const normalized = normalizeCreditStatus(status);

  switch (normalized) {
    case "active":
      return "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "expired":
      return "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400";
    case "transferred":
      return "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400";
    case "canceled":
      return "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";
    case "frozen":
      return "border-sky-100 bg-sky-50 text-sky-600 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400";
    case "used":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function creditStatusBadgeClassName(
  status: string,
  className?: string
): string {
  return cn(
    "rounded-lg px-2.5 py-1 text-[10px] font-black",
    getCreditStatusBadgeClass(status),
    className
  );
}
