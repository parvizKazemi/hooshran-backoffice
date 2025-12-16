import { ApiError, apiGet, apiPatch } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ServiceReview,
  ServiceReviewsPaginatedResponse,
  ServiceReviewsQueryParams,
  UpdateServiceReviewInput,
} from "../types";

// Build query string from params
const buildQueryString = (params: ServiceReviewsQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.take !== undefined)
    searchParams.append("take", params.take.toString());
  if (params.q) searchParams.append("q", params.q);
  if (params.order) searchParams.append("order", params.order);

  return searchParams.toString();
};

// Fetch service reviews from API
export const useServiceReviews = (params: ServiceReviewsQueryParams = {}) => {
  const queryString = buildQueryString(params);
  const endpoint = `/service-reviews${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["service-reviews", params],
    queryFn: async (): Promise<ServiceReviewsPaginatedResponse> => {
      try {
        const response =
          await apiGet<ServiceReviewsPaginatedResponse>(endpoint);
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

// Get service review by UUID
export const useServiceReview = (uuid: string) => {
  return useQuery({
    queryKey: ["service-review", uuid],
    queryFn: async (): Promise<ServiceReview> => {
      try {
        const response = await apiGet<ServiceReview>(
          `/service-reviews/${uuid}`
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!uuid,
  });
};

// Update service review
export const useUpdateServiceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateServiceReviewInput
    ): Promise<ServiceReview> => {
      try {
        if (!data.uuid) {
          throw new ApiError("UUID بررسی الزامی است");
        }
        // Extract uuid from data and exclude it from body
        const { uuid, ...updatePayload } = data;
        // Only send fields that are defined (remove undefined values)
        const cleanPayload: Record<string, unknown> = {};
        if (updatePayload.rating !== undefined) {
          cleanPayload.rating = updatePayload.rating;
        }
        if (updatePayload.comment !== undefined) {
          cleanPayload.comment = updatePayload.comment;
        }
        if (updatePayload.reviewMetadata !== undefined) {
          cleanPayload.reviewMetadata = updatePayload.reviewMetadata;
        }
        const review = await apiPatch<ServiceReview>(
          `/service-reviews/${uuid}`,
          cleanPayload
        );
        return review;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["service-review"] });
      toast.success("بررسی با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی بررسی");
      }
    },
  });
};
