export type PurgeOptionId =
  | "subscriptions"
  | "prompts"
  | "coupons"
  | "notifications"
  | "hardPurge";

export type PurgeOptionsState = Record<PurgeOptionId, boolean>;

/** Matches backend `RemoveUserDataDto` query flags. */
export type RemoveUserDataQuery = {
  deleteCreditsAndPayments?: boolean;
  deleteRequests?: boolean;
  deleteDiscounts?: boolean;
  deleteNotifications?: boolean;
  deleteUser?: boolean;
};

export type ClearUserMutationInput = {
  phoneNumber: string;
  options: RemoveUserDataQuery;
};
