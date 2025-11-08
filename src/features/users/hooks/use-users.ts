import { ApiError, apiGet } from "@/services/api";
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
  if (params.role) searchParams.append("role", params.role);
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
    refetchOnWindowFocus: true,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput): Promise<User> => {
      // TODO: Implement API call when endpoint is available
      // const user = await apiPost<User>("/admin/users", data);
      // return user;

      // Temporary mock implementation
      const newUser: User = {
        ...data,
        uuid: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newUser;
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
      // TODO: Implement API call when endpoint is available
      // const user = await apiPut<User>(`/admin/users/${data.uuid}`, data);
      // return user;

      // Temporary mock implementation
      const updatedUser: User = {
        ...data,
        updatedAt: new Date().toISOString(),
      } as User;
      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      // TODO: Implement API call when endpoint is available
      // await apiDelete(`/admin/users/${uuid}`);

      // Temporary - just for now
      void uuid;
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
