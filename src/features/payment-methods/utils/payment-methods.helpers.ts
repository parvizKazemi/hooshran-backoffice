import type {
  BankPortalMethodConfig,
  CardToCardMethodConfig,
  InstallmentMethodConfig,
  PaymentMethodsFormState,
} from "../types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function readString(
  source: Record<string, unknown>,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function readBoolean(
  source: Record<string, unknown>,
  keys: string[],
  fallback = false
): boolean {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

function readStringArray(
  source: Record<string, unknown>,
  keys: string[],
  fallback: string[] = []
): string[] {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item : String(item ?? "")))
        .filter(Boolean);
    }
  }
  return fallback;
}

function normalizeBankPortal(
  raw: unknown,
  fallback?: BankPortalMethodConfig
): BankPortalMethodConfig {
  const source = asRecord(raw);
  const providersRaw = asRecord(source.providers);
  const providers: BankPortalMethodConfig["providers"] = {};

  const providerEntries =
    Object.keys(providersRaw).length > 0
      ? Object.entries(providersRaw)
      : Object.entries(fallback?.providers ?? {});

  for (const [id, providerValue] of providerEntries) {
    const provider = asRecord(providerValue);
    const fallbackProvider = fallback?.providers?.[id];
    providers[id] = {
      isEnabled: readBoolean(
        provider,
        ["isEnabled"],
        fallbackProvider?.isEnabled ?? false
      ),
      title: readString(provider, ["title"], fallbackProvider?.title ?? id),
      merchantId: readString(
        provider,
        ["merchantId"],
        fallbackProvider?.merchantId ?? ""
      ),
      merchant: readString(
        provider,
        ["merchant"],
        fallbackProvider?.merchant ?? ""
      ),
      sandbox: readBoolean(
        provider,
        ["sandbox"],
        fallbackProvider?.sandbox ?? false
      ),
    };
  }

  const priority = readStringArray(
    source,
    ["priority"],
    fallback?.priority ?? Object.keys(providers)
  );

  return {
    isEnabled: readBoolean(source, ["isEnabled"], fallback?.isEnabled ?? false),
    title: readString(
      source,
      ["title"],
      fallback?.title ?? "درگاه پرداخت بانکی"
    ),
    description: readString(
      source,
      ["description"],
      fallback?.description ?? ""
    ),
    defaultProvider: readString(
      source,
      ["defaultProvider"],
      fallback?.defaultProvider ?? priority[0] ?? "zarinpal"
    ),
    priority,
    providers,
  };
}

function normalizeCardToCard(
  raw: unknown,
  fallback?: CardToCardMethodConfig
): CardToCardMethodConfig {
  const source = asRecord(raw);
  const cardInfo = asRecord(source.cardInfo);
  const notifier = asRecord(source.notifier);
  const fallbackCard = fallback?.cardInfo;
  const fallbackNotifier = fallback?.notifier;

  return {
    isEnabled: readBoolean(source, ["isEnabled"], fallback?.isEnabled ?? false),
    title: readString(
      source,
      ["title"],
      fallback?.title ?? "کارت به کارت / فیش واریزی"
    ),
    description: readString(
      source,
      ["description"],
      fallback?.description ?? ""
    ),
    cardInfo: {
      bankName: readString(
        cardInfo,
        ["bankName"],
        fallbackCard?.bankName ?? ""
      ),
      cardNumber: readString(
        cardInfo,
        ["cardNumber"],
        fallbackCard?.cardNumber ?? ""
      ),
      cardHolder: readString(
        cardInfo,
        ["cardHolder"],
        fallbackCard?.cardHolder ?? ""
      ),
      iban: readString(cardInfo, ["iban"], fallbackCard?.iban ?? ""),
    },
    notifier: {
      channel: readString(
        notifier,
        ["channel"],
        fallbackNotifier?.channel ?? "TELEGRAM"
      ),
      recipient: readString(
        notifier,
        ["recipient"],
        fallbackNotifier?.recipient ?? ""
      ),
      providerPriority: readStringArray(
        notifier,
        ["providerPriority"],
        fallbackNotifier?.providerPriority ?? ["bale", "telegram_bot"]
      ),
      appSecret: readString(
        notifier,
        ["appSecret"],
        fallbackNotifier?.appSecret ?? ""
      ),
    },
  };
}

function normalizeInstallment(
  raw: unknown,
  fallback?: InstallmentMethodConfig
): InstallmentMethodConfig {
  const source = asRecord(raw);
  const providersRaw = asRecord(source.providers);
  const providers: InstallmentMethodConfig["providers"] = {};

  const providerEntries =
    Object.keys(providersRaw).length > 0
      ? Object.entries(providersRaw)
      : Object.entries(fallback?.providers ?? {});

  for (const [id, providerValue] of providerEntries) {
    const provider = asRecord(providerValue);
    const fallbackProvider = fallback?.providers?.[id];
    providers[id] = {
      isEnabled: readBoolean(
        provider,
        ["isEnabled"],
        fallbackProvider?.isEnabled ?? false
      ),
      title: readString(provider, ["title"], fallbackProvider?.title ?? id),
    };
  }

  const priority = readStringArray(
    source,
    ["priority"],
    fallback?.priority ?? Object.keys(providers)
  );

  return {
    isEnabled: readBoolean(source, ["isEnabled"], fallback?.isEnabled ?? false),
    title: readString(source, ["title"], fallback?.title ?? "پرداخت اقساطی"),
    description: readString(
      source,
      ["description"],
      fallback?.description ?? ""
    ),
    defaultProvider: readString(
      source,
      ["defaultProvider"],
      fallback?.defaultProvider ?? priority[0] ?? "snapppay"
    ),
    priority,
    providers,
  };
}

export function normalizePaymentMethodsForm(
  methods: unknown,
  previous?: PaymentMethodsFormState
): PaymentMethodsFormState {
  const source = asRecord(methods);

  return {
    BANK_PORTAL: normalizeBankPortal(source.BANK_PORTAL, previous?.BANK_PORTAL),
    CARD_TO_CARD: normalizeCardToCard(
      source.CARD_TO_CARD,
      previous?.CARD_TO_CARD
    ),
    INSTALLMENT: normalizeInstallment(
      source.INSTALLMENT,
      previous?.INSTALLMENT
    ),
  };
}

export function createEmptyPaymentMethodsForm(): PaymentMethodsFormState {
  return normalizePaymentMethodsForm({});
}
