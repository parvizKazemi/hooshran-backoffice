import {
  CREDIT_LEDGER_STATUSES,
  CREDIT_LEDGER_TYPES,
  type CreditLedgerEntry,
  type CreditLedgerStatus,
} from "../types";

export const CANCELATION_REASON = {
  enReason: "canceled after checking with bank endpoint",
  faReason: "عدم تایید تراکنش از سمت پایانه بانکی",
};

export function getLedgerActionReason(entry: CreditLedgerEntry): string | null {
  const cancelationReason = entry.metadata?.cancelationReason;
  if (typeof cancelationReason === "string" && cancelationReason.trim().length > 0) {
    return cancelationReason === CANCELATION_REASON.enReason
      ? CANCELATION_REASON.faReason
      : cancelationReason;
  }

  const canShowMetadataReason =
    entry.type === "admin" || typeof entry.metadata?.adminAction === "string";
  const metadataReason = entry.metadata?.reason;
  if (
    canShowMetadataReason &&
    typeof metadataReason === "string" &&
    metadataReason.trim().length > 0
  ) {
    return metadataReason.trim();
  }

  return null;
}

export function extractServiceRequestUuid(
  entry: CreditLedgerEntry
): string | null {
  const metadataUuid = entry.metadata?.serviceRequestUuid;
  if (typeof metadataUuid === "string" && metadataUuid.length > 0) {
    return metadataUuid;
  }
  return null;
}

export function extractApiServiceUuid(entry: CreditLedgerEntry): string | null {
  const metadataUuid = entry.metadata?.apiServiceUuid;
  if (typeof metadataUuid === "string" && metadataUuid.length > 0) {
    return metadataUuid;
  }
  return null;
}

export function extractLedgerEndpoint(entry: CreditLedgerEntry): string | null {
  const endpoint = entry.metadata?.endpoint;
  if (typeof endpoint === "string" && endpoint.trim().length > 0) {
    return endpoint.trim();
  }
  return null;
}

/** Resolve service display name from ledger metadata + service catalogs. */
export function resolveLedgerServiceTitle(
  entry: CreditLedgerEntry,
  options?: {
    serviceNameByUuid?: Map<string, string>;
    serviceNameByEndpoint?: Map<string, string>;
    /** Map keyed by serviceRequestUuid */
    serviceTitleByRequestUuid?: Map<string, string>;
  }
): string | undefined {
  const {
    serviceNameByUuid,
    serviceNameByEndpoint,
    serviceTitleByRequestUuid,
  } = options ?? {};

  const apiServiceUuid = extractApiServiceUuid(entry);
  if (apiServiceUuid && serviceNameByUuid?.has(apiServiceUuid)) {
    return serviceNameByUuid.get(apiServiceUuid);
  }

  const endpoint = extractLedgerEndpoint(entry);
  if (endpoint && serviceNameByEndpoint?.has(endpoint)) {
    return serviceNameByEndpoint.get(endpoint);
  }

  const requestUuid = extractServiceRequestUuid(entry);
  if (requestUuid && serviceTitleByRequestUuid?.has(requestUuid)) {
    return serviceTitleByRequestUuid.get(requestUuid);
  }

  return undefined;
}

export function isInventoryEntry(entry: CreditLedgerEntry): boolean {
  return entry.type === CREDIT_LEDGER_TYPES.INVENTORY;
}

export function isRequestUsageEntry(entry: CreditLedgerEntry): boolean {
  return (
    entry.type === CREDIT_LEDGER_TYPES.USAGE &&
    !!extractServiceRequestUuid(entry)
  );
}

export function getTransactionDirectionLabel(
  amount: number
): "افزایش" | "کاهش" {
  return amount > 0 ? "افزایش" : "کاهش";
}

export function getTransactionTypeLabel(entry: CreditLedgerEntry): string {
  if (isInventoryEntry(entry)) return "موجودی";
  return getTransactionDirectionLabel(entry.amount);
}

export function getTransactionTypeBadgeClass(entry: CreditLedgerEntry): string {
  if (isInventoryEntry(entry)) {
    return "bg-primary/10 text-primary border-primary/20";
  }

  if (entry.amount > 0) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }

  return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
}

export function getLedgerAmountClass(entry: CreditLedgerEntry): string {
  if (isInventoryEntry(entry)) {
    return "text-muted-foreground";
  }

  if (entry.amount > 0) {
    return "text-emerald-600 dark:text-emerald-400";
  }

  return "text-rose-600 dark:text-rose-400";
}

export function formatLedgerAmount(amount: number): string {
  const formatted = Math.abs(amount).toString();
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatLedgerAmountForDisplay(
  entry: CreditLedgerEntry
): string | null {
  if (isInventoryEntry(entry)) return null;
  return formatLedgerAmount(entry.amount);
}

export type LedgerDescriptionParts = {
  title: string;
  detail?: string;
};

export function getLedgerDescriptionParts(
  entry: CreditLedgerEntry,
  serviceTitle?: string | null
): LedgerDescriptionParts {
  const amount = Math.abs(entry.amount);
  const formattedAmount = amount.toString();
  const increaseDetail = `افزایش ${formattedAmount} اعتبار`;
  const decreaseDetail = `کاهش ${formattedAmount} اعتبار`;

  switch (entry.type) {
    case CREDIT_LEDGER_TYPES.USAGE:
      return {
        title: serviceTitle
          ? `استفاده از سرویس ${serviceTitle}`
          : "استفاده از سرویس",
        detail: decreaseDetail,
      };
    case CREDIT_LEDGER_TYPES.REFUND:
      return {
        title: "بازگشت اعتبار بابت درخواست ناموفق",
        detail: increaseDetail,
      };
    case CREDIT_LEDGER_TYPES.PURCHASE:
      return { title: `اضافه شدن ${formattedAmount} اعتبار برای خرید پلن` };
    case CREDIT_LEDGER_TYPES.GIFT:
      return { title: "هدیه اعتبار هوشران", detail: increaseDetail };
    case CREDIT_LEDGER_TYPES.TRANSFER:
      return entry.amount > 0
        ? { title: "انتقال اعتبار به حساب", detail: increaseDetail }
        : { title: "انتقال اعتبار از حساب", detail: decreaseDetail };
    case CREDIT_LEDGER_TYPES.ADMIN:
      if (entry.metadata?.adminAction === "cancel") {
        return {
          title: "لغو شده توسط مدیر سیستم",
          detail: decreaseDetail,
        };
      }
      return entry.amount > 0
        ? { title: "افزایش اعتبار توسط پشتیبانی", detail: increaseDetail }
        : { title: "کاهش اعتبار توسط پشتیبانی", detail: decreaseDetail };
    case CREDIT_LEDGER_TYPES.EXPIRE:
      return { title: "انقضای اعتبار", detail: decreaseDetail };
    case CREDIT_LEDGER_TYPES.INVENTORY:
      return {
        title: "ثبت موجودی اولیه حساب در دفتر اعتبار",
        detail: `${formattedAmount} سکه`,
      };
    default:
      return { title: "تراکنش اعتبار", detail: formattedAmount };
  }
}

export function getLedgerDescription(
  entry: CreditLedgerEntry,
  serviceTitle?: string | null
): string {
  const { title, detail } = getLedgerDescriptionParts(entry, serviceTitle);
  return detail ? `${title} (${detail})` : title;
}

export function getLedgerStatusLabel(status: CreditLedgerStatus): string {
  switch (status) {
    case CREDIT_LEDGER_STATUSES.PENDING:
      return "در انتظار";
    case CREDIT_LEDGER_STATUSES.SUCCESS:
      return "موفق";
    case CREDIT_LEDGER_STATUSES.FAILED:
      return "ناموفق";
    case CREDIT_LEDGER_STATUSES.REVERSED:
      return "برگشت‌خورده";
    default:
      return status;
  }
}

export function getLedgerTypeFilterLabel(type: string): string {
  switch (type) {
    case CREDIT_LEDGER_TYPES.PURCHASE:
      return "خرید";
    case CREDIT_LEDGER_TYPES.USAGE:
      return "مصرف";
    case CREDIT_LEDGER_TYPES.REFUND:
      return "بازگشت";
    case CREDIT_LEDGER_TYPES.GIFT:
      return "هدیه";
    case CREDIT_LEDGER_TYPES.TRANSFER:
      return "انتقال";
    case CREDIT_LEDGER_TYPES.ADMIN:
      return "ادمین";
    case CREDIT_LEDGER_TYPES.EXPIRE:
      return "انقضا";
    case CREDIT_LEDGER_TYPES.INVENTORY:
      return "موجودی";
    default:
      return type;
  }
}

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCreditLedgerCsvContent(
  entries: CreditLedgerEntry[],
  serviceTitleOptions?: {
    serviceNameByUuid?: Map<string, string>;
    serviceNameByEndpoint?: Map<string, string>;
    serviceTitleByRequestUuid?: Map<string, string>;
  }
): string {
  const headers = [
    "ردیف",
    "نوع تراکنش",
    "شرح تراکنش",
    "تغییر اعتبار (سکه)",
    "اعتبار باقی‌مانده بعد از عمل",
    "وضعیت",
    "تاریخ و ساعت",
  ];

  const rows = entries.map((entry, index) => {
    const amountDisplay = formatLedgerAmountForDisplay(entry);
    const balanceAfter = entry.balanceAfter ?? 0;
    const serviceTitle = resolveLedgerServiceTitle(entry, serviceTitleOptions);

    return [
      String(index + 1),
      getTransactionTypeLabel(entry),
      getLedgerDescription(entry, serviceTitle),
      amountDisplay ?? "—",
      balanceAfter.toString(),
      getLedgerStatusLabel(entry.status),
      new Date(entry.createdAt).toLocaleString("fa-IR"),
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(",");
  });

  return `\ufeff${[headers.join(","), ...rows].join("\n")}`;
}

export function downloadCreditLedgerCsv(
  entries: CreditLedgerEntry[],
  phoneNumber: string,
  serviceTitleOptions?: {
    serviceNameByUuid?: Map<string, string>;
    serviceNameByEndpoint?: Map<string, string>;
    serviceTitleByRequestUuid?: Map<string, string>;
  }
): void {
  const csvContent = buildCreditLedgerCsvContent(entries, serviceTitleOptions);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `گزارش_گردش_اعتبار_${phoneNumber}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
