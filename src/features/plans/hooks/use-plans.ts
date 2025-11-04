import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreatePlanInput,
  UpdatePlanInput,
  Plan,
  PlansQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError } from "@/services/api";
import { mockPlans } from "../mock-data";

export const usePlans = (params: PlansQueryParams = {}) => {
  return useQuery({
    queryKey: ["plans", params],
    queryFn: async (): Promise<PaginatedResponse<Plan>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockPlans];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter((plan) =>
            plan.name.toLowerCase().includes(query)
          );
        }
        if (params.is_active !== undefined) {
          filtered = filtered.filter(
            (plan) => plan.is_active === params.is_active
          );
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

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePlanInput): Promise<Plan> => {
      // TODO: Implement API call
      const newPlan: Plan = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("پلن با موفقیت ایجاد شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ایجاد پلن");
      }
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePlanInput): Promise<Plan> => {
      // TODO: Implement API call
      const updatedPlan: Plan = {
        ...data,
        updatedAt: new Date().toISOString(),
      } as Plan;
      return updatedPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("پلن با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی پلن");
      }
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Implement API call
      void id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("پلن با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف پلن");
      }
    },
  });
};
