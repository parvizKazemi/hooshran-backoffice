import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateNotificationInput,
  Notification,
  NotificationsQueryParams,
  PaginatedResponse,
} from "../types";
import { apiGet, apiPost, ApiError } from "@/services/api";

// Build query string from params
const buildQueryString = (params: NotificationsQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.append("page", params.page.toString());
  }
  if (params.take !== undefined) {
    searchParams.append("take", params.take.toString());
  }
  if (params.type) {
    searchParams.append("type", params.type);
  }

  return searchParams.toString();
};

// Fetch notifications from API
export const useNotifications = (params: NotificationsQueryParams = {}) => {
  const queryString = buildQueryString(params);
  const endpoint = `/admin/notification${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async (): Promise<PaginatedResponse<Notification>> => {
      try {
        const response =
          await apiGet<PaginatedResponse<Notification>>(endpoint);
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Create notification
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateNotificationInput
    ): Promise<Notification> => {
      try {
        const response = await apiPost<Notification>(
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
