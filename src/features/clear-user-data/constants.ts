import type {
  PurgeOptionId,
  PurgeOptionsState,
  RemoveUserDataQuery,
} from "./types";

export const DEFAULT_PURGE_OPTIONS: PurgeOptionsState = {
  subscriptions: false,
  prompts: false,
  coupons: false,
  notifications: false,
  hardPurge: false,
};

export const SELECTABLE_PURGE_OPTIONS: Exclude<PurgeOptionId, "hardPurge">[] = [
  "subscriptions",
  "prompts",
  "coupons",
  "notifications",
];

export const PURGE_OPTION_ORDER: PurgeOptionId[] = [
  "subscriptions",
  "prompts",
  "coupons",
  "notifications",
  "hardPurge",
];

export function toRemoveUserDataQuery(
  options: PurgeOptionsState
): RemoveUserDataQuery {
  if (options.hardPurge) {
    return { deleteUser: true };
  }

  const query: RemoveUserDataQuery = {};

  if (options.subscriptions) query.deleteCreditsAndPayments = true;
  if (options.prompts) query.deleteRequests = true;
  if (options.coupons) query.deleteDiscounts = true;
  if (options.notifications) query.deleteNotifications = true;

  return query;
}

export function hasSelectedPurgeOption(options: PurgeOptionsState): boolean {
  return PURGE_OPTION_ORDER.some((id) => options[id]);
}
