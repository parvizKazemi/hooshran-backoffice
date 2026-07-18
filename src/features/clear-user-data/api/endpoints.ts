export const CLEAR_USER_DATA_ENDPOINTS = {
  removeByPhone: (phoneNumber: string) =>
    `/users/by-phoneNumber/${phoneNumber}`,
} as const;
