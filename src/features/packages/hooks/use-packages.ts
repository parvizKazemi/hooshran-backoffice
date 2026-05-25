import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreatePackageInput,
  Package,
  PackagesQueryParams,
  PaginatedResponse,
  UpdatePackageInput,
} from "../types";

// Build query string from params
const buildQueryString = (params: PackagesQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.order) searchParams.append("order", params.order);
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.limit !== undefined)
    searchParams.append("limit", params.limit.toString());
  if (params.q) searchParams.append("q", params.q);
  if (params.type && params.type !== "all")
    searchParams.append("type", params.type);

  return searchParams.toString();
};

// Fetch packages from API
export const usePackages = (params: PackagesQueryParams = {}) => {
  const queryString = buildQueryString(params);
  const endpoint = `/admin/packages${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["packages", params],
    queryFn: async (): Promise<PaginatedResponse<Package>> => {
      try {
        // API returns a simple array, convert to PaginatedResponse
        const response = await apiGet<Package[]>(endpoint);

        // Apply client-side filtering if needed (for search, type, etc.)
        let filtered = [...response];

        if (params.q) {
          const query = params.q.toLowerCase();
          filtered = filtered.filter(
            (pkg) =>
              pkg.name.toLowerCase().includes(query) ||
              pkg.uuid.toLowerCase().includes(query)
          );
        }

        if (params.type && params.type !== "all") {
          filtered = filtered.filter((pkg) => pkg.type === params.type);
        }

        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 50;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedData = filtered.slice(start, end);

        return {
          data: paginatedData,
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        };
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

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePackageInput): Promise<Package> => {
      try {
        const pkg = await apiPost<Package>("/admin/packages", data);
        return pkg;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
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
      try {
        if (!data.uuid) {
          throw new ApiError("UUID پکیج الزامی است");
        }
        // Extract uuid from data and exclude it from body
        const { uuid, ...updatePayload } = data;

        // Build payload with all required fields
        // durationDays can be null for PERMANENT type
        const payload: {
          name: string;
          creditAmount: number;
          price: number;
          type: "PERMANENT" | "SUBSCRIPTION";
          durationDays?: number | null;
          properties: Package["properties"];
        } = {
          name: updatePayload.name ?? "",
          creditAmount: updatePayload.creditAmount ?? 0,
          price: updatePayload.price ?? 0,
          type: updatePayload.type ?? "PERMANENT",
          properties: updatePayload.properties
            ? {
                transferLimit: updatePayload.properties.transferLimit ?? 0,
                boughtLimit: updatePayload.properties.boughtLimit ?? 1,
                parallelRequestLimit:
                  updatePayload.properties.parallelRequestLimit ?? 2,
                toolboxAccess:
                  updatePayload.properties.toolboxAccess !== undefined
                    ? updatePayload.properties.toolboxAccess
                    : false,
                isSpecialOffer:
                  updatePayload.properties.isSpecialOffer !== undefined
                    ? updatePayload.properties.isSpecialOffer
                    : false,
              }
            : {
                transferLimit: 0,
                boughtLimit: 1,
                parallelRequestLimit: 1,
                toolboxAccess: false,
                isSpecialOffer: false,
              },
        };

        // Add durationDays if provided, or set to null if type is PERMANENT
        if (updatePayload.durationDays !== undefined) {
          payload.durationDays = updatePayload.durationDays;
        } else if (updatePayload.type === "PERMANENT") {
          payload.durationDays = null;
        }

        const pkg = await apiPatch<Package>(`/admin/packages/${uuid}`, payload);
        return pkg;
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
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
    mutationFn: async (uuid: string): Promise<void> => {
      try {
        await apiDelete<void>(`/admin/packages/${uuid}`);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
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
