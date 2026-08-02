/**
 * Admin auth API paths — change here when backend routes are finalized.
 */
export const AUTH_ENDPOINTS = {
  sendOtp: "/admin/auth/sendOtp",
  resendOtp: "/admin/auth/resend-otp",
  login: "/admin/auth/login",
  /** POST { phone, password } → AuthData (same shape as OTP login) */
  loginWithPassword: "/admin/auth/login-with-password",
} as const;
