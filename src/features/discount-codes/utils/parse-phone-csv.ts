const PHONE_REGEX = /^09\d{9}$/;

export function extractPhoneNumbersFromCsv(content: string): string[] {
  const normalized = content.replace(/^\uFEFF/, "");
  const matches = normalized.match(/09\d{9}/g) ?? [];

  const phones = new Set<string>();
  for (const phone of matches) {
    if (PHONE_REGEX.test(phone)) {
      phones.add(phone);
    }
  }

  return Array.from(phones);
}
