export const PAYMENT_METHODS_QUERY_KEY = ["payment-methods-config"] as const;

export const PAYMENT_METHODS_ENDPOINTS = {
  config: "/admin/payment-methods/config",
} as const;

export const BANK_PORTAL_PROVIDER_LABEL_KEYS = {
  zarinpal: "paymentMethods.providers.zarinpal",
  zibal: "paymentMethods.providers.zibal",
} as const;

export const INSTALLMENT_PROVIDER_LABEL_KEYS = {
  snapppay: "paymentMethods.providers.snapppay",
} as const;
