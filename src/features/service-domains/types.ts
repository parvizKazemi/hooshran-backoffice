/**
 * Types for Service Domains configuration
 */

export interface AllowedDomain {
  uuid: string;
  domain: string;
  type: "AD" | "SRU";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAllowedDomainInput {
  domain: string;
  type: "AD" | "SRU";
}

export interface UpdateAllowedDomainInput {
  domain?: string;
  type?: "AD" | "SRU";
  isActive?: boolean;
}

export interface AllowedDomainsQueryParams {
  type?: "AD" | "SRU";
}

export interface ServiceDomainsFormData {
  domain1: string;
  domain2?: string;
  domain3?: string;
}
