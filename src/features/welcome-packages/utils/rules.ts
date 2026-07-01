import {
  LEGACY_SIGNUP_RULE_TYPE,
  LEGACY_SIGNUP_RULE_VALUE,
  NEW_USER_RULE_TYPE,
  NEW_USER_RULE_VALUE,
  UTM_CAMPAIGN_TYPES,
  type UtmCampaignType,
} from "../constants";
import type {
  UtmCampaignFormRow,
  UtmContentRewardRule,
  WelcomePackagesFormState,
} from "../types";

export const isNewUserSignupRule = (rule: UtmContentRewardRule): boolean =>
  (rule.type === NEW_USER_RULE_TYPE && rule.value === NEW_USER_RULE_VALUE) ||
  (rule.type === LEGACY_SIGNUP_RULE_TYPE &&
    rule.value === LEGACY_SIGNUP_RULE_VALUE);

export const isUtmCampaignRule = (rule: UtmContentRewardRule): boolean =>
  UTM_CAMPAIGN_TYPES.includes(rule.type as UtmCampaignType) &&
  !isNewUserSignupRule(rule);

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
  const newUserRule = rules.find(isNewUserSignupRule);
  const campaignRules = rules.filter(isUtmCampaignRule);
  const services = newUserRule?.services ?? [];

  return {
    registrationGiftEnabled: Boolean(newUserRule),
    registrationCredits: newUserRule?.credits ?? 15,
    registrationExpiryDays: newUserRule?.subscriptionExtensionDays ?? 7,
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

type NewUserGiftFormSlice = Pick<
  WelcomePackagesFormState,
  | "registrationGiftEnabled"
  | "registrationCredits"
  | "registrationExpiryDays"
  | "vipRestrictionEnabled"
  | "allowedServiceUuids"
>;

type UtmCampaignsFormSlice = Pick<
  WelcomePackagesFormState,
  "utmCampaignsSectionEnabled" | "utmCampaigns"
>;

export const buildNewUserRuleFromFormState = (
  state: NewUserGiftFormSlice
): UtmContentRewardRule | null => {
  if (!state.registrationGiftEnabled) {
    return null;
  }

  return {
    type: NEW_USER_RULE_TYPE,
    value: NEW_USER_RULE_VALUE,
    credits: state.registrationCredits,
    gems: 0,
    subscriptionExtensionDays: state.registrationExpiryDays,
    services: state.vipRestrictionEnabled ? state.allowedServiceUuids : [],
  };
};

export const buildUtmCampaignRulesFromFormState = (
  state: UtmCampaignsFormSlice
): UtmContentRewardRule[] => {
  if (!state.utmCampaignsSectionEnabled) {
    return [];
  }

  const rules: UtmContentRewardRule[] = [];

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

  return rules;
};

export const buildRulesPayloadForNewUserSave = (
  formState: NewUserGiftFormSlice,
  existingRules: UtmContentRewardRule[]
): UtmContentRewardRule[] => {
  const newUserRule = buildNewUserRuleFromFormState(formState);
  const campaignRules = existingRules.filter(isUtmCampaignRule);

  return [...(newUserRule ? [newUserRule] : []), ...campaignRules];
};

export const buildRulesPayloadForUtmSave = (
  formState: UtmCampaignsFormSlice,
  existingRules: UtmContentRewardRule[]
): UtmContentRewardRule[] => {
  const existingNewUserRule = existingRules.find(isNewUserSignupRule);
  const campaignRules = buildUtmCampaignRulesFromFormState(formState);

  return [
    ...(existingNewUserRule ? [existingNewUserRule] : []),
    ...campaignRules,
  ];
};

export const buildRulesFromFormState = (
  state: NewUserGiftFormSlice & UtmCampaignsFormSlice
): UtmContentRewardRule[] => {
  const newUserRule = buildNewUserRuleFromFormState(state);
  const campaignRules = buildUtmCampaignRulesFromFormState(state);

  return [...(newUserRule ? [newUserRule] : []), ...campaignRules];
};
