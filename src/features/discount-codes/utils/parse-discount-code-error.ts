import { ApiError } from "@/services/api";

const INVALID_PHONE_ERROR_CODE = "SRVLER0010";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

export function extractInvalidPhoneNumbers(error: unknown): string[] {
  if (!(error instanceof ApiError)) {
    return [];
  }

  const payload = error.originalError;

  if (!isRecord(payload)) {
    return [];
  }

  const data = payload.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item): item is string => typeof item === "string")
    .map((phone) => phone.trim())
    .filter(Boolean);
}

export function hasInvalidPhoneNumbersError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  const invalidPhones = extractInvalidPhoneNumbers(error);

  if (invalidPhones.length > 0) {
    return true;
  }

  const payload = error.originalError;

  if (isRecord(payload) && payload.code === INVALID_PHONE_ERROR_CODE) {
    return true;
  }

  return /phone numbers are invalid/i.test(error.message);
}
