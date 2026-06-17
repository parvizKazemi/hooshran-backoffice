export const BLACKLIST_REASON_SUGGESTIONS = [
  "اسپم پرامپت",
  "خرید مشکوک",
  "رفتارهای مخرب",
] as const;

export function getReasonBadgeClass(reason: string): string {
  if (reason.includes("خرید مشکوک") || reason.includes("خرید")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
  }

  if (reason.includes("رفتارهای مخرب") || reason.includes("تخلف")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900";
  }

  return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900";
}

export function formatBlacklistDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.toLocaleDateString("fa-IR")} - ${date.toLocaleTimeString(
    "fa-IR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`;
}

export function isValidIranPhone(phone: string): boolean {
  const normalized = phone.trim();
  return /^09\d{9}$/.test(normalized);
}
