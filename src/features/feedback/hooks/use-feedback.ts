import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addFeedbackAdminNote,
  createFeedbackPageConfig,
  deleteFeedbackAdminNote,
  deleteFeedbackPageConfig,
  getFeedbackAnalytics,
  getFeedbackByUuid,
  getFeedbackConfig,
  getFeedbackPageConfigs,
  getFeedbackRules,
  getFeedbacks,
  saveFeedbackRules,
  updateFeedbackConfig,
  updateFeedbackPageConfig,
  updateFeedbackStatus,
} from "../api/feedback-api";
import type {
  AdminFeedbackQuery,
  CreateFeedbackPageConfigPayload,
  FeedbackRulesConfig,
  FeedbackStatus,
  UpdateFeedbackConfigPayload,
  UpdateFeedbackPageConfigPayload,
} from "../types";

export const FEEDBACK_QUERY_KEYS = {
  pageConfigs: ["feedback", "page-configs"] as const,
  rules: ["feedback", "rules"] as const,
  feedbacks: (query?: AdminFeedbackQuery) =>
    ["feedback", "list", query] as const,
  detail: (uuid: string) => ["feedback", "detail", uuid] as const,
  config: ["feedback", "config"] as const,
  analytics: ["feedback", "analytics"] as const,
};

export function useFeedbackPageConfigs() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.pageConfigs,
    queryFn: getFeedbackPageConfigs,
  });
}

export function useCreateFeedbackPageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFeedbackPageConfigPayload) =>
      createFeedbackPageConfig(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.pageConfigs,
      });
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.rules,
      });
      toast.success("قانون صفحه با موفقیت ایجاد شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در ایجاد قانون صفحه");
    },
  });
}

export function useUpdateFeedbackPageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: UpdateFeedbackPageConfigPayload;
    }) => updateFeedbackPageConfig(uuid, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.pageConfigs,
      });
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.rules,
      });
      toast.success("تنظیمات صفحه به‌روزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در ویرایش تنظیمات صفحه");
    },
  });
}

export function useDeleteFeedbackPageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => deleteFeedbackPageConfig(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.pageConfigs,
      });
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.rules,
      });
      toast.success("قانون صفحه حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در حذف قانون صفحه");
    },
  });
}

export function useFeedbackRules() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.rules,
    queryFn: getFeedbackRules,
  });
}

export function useSaveFeedbackRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rules: FeedbackRulesConfig) => saveFeedbackRules(rules),
    onSuccess: (saved) => {
      queryClient.setQueryData(FEEDBACK_QUERY_KEYS.rules, saved);
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.pageConfigs,
      });
      toast.success("تنظیمات قوانین بازخورد با موفقیت ذخیره شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در ذخیره قوانین بازخورد");
    },
  });
}

export function useFeedbacks(query: AdminFeedbackQuery = {}) {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.feedbacks(query),
    queryFn: () => getFeedbacks(query),
  });
}

export function useFeedbackDetail(uuid: string, enabled = true) {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.detail(uuid),
    queryFn: () => getFeedbackByUuid(uuid),
    enabled: Boolean(uuid && enabled),
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: FeedbackStatus }) =>
      updateFeedbackStatus(uuid, status),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["feedback", "list"] });
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.detail(variables.uuid),
      });
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.analytics,
      });
      toast.success("وضعیت بازخورد با موفقیت به‌روزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در تغییر وضعیت بازخورد");
    },
  });
}

export function useAddFeedbackNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, note }: { uuid: string; note: string }) =>
      addFeedbackAdminNote(uuid, note),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.detail(variables.uuid),
      });
      void queryClient.invalidateQueries({ queryKey: ["feedback", "list"] });
      toast.success("یادداشت با موفقیت اضافه شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در ثبت یادداشت");
    },
  });
}

export function useDeleteFeedbackNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, noteUuid }: { uuid: string; noteUuid: string }) =>
      deleteFeedbackAdminNote(uuid, noteUuid),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEYS.detail(variables.uuid),
      });
      void queryClient.invalidateQueries({ queryKey: ["feedback", "list"] });
      toast.success("یادداشت حذف شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در حذف یادداشت");
    },
  });
}

export function useFeedbackConfig() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.config,
    queryFn: getFeedbackConfig,
  });
}

export function useUpdateFeedbackConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFeedbackConfigPayload) =>
      updateFeedbackConfig(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(FEEDBACK_QUERY_KEYS.config, updated);
      toast.success("تنظیمات آستانه نمایش بازخورد به‌روزرسانی شد");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "خطا در به‌روزرسانی تنظیمات آستانه");
    },
  });
}

export function useFeedbackAnalytics() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEYS.analytics,
    queryFn: getFeedbackAnalytics,
  });
}
