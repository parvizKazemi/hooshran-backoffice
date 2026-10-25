import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchShowcaseData, saveShowcaseData } from "../api/showcase-api";
import type { ShowcaseData } from "../types";

export const SERVICE_SHOWCASE_QUERY_KEY = ["service-showcase"] as const;

export function useServiceShowcase() {
  return useQuery({
    queryKey: SERVICE_SHOWCASE_QUERY_KEY,
    queryFn: fetchShowcaseData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSaveServiceShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShowcaseData) => saveShowcaseData(data),
    onSuccess: (savedData) => {
      queryClient.setQueryData(SERVICE_SHOWCASE_QUERY_KEY, savedData);
      toast.success(
        "تمامی تنظیمات چیدمان، پین‌ها و وضعیت سرویس‌ها با موفقیت ذخیره شد."
      );
    },
    onError: (error) => {
      console.error("Error saving service showcase:", error);
      toast.error("خطا در ذخیره چیدمان و تنظیمات سرویس‌ها");
    },
  });
}
