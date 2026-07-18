import { apiDelete } from "@/services/api";
import type { RemoveUserDataQuery } from "../types";
import { CLEAR_USER_DATA_ENDPOINTS } from "./endpoints";

function buildQueryString(options: RemoveUserDataQuery): string {
  const params = new URLSearchParams();

  if (options.deleteCreditsAndPayments) {
    params.set("deleteCreditsAndPayments", "true");
  }
  if (options.deleteRequests) {
    params.set("deleteRequests", "true");
  }
  if (options.deleteDiscounts) {
    params.set("deleteDiscounts", "true");
  }
  if (options.deleteNotifications) {
    params.set("deleteNotifications", "true");
  }
  if (options.deleteUser) {
    params.set("deleteUser", "true");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function removeUserByPhoneNumber(
  phoneNumber: string,
  options: RemoveUserDataQuery
): Promise<void> {
  // const normalized = toE164IranPhone(phoneNumber);
  const normalized = phoneNumber;
  await apiDelete<void>(
    `${CLEAR_USER_DATA_ENDPOINTS.removeByPhone(normalized)}${buildQueryString(options)}`
  );
}
