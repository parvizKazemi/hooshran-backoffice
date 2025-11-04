import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreatePackageInput,
  UpdatePackageInput,
  Package,
  PackagesQueryParams,
  PaginatedResponse,
} from "../types";
import { ApiError } from "@/services/api";
import { mockPackages } from "../mock-data";

export const usePackages = (params: PackagesQueryParams = {}) => {
  return useQuery({
    queryKey: ["packages", params],
    queryFn: async (): Promise<PaginatedResponse<Package>> => {
      try {
        // TODO: Replace with actual API call
        let filtered = [...mockPackages];
        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter((pkg) =>
            pkg.id.toLowerCase().includes(query)
          );
        }
        if (params.type && params.type !== "all") {
          filtered = filtered.filter((pkg) => pkg.type === params.type);
        }
        if (params.is_active !== undefined) {
          filtered = filtered.filter(
            (pkg) => pkg.is_active === params.is_active
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

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePackageInput): Promise<Package> => {
      // TODO: Implement API call
      const newPackage: Package = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newPackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("پکیج با موفقیت ایجاد شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در ایجاد پکیج");
      }
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePackageInput): Promise<Package> => {
      // TODO: Implement API call
      const updatedPackage: Package = {
        ...data,
        updatedAt: new Date().toISOString(),
      } as Package;
      return updatedPackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("پکیج با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی پکیج");
      }
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Implement API call
      void id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("پکیج با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف پکیج");
      }
    },
  });
};
