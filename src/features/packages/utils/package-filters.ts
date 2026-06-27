import type { Package } from "../types";

export const isTrialOrWelcomePackage = (pkg: Package): boolean =>
  pkg.properties?.isSpecialOffer === true ||
  pkg.properties?.isWelcomePackage === true;
