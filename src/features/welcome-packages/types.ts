import type { UtmCampaignType } from "./constants";

export type UtmContentRewardRule = {
  type: string;
  value: string;
  credits?: number;
  gems?: number;
  subscriptionExtensionDays?: number;
  services?: string[];
  validFrom?: string;
  validTo?: string;
};

export type UpdateUtmContentRewardRulesInput = {
  rules: UtmContentRewardRule[];
};

export type PlatformService = {
  uuid: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type UtmCampaignFormRow = {
  id: string;
  type: UtmCampaignType;
  value: string;
  credits: number;
  selectedServiceUuids: string[];
  allServicesSelected: boolean;
};

export type WelcomePackagesFormState = {
  registrationGiftEnabled: boolean;
  registrationCredits: number;
  registrationExpiryDays: number;
  vipRestrictionEnabled: boolean;
  allowedServiceUuids: string[];
  trialPackagesSectionEnabled: boolean;
  utmCampaignsSectionEnabled: boolean;
  utmCampaigns: UtmCampaignFormRow[];
};
