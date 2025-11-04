import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Media, MediaQueryParams, PaginatedResponse } from "../types";
import { ApiError } from "@/services/api";
import { mockMedia } from "../mock-data";

export const useMedia = (params: MediaQueryParams = {}) => {
  return useQuery({
    queryKey: ["media", params],
    queryFn: async (): Promise<PaginatedResponse<Media>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockMedia];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (media) =>
              media.key.toLowerCase().includes(query) ||
              media.bucket.toLowerCase().includes(query) ||
              media.extension.toLowerCase().includes(query)
          );
        }
        if (params.type && params.type !== "all") {
          filtered = filtered.filter((media) => media.type === params.type);
        }
        const page = params.page || 1;
        const take = params.take || 10;
        const start = (page - 1) * take;
        const end = start + take;
        return {
          data: filtered.slice(start, end),
          total: filtered.length,
          page,
          take,
          totalPages: Math.ceil(filtered.length / take),
        };
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

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Implement API call
      void id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("فایل با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف فایل");
      }
    },
  });
};
