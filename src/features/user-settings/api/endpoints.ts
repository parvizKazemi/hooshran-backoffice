export const USER_SETTINGS_ENDPOINTS = {
  getAll: "/admin/user-settings",
  updateFreezeStart: "/admin/user-settings/freeze/start",
  updateFreezeEnd: "/admin/user-settings/freeze/end",
  updatePurchasePayment: "/admin/user-settings/purchase-payment",
  updateRegistration: "/admin/user-settings/registration",
} as const;
