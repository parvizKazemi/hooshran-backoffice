import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AllowedDomain,
  AllowedDomainsQueryParams,
  CreateAllowedDomainInput,
  UpdateAllowedDomainInput,
} from "../types";
import { ApiError, apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";

/**
 * Hook to fetch allowed domains
 */
export const useAllowedDomains = (params: AllowedDomainsQueryParams = {}) => {
  return useQuery({
    queryKey: ["allowed-domains", params],
    queryFn: async (): Promise<AllowedDomain[]> => {
      try {
        const queryString = params.type ? `?type=${params.type}` : "";
        const response = await apiGet<AllowedDomain[]>(
          `/admin/allowed-domains${queryString}`
        );
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

/**
 * Hook to fetch a single allowed domain by UUID
 */
export const useAllowedDomain = (uuid: string | null | undefined) => {
  return useQuery({
    queryKey: ["allowed-domains", uuid],
    queryFn: async (): Promise<AllowedDomain | null> => {
      if (!uuid) return null;
      try {
        const response = await apiGet<AllowedDomain>(
          `/admin/allowed-domains/${uuid}`
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
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to create an allowed domain
 */
export const useCreateAllowedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateAllowedDomainInput
    ): Promise<AllowedDomain> => {
      try {
        const response = await apiPost<AllowedDomain>(
          `/admin/allowed-domains`,
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
      queryClient.invalidateQueries({ queryKey: ["allowed-domains"] });
      toast.success("دامنه با موفقیت اضافه شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در اضافه کردن دامنه");
      }
    },
  });
};

/**
 * Hook to update an allowed domain
 */
export const useUpdateAllowedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uuid,
      data,
    }: {
      uuid: string;
      data: UpdateAllowedDomainInput;
    }): Promise<AllowedDomain> => {
      try {
        const response = await apiPatch<AllowedDomain>(
          `/admin/allowed-domains/${uuid}`,
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
      queryClient.invalidateQueries({ queryKey: ["allowed-domains"] });
      toast.success("دامنه با موفقیت به‌روزرسانی شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در به‌روزرسانی دامنه");
      }
    },
  });
};

/**
 * Hook to delete an allowed domain
 */
export const useDeleteAllowedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string): Promise<void> => {
      try {
        await apiDelete(`/admin/allowed-domains/${uuid}`);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-domains"] });
      toast.success("دامنه با موفقیت حذف شد");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("خطا در حذف دامنه");
      }
    },
  });
};
