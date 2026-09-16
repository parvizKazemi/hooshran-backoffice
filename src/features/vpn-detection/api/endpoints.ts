export const VPN_DETECTION_CONFIG_ENDPOINTS = {
  /** Admin: read/update VPN detection toggle */
  config: "/admin/vpn-detection/config",
  /** Front: public read-only config */
  publicConfig: "/system-config/vpn-detection",
} as const;
