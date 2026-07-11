export const SMS_CONFIG_ENDPOINTS = {
  config: "/admin/sms/config",
  reset: "/admin/sms/config/reset",
  /** Future backend: POST create custom SMS provider */
  createProvider: "/admin/sms/providers",
} as const;
