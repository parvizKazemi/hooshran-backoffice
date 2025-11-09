import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateApiServiceInput,
  UpdateApiServiceInput,
  ApiService,
  ApiServiceDetail,
  ApiServicesQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError } from "@/services/api";
import { mockApiServices, mockApiServiceDetails } from "../mock-data";

// Fetch API services from API
export const useApiServices = (params: ApiServicesQueryParams = {}) => {
  // const queryString = buildQueryString(params);
  // const endpoint = `/admin/api-service${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["api-services", params],
    queryFn: async (): Promise<PaginatedResponse<ApiService>> => {
      try {
        // TODO: Replace with actual API call when endpoint is available
        // const response = await apiGet<PaginatedResponse<ApiService>>(endpoint);
        // return response;

        // Temporary mock implementation
        const filtered = mockApiServices.filter((service) => {
          if (params.q) {
            const query = params.q.toLowerCase();
            if (
              !service.name.toLowerCase().includes(query) &&
              !service.description?.toLowerCase().includes(query) &&
              !service.slug?.toLowerCase().includes(query)
            ) {
              return false;
            }
          }
          if (
            params.category_id &&
            service.category_id !== params.category_id
          ) {
            return false;
          }
          if (
            params.is_active !== undefined &&
            service.is_active !== params.is_active
          ) {
            return false;
          }
          return true;
        });

        const page = params.page || 1;
        const take = params.take || 10;
        const start = (page - 1) * take;
        const end = start + take;
        const paginated = filtered.slice(start, end);

        return {
          data: paginated,
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

// Fetch single API service detail
export const useApiService = (id: string) => {
  return useQuery({
    queryKey: ["api-service", id],
    queryFn: async (): Promise<ApiServiceDetail> => {
      try {
        // TODO: Replace with actual API call when endpoint is available
        // const response = await apiGet<ApiServiceDetail>(`/admin/api-service/${id}`);
        // return response;

        // Temporary mock implementation
        const service = mockApiServices.find((s) => s.id === id);
        if (!service) {
          throw new ApiError("سرویس یافت نشد", 404);
        }

        const detail = mockApiServiceDetails[id] || {
          ...service,
          parameters: [],
          credit_costs: [],
        };

        return detail;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Create API service
export const useCreateApiService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApiServiceInput): Promise<ApiService> => {
      // TODO: Implement API call when endpoint is available
      // const service = await apiPost<ApiService>("/admin/api-service", data);
      // return service;

      // Temporary mock implementation
      const newService: ApiService = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-services"] });
      toast.success("سرویس با موفقیت ایجاد شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ایجاد سرویس");
      }
    },
  });
};

// Update API service
export const useUpdateApiService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateApiServiceInput): Promise<ApiService> => {
      // TODO: Implement API call when endpoint is available
      // const service = await apiPut<ApiService>(`/admin/api-service/${data.id}`, data);
      // return service;

      // Temporary mock implementation
      const { id, ...updateData } = data;
      const updatedService: ApiService = {
        ...updateData,
        id,
        updatedAt: new Date().toISOString(),
      } as ApiService;
      return updatedService;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-services"] });
      queryClient.invalidateQueries({ queryKey: ["api-service", data.id] });
      toast.success("سرویس با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی سرویس");
      }
    },
  });
};

// Delete API service
export const useDeleteApiService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Implement API call when endpoint is available
      // await apiDelete(`/admin/api-service/${id}`);

      // Temporary - just for now
      void id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-services"] });
      toast.success("سرویس با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف سرویس");
      }
    },
  });
};
