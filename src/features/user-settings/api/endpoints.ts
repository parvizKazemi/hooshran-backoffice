export const USER_SETTINGS_ENDPOINTS = {
  getAll: "/admin/user-settings",
  updateFreezeStart: "/admin/user-settings/freeze/start",
  updateFreezeEnd: "/admin/user-settings/freeze/end",
  updatePurchasePayment: "/admin/payment-gate/config",
  updateRegistration: "/admin/user-settings/registration",
} as const;
