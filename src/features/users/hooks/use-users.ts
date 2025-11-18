import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  CreateUserInput,
  PaginatedResponse,
  UpdateUserInput,
  User,
  UsersQueryParams,
} from "../types";

// Build query string from params
const buildQueryString = (params: UsersQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.order) searchParams.append("order", params.order);
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.take !== undefined)
    searchParams.append("take", params.take.toString());
  if (params.q) searchParams.append("q", params.q);
  if (params.search) searchParams.append("search", params.search);
  if (params.role) searchParams.append("role", params.role);
  if (params.dateFrom) searchParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.append("dateTo", params.dateTo);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.phoneNumber)
    searchParams.append("phoneNumber", params.phoneNumber);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  return searchParams.toString();
};

// Fetch users from API
export const useUsers = (params: UsersQueryParams = {}) => {
  const queryString = buildQueryString(params);
  const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["users", params],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      try {
        const response = await apiGet<PaginatedResponse<User>>(endpoint);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    refetchOnMount: true,
  });
};

// Get user by ID
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<User> => {
      try {
        const response = await apiGet<User>(`/admin/users/${userId}`);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput): Promise<User> => {
      try {
        const user = await apiPost<User>("/admin/users", data);
        return user;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("کاربر با موفقیت ایجاد شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ایجاد کاربر");
      }
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserInput): Promise<User> => {
      try {
        if (!data.uuid) {
          throw new ApiError("UUID کاربر الزامی است");
        }
        // Extract uuid from data and exclude it from body
        const { uuid, ...updatePayload } = data;
        // Only send fields that are defined (remove undefined values)
        const cleanPayload: Record<string, unknown> = {};
        if (updatePayload.phoneNumber !== undefined) {
          cleanPayload.phoneNumber = updatePayload.phoneNumber;
        }
        if (updatePayload.role !== undefined) {
          cleanPayload.role = updatePayload.role;
        }
        if (updatePayload.isActive !== undefined) {
          cleanPayload.isActive = updatePayload.isActive;
        }
        if (updatePayload.registrationSource !== undefined) {
          cleanPayload.registrationSource = updatePayload.registrationSource;
        }
        const user = await apiPut<User>(`/admin/users/${uuid}`, cleanPayload);
        return user;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("کاربر با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی کاربر");
      }
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string): Promise<void> => {
      try {
        await apiDelete<void>(`/admin/users/${uuid}`);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("کاربر با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف کاربر");
      }
    },
  });
};

// Hook for managing selected users
export const useSelectedUsers = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = (userIds: string[]) => {
    setSelectedUsers(userIds);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  return {
    selectedUsers,
    toggleUser,
    selectAll,
    clearSelection,
  };
};
