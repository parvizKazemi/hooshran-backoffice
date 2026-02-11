/**
 * Service Domains Feature
 *
 * Manages configuration of service request domains with fallback support.
 * Domains are tried in order, and if a 5xx error occurs, the next domain is used.
 */

export { ServiceDomainsButton } from "./components/ServiceDomainsButton";
export { ServiceDomainsDialog } from "./components/ServiceDomainsDialog";
export * from "./hooks/use-allowed-domains";
export * from "./types";
