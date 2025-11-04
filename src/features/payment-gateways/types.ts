export interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  logo?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export const mockPaymentGateways: PaymentGateway[] = [
  {
    id: "zarinpal",
    name: "zarinpal",
    displayName: "زرین‌پال",
    description: "درگاه پرداخت زرین‌پال برای پرداخت‌های آنلاین",
    logo: "/images/gateway/zarinpal.png",
    isActive: true,
    config: {
      merchantId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      sandbox: false,
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "idpay",
    name: "idpay",
    displayName: "آیدی پی",
    description: "درگاه پرداخت آیدی پی با پشتیبانی از کارت‌های بانکی",
    isActive: false,
    logo: "https://idpay.ir/logo.png",
    config: {
      apiKey: "your-api-key",
      sandbox: true,
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "saman",
    name: "saman",
    displayName: "سامان",
    description: "درگاه پرداخت سامان - بانک سامان",
    logo: "/images/gateway/saman.png",
    isActive: true,
    config: {
      terminalId: "12345678",
      merchantId: "87654321",
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "mellat",
    name: "mellat",
    displayName: "ملت",
    description: "درگاه پرداخت بانک ملت",
    logo: "/images/gateway/mellat.png",
    isActive: false,
    config: {
      terminalId: "12345678",
      username: "your-username",
      password: "your-password",
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "parsian",
    name: "parsian",
    displayName: "پارسیان",
    description: "درگاه پرداخت بانک پارسیان",
    logo: "/images/gateway/parsian.png",
    isActive: false,
    config: {
      pin: "1234567890",
      merchantId: "12345678",
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "pasargad",
    name: "pasargad",
    displayName: "پاسارگاد",
    description: "درگاه پرداخت بانک پاسارگاد",
    logo: "/images/gateway/pasargad.jpg",
    isActive: false,
    config: {
      terminalCode: "12345678",
      merchantCode: "87654321",
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];
