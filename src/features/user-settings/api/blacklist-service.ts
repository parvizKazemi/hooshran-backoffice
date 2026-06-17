import { apiGet, apiPut } from "@/services/api";
import type { PaginatedResponse } from "@/features/users/types";
import type {
  BanUserPayload,
  BannedUser,
  BannedUsersQueryParams,
  BlacklistRecord,
  UpdateBanPayload,
} from "../types";

const buildBannedUsersQuery = (params: BannedUsersQueryParams = {}): string => {
  const searchParams = new URLSearchParams({
    isBanned: "true",
    take: String(params.take ?? 10),
    page: String(params.page ?? 1),
    sortBy: params.sortBy ?? "updatedAt",
    order: params.order ?? "DESC",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  return `/admin/users?${searchParams.toString()}`;
};

const mapBannedUsers = (users: BannedUser[]): BlacklistRecord[] =>
  users.map((user) => ({
    ...user,
    banningReason: user.banningReason ?? "",
  }));

export async function getBannedUsers(
  params: BannedUsersQueryParams = {}
): Promise<PaginatedResponse<BlacklistRecord>> {
  const response = await apiGet<PaginatedResponse<BannedUser>>(
    buildBannedUsersQuery(params)
  );

  return {
    ...response,
    data: mapBannedUsers(response.data),
  };
}

export async function findUserByPhone(
  phoneNumber: string
): Promise<BannedUser | null> {
  const trimmedPhone = phoneNumber.trim();
  const response = await apiGet<PaginatedResponse<BannedUser>>(
    `/admin/users?search=${encodeURIComponent(trimmedPhone)}&take=20`
  );

  return (
    response.data.find((user) => user.phoneNumber === trimmedPhone) ?? null
  );
}

export async function banUserByPhone(
  payload: BanUserPayload
): Promise<BlacklistRecord> {
  const existingUser = await findUserByPhone(payload.phoneNumber);

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const updatedUser = await apiPut<BannedUser>(
    `/admin/users/${existingUser.uuid}`,
    {
      isActive: false,
      banningReason: payload.banningReason.trim(),
    }
  );

  return {
    ...updatedUser,
    banningReason: updatedUser.banningReason ?? payload.banningReason.trim(),
  };
}

export async function updateBannedUser(
  payload: UpdateBanPayload
): Promise<BlacklistRecord> {
  const updatedUser = await apiPut<BannedUser>(`/admin/users/${payload.uuid}`, {
    banningReason: payload.banningReason.trim(),
  });

  return {
    ...updatedUser,
    banningReason: updatedUser.banningReason ?? payload.banningReason.trim(),
  };
}

export async function unbanUser(uuid: string): Promise<void> {
  await apiPut<BannedUser>(`/admin/users/${uuid}`, {
    isActive: true,
  });
}
