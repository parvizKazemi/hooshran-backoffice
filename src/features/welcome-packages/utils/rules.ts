import {
  DEFAULT_SIGNUP_RULE_TYPE,
  DEFAULT_SIGNUP_RULE_VALUE,
  UTM_CAMPAIGN_TYPES,
  type UtmCampaignType,
} from "../constants";
import type {
  UtmCampaignFormRow,
  UtmContentRewardRule,
  WelcomePackagesFormState,
} from "../types";

export const isDefaultSignupRule = (rule: UtmContentRewardRule): boolean =>
  rule.type === DEFAULT_SIGNUP_RULE_TYPE &&
  rule.value === DEFAULT_SIGNUP_RULE_VALUE;

export const isUtmCampaignRule = (rule: UtmContentRewardRule): boolean =>
  UTM_CAMPAIGN_TYPES.includes(rule.type as UtmCampaignType);

export const createEmptyUtmCampaignRow = (): UtmCampaignFormRow => ({
  id: crypto.randomUUID(),
  type: "utm_campaign",
  value: "",
  credits: 0,
  selectedServiceUuids: [],
  allServicesSelected: true,
});

export const mapRulesToFormState = (
  rules: UtmContentRewardRule[]
): Pick<
  WelcomePackagesFormState,
  | "registrationGiftEnabled"
  | "registrationCredits"
  | "registrationExpiryDays"
  | "vipRestrictionEnabled"
  | "allowedServiceUuids"
  | "utmCampaigns"
> => {
  const defaultRule = rules.find(isDefaultSignupRule);
  const campaignRules = rules.filter(isUtmCampaignRule);
  const services = defaultRule?.services ?? [];

  return {
    registrationGiftEnabled: Boolean(defaultRule),
    registrationCredits: defaultRule?.credits ?? 15,
    registrationExpiryDays: defaultRule?.subscriptionExtensionDays ?? 7,
    vipRestrictionEnabled: services.length > 0,
    allowedServiceUuids: [...services],
    utmCampaigns: campaignRules.map((rule) => {
      const ruleServices = rule.services ?? [];
      const allServicesSelected = ruleServices.length === 0;

      return {
        id: crypto.randomUUID(),
        type: rule.type as UtmCampaignType,
        value: rule.value,
        credits: rule.credits ?? 0,
        selectedServiceUuids: allServicesSelected ? [] : [...ruleServices],
        allServicesSelected,
      };
    }),
  };
};

export const buildRulesFromFormState = (
  state: Pick<
    WelcomePackagesFormState,
    | "registrationGiftEnabled"
    | "registrationCredits"
    | "registrationExpiryDays"
    | "vipRestrictionEnabled"
    | "allowedServiceUuids"
    | "utmCampaignsSectionEnabled"
    | "utmCampaigns"
  >
): UtmContentRewardRule[] => {
  const rules: UtmContentRewardRule[] = [];

  if (state.registrationGiftEnabled) {
    rules.push({
      type: DEFAULT_SIGNUP_RULE_TYPE,
      value: DEFAULT_SIGNUP_RULE_VALUE,
      credits: state.registrationCredits,
      gems: 0,
      subscriptionExtensionDays: state.registrationExpiryDays,
      services: state.vipRestrictionEnabled ? state.allowedServiceUuids : [],
    });
  }

  if (state.utmCampaignsSectionEnabled) {
    state.utmCampaigns.forEach((campaign) => {
      const normalizedValue = campaign.value.trim();
      if (!normalizedValue) {
        return;
      }

      rules.push({
        type: campaign.type,
        value: normalizedValue,
        credits: campaign.credits,
        gems: 0,
        subscriptionExtensionDays: 0,
        services: campaign.allServicesSelected
          ? []
          : campaign.selectedServiceUuids,
      });
    });
  }

  return rules;
};
