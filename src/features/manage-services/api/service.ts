import { apiGet, apiPatch, apiPost } from "@/services/api";
import { USE_MOCK_MANAGE_SERVICES } from "../constants";
import { listMockManageServices, saveMockManageServices } from "../mock-data";
import type { ManageService, ManageServicePayload } from "../types";
import { normalizeServicesResponse } from "../utils/service.helpers";
import { MANAGE_SERVICES_ENDPOINTS } from "./endpoints";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchManageServices(): Promise<ManageService[]> {
  if (USE_MOCK_MANAGE_SERVICES) {
    await delay();
    return listMockManageServices();
  }

  const response = await apiGet<ManageService[] | { data: ManageService[] }>(
    MANAGE_SERVICES_ENDPOINTS.list
  );
  return normalizeServicesResponse(response);
}

export async function saveManageServices(
  payload: ManageServicePayload[],
  options?: { useCreate?: boolean }
): Promise<ManageService[]> {
  if (USE_MOCK_MANAGE_SERVICES) {
    await delay();
    return saveMockManageServices(payload);
  }

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
