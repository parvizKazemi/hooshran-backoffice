import { apiGet, apiPatch, apiPost } from "@/services/api";
import type { ManageService, ManageServicePayload } from "../types";
import { normalizeServicesResponse } from "../utils/service.helpers";
import { MANAGE_SERVICES_ENDPOINTS } from "./endpoints";

export async function fetchManageServices(): Promise<ManageService[]> {
  const response = await apiGet<ManageService[] | { data: ManageService[] }>(
    MANAGE_SERVICES_ENDPOINTS.list
  );
  return normalizeServicesResponse(response);
}

export async function saveManageServices(
  payload: ManageServicePayload[],
  options?: { useCreate?: boolean }
): Promise<ManageService[]> {
  const useCreate = options?.useCreate ?? false;
  const response = useCreate
    ? await apiPost<ManageService[] | { data: ManageService[] }>(
        MANAGE_SERVICES_ENDPOINTS.create,
        payload
      )
    : await apiPatch<ManageService[] | { data: ManageService[] }>(
        MANAGE_SERVICES_ENDPOINTS.save,
        payload
      );

  return normalizeServicesResponse(response);
}
