import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/services/api";
import {
  fetchMonitoringErrorByUuid,
  fetchMonitoringErrors,
} from "../api/service";
import {
  MONITORING_CHART_QUERY_KEY,
  MONITORING_CHART_TAKE,
  MONITORING_DEFAULT_TAKE,
  MONITORING_DETAIL_QUERY_KEY,
  MONITORING_QUERY_KEY,
} from "../constants";
import type {
  MonitoringErrorsQueryParams,
  MonitoringErrorsResponse,
} from "../types";

const EMPTY_RESPONSE: MonitoringErrorsResponse = {
  data: [],
  meta: {
    page: 1,
    take: MONITORING_DEFAULT_TAKE,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
};

export function useMonitoringErrors(params: MonitoringErrorsQueryParams = {}) {
  return useQuery({
    queryKey: [MONITORING_QUERY_KEY, params],
    queryFn: async (): Promise<MonitoringErrorsResponse> => {
      try {
        return await fetchMonitoringErrors(params);
      } catch (error) {
        if (error instanceof ApiError) toast.error(error.message);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useMonitoringChartData(
  params: Omit<MonitoringErrorsQueryParams, "page" | "take">
) {
  return useQuery({
    queryKey: [MONITORING_CHART_QUERY_KEY, params],
    queryFn: async (): Promise<MonitoringErrorsResponse> => {
      try {
        return await fetchMonitoringErrors({
          ...params,
          page: 1,
          take: MONITORING_CHART_TAKE,
          order: params.order || "DESC",
        });
      } catch (error) {
        if (error instanceof ApiError) toast.error(error.message);
        return EMPTY_RESPONSE;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useMonitoringErrorDetail(uuid: string | null) {
  return useQuery({
    queryKey: [MONITORING_DETAIL_QUERY_KEY, uuid],
    queryFn: async () => {
      if (!uuid) return null;
      try {
        return await fetchMonitoringErrorByUuid(uuid);
      } catch (error) {
        if (error instanceof ApiError) toast.error(error.message);
        throw error;
      }
    },
    enabled: !!uuid,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
