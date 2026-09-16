import { apiGet, apiPatch } from "@/services/api";
import type {
  UpdateVpnDetectionConfigPayload,
  VpnDetectionConfig,
} from "../types";
import { VPN_DETECTION_CONFIG_ENDPOINTS } from "./endpoints";

export async function getVpnDetectionConfig(): Promise<VpnDetectionConfig> {
  return apiGet<VpnDetectionConfig>(VPN_DETECTION_CONFIG_ENDPOINTS.config);
}

export async function updateVpnDetectionConfig(
  payload: UpdateVpnDetectionConfigPayload
): Promise<VpnDetectionConfig> {
  return apiPatch<VpnDetectionConfig>(
    VPN_DETECTION_CONFIG_ENDPOINTS.config,
    payload
  );
}
