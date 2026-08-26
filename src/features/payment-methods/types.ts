export type BankPortalProviderId = "zarinpal" | "zibal" | (string & {});

export type InstallmentProviderId = "snapppay" | (string & {});

export type BankPortalProviderConfig = {
  isEnabled: boolean;
  title: string;
  merchantId?: string;
  merchant?: string;
  sandbox?: boolean;
};

export type BankPortalMethodConfig = {
  isEnabled: boolean;
  title: string;
  description: string;
  defaultProvider: string;
  priority: string[];
  providers: Record<string, BankPortalProviderConfig>;
};

export type CardToCardMethodConfig = {
  isEnabled: boolean;
  title: string;
  description: string;
  cardInfo: {
    bankName: string;
    cardNumber: string;
    cardHolder: string;
    iban: string;
  };
  notifier: {
    channel: string;
    recipient: string;
    providerPriority?: string[];
    appSecret?: string;
  };
};

export type InstallmentProviderConfig = {
  isEnabled: boolean;
  title: string;
};

export type InstallmentMethodConfig = {
  isEnabled: boolean;
  title: string;
  description: string;
  defaultProvider: string;
  priority: string[];
  providers: Record<string, InstallmentProviderConfig>;
};

export type PaymentMethodsConfig = {
  methods: {
    BANK_PORTAL: BankPortalMethodConfig;
    CARD_TO_CARD: CardToCardMethodConfig;
    INSTALLMENT: InstallmentMethodConfig;
  };
  updatedAt?: string;
  updatedByAdminId?: number;
};

export type UpdatePaymentMethodsConfigPayload = {
  methods: PaymentMethodsConfig["methods"];
};

export type PaymentMethodsFormState = PaymentMethodsConfig["methods"];
