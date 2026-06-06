export const USER_SETTINGS_ENDPOINTS = {
  getAll: "/admin/user-settings",
  getSubscriptionFreezeConfig: "/admin/subscription-freeze/config",
  updateSubscriptionFreezeConfig: "/admin/subscription-freeze/config",
  startSubscriptionFreeze: "/admin/subscription-freeze/start",
  getServiceRequestSendingConfig: "/admin/service-request-sending/config",
  updateServiceRequestSendingConfig: "/admin/service-request-sending/config",
  updatePurchasePayment: "/admin/payment-gate/config",
  updateRegistration: "/admin/user-settings/registration",
} as const;
