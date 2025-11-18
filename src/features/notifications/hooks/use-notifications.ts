import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AdminNotification,
  CreateNotificationInput,
  NotificationStats,
  NotificationsQueryParams,
  PaginatedResponse,
  UpdateNotificationInput,
} from "../types";

// Build query string from params
const buildQueryString = (params: NotificationsQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params.take !== undefined) {
    searchParams.append("take", params.take.toString());
  }
  if (params.order) {
    searchParams.append("order", params.order);
  }
  if (params.search) {
    searchParams.append("search", params.search);
  }
  if (params.type) {
    searchParams.append("type", params.type);
  }
  if (params.templateType) {
    searchParams.append("templateType", params.templateType);
  }
  if (params.isPopup !== undefined) {
    searchParams.append("isPopup", params.isPopup.toString());
  }
  if (params.dateFrom) {
    searchParams.append("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    searchParams.append("dateTo", params.dateTo);
  }
  if (params.sortBy) {
    searchParams.append("sortBy", params.sortBy);
  }

  return searchParams.toString();
};

// Fetch notifications from API
export const useNotifications = (params: NotificationsQueryParams = {}) => {
  const queryString = buildQueryString(params);
  const endpoint = `/admin/notification${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async (): Promise<PaginatedResponse<AdminNotification>> => {
      try {
        const response =
          await apiGet<PaginatedResponse<AdminNotification>>(endpoint);
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

// Fetch single notification
export const useNotification = (notificationId: string) => {
  return useQuery({
    queryKey: ["notification", notificationId],
    queryFn: async (): Promise<AdminNotification> => {
      try {
        const response = await apiGet<AdminNotification>(
          `/admin/notification/${notificationId}`
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!notificationId,
  });
};

// Create notification
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateNotificationInput
    ): Promise<AdminNotification> => {
      try {
        const response = await apiPost<AdminNotification>(
          "/admin/notification",
          data
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("نوتیفیکیشن با موفقیت ایجاد شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ایجاد نوتیفیکیشن");
      }
    },
  });
};

// Update notification
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notificationId,
      data,
    }: {
      notificationId: string;
      data: UpdateNotificationInput;
    }): Promise<AdminNotification> => {
      try {
        const response = await apiPut<AdminNotification>(
          `/admin/notification/${notificationId}`,
          data
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification", variables.notificationId],
      });
      toast.success("نوتیفیکیشن با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی نوتیفیکیشن");
      }
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string): Promise<void> => {
      try {
        await apiDelete(`/admin/notification/${notificationId}`);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("نوتیفیکیشن با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف نوتیفیکیشن");
      }
    },
  });
};

// Send notification
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      notificationId: string;
      userIds?: string[];
    }): Promise<void> => {
      try {
        await apiPost("/admin/notification/send", data);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("نوتیفیکیشن با موفقیت ارسال شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ارسال نوتیفیکیشن");
      }
    },
  });
};

// Update recipients
export const useUpdateRecipients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      notificationId: string;
      userIds: string[];
    }): Promise<void> => {
      try {
        await apiPut("/admin/notification/recipients", data);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification", variables.notificationId],
      });
      toast.success("گیرندگان با موفقیت به‌روزرسانی شدند");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی گیرندگان");
      }
    },
  });
};

// Get notification stats
export const useNotificationStats = (notificationId: string) => {
  return useQuery({
    queryKey: ["notification-stats", notificationId],
    queryFn: async (): Promise<NotificationStats> => {
      try {
        const response = await apiGet<NotificationStats>(
          `/admin/notification/stats/${notificationId}`
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!notificationId,
  });
};
