const IRAN_MOBILE_REGEX = /^09\d{9}$/;

export function isValidIranPhone(phone: string): boolean {
  return IRAN_MOBILE_REGEX.test(phone.trim());
}

/** Convert local IR mobile (09…) to E.164 (+98…) for backend lookup. */
export function toE164IranPhone(phone: string): string {
  const trimmed = phone.trim();

  if (trimmed.startsWith("+98")) {
    return trimmed;
  }

  if (trimmed.startsWith("98") && trimmed.length === 12) {
    return `+${trimmed}`;
  }

  if (IRAN_MOBILE_REGEX.test(trimmed)) {
    return `+98${trimmed.slice(1)}`;
  }

  return trimmed;
}
