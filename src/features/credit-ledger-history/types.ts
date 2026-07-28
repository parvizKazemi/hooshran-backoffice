export const CREDIT_LEDGER_TYPES = {
  PURCHASE: "purchase",
  USAGE: "usage",
  REFUND: "refund",
  GIFT: "gift",
  TRANSFER: "transfer",
  ADMIN: "admin",
  EXPIRE: "expire",
  INVENTORY: "inventory",
} as const;

export type CreditLedgerType =
  (typeof CREDIT_LEDGER_TYPES)[keyof typeof CREDIT_LEDGER_TYPES];

export const CREDIT_LEDGER_STATUSES = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REVERSED: "reversed",
} as const;

export type CreditLedgerStatus =
  (typeof CREDIT_LEDGER_STATUSES)[keyof typeof CREDIT_LEDGER_STATUSES];

export interface CreditLedgerMetadata {
  serviceRequestUuid?: string;
  serviceRequestId?: number;
  apiServiceUuid?: string;
  apiServiceId?: number;
  creditsConsumed?: number;
  creditsCredited?: number;
  paymentId?: number;
  packageId?: number;
  userCreditId?: number;
  reason?: string;
  endpoint?: string;
  adminAction?: "create" | "update" | "cancel" | string;
  previousBalance?: number;
  newBalance?: number;
  [key: string]: unknown;
}

export interface CreditLedgerEntry {
  uuid: string;
  amount: number;
  type: CreditLedgerType;
  status: CreditLedgerStatus;
  balanceAfter?: number | null;
  metadata?: CreditLedgerMetadata | null;
  createdAt: string;
}

export interface CreditLedgerMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreditLedgerApiResponse {
  data: CreditLedgerEntry[];
  meta: CreditLedgerMeta;
}

export interface CreditLedgerQueryParams {
  phoneNumber?: string;
  page?: number;
  limit?: number;
  type?: CreditLedgerType | "all";
  status?: CreditLedgerStatus | "all";
  from?: string;
  to?: string;
}
