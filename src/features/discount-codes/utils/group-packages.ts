import type { Package } from "@/features/packages/types";
import type { DiscountCode, PackageSelectionState } from "../types";

export type PackageGroupKey =
  | "special-offer"
  | "welcome"
  | "permanent"
  | `subscription-${number}`;

export interface PackageGroup {
  key: PackageGroupKey;
  titleKey: string;
  titleParams?: Record<string, string | number>;
  packages: Package[];
}

const PRIORITY_SUBSCRIPTION_DURATIONS = [30, 360];

const sortByName = (packages: Package[]) =>
  [...packages].sort((a, b) => a.name.localeCompare(b.name, "fa"));

const sortSubscriptionDurations = (a: number, b: number) => {
  const aPriority = PRIORITY_SUBSCRIPTION_DURATIONS.indexOf(a);
  const bPriority = PRIORITY_SUBSCRIPTION_DURATIONS.indexOf(b);

  if (aPriority !== -1 || bPriority !== -1) {
    if (aPriority === -1) {
      return 1;
    }
    if (bPriority === -1) {
      return -1;
    }
    return aPriority - bPriority;
  }

  return a - b;
};

export function groupPackagesForDiscount(packages: Package[]): PackageGroup[] {
  const specialOffers: Package[] = [];
  const welcomePackages: Package[] = [];
  const permanentPackages: Package[] = [];
  const subscriptionByDuration = new Map<number, Package[]>();

  for (const pkg of packages) {
    if (pkg.properties?.isSpecialOffer) {
      specialOffers.push(pkg);
      continue;
    }

    if (pkg.properties?.isWelcomePackage) {
      welcomePackages.push(pkg);
      continue;
    }

    if (pkg.type === "PERMANENT") {
      permanentPackages.push(pkg);
      continue;
    }

    const duration = pkg.durationDays ?? 0;
    const bucket = subscriptionByDuration.get(duration) ?? [];
    bucket.push(pkg);
    subscriptionByDuration.set(duration, bucket);
  }

  const groups: PackageGroup[] = [];

  [...subscriptionByDuration.entries()]
    .sort(([a], [b]) => sortSubscriptionDurations(a, b))
    .forEach(([durationDays, groupPackages]) => {
      groups.push({
        key: `subscription-${durationDays}`,
        titleKey: "discountCodes.form.packages.groups.subscription",
        titleParams: { days: durationDays },
        packages: sortByName(groupPackages),
      });
    });

  if (specialOffers.length > 0) {
    groups.push({
      key: "special-offer",
      titleKey: "discountCodes.form.packages.groups.specialOffer",
      packages: sortByName(specialOffers),
    });
  }

  if (welcomePackages.length > 0) {
    groups.push({
      key: "welcome",
      titleKey: "discountCodes.form.packages.groups.welcome",
      packages: sortByName(welcomePackages),
    });
  }

  if (permanentPackages.length > 0) {
    groups.push({
      key: "permanent",
      titleKey: "discountCodes.form.packages.groups.permanent",
      packages: sortByName(permanentPackages),
    });
  }

  return groups;
}

export function extractPackageDisplayName(name: string): string {
  return name.split("|")[0]?.trim() || name;
}

export function buildPackageSelectionFromCode(
  code: DiscountCode
): PackageSelectionState {
  const selection: PackageSelectionState = {};

  for (const pkg of code.packages ?? []) {
    if (!pkg.packageUuid) {
      continue;
    }

    selection[pkg.packageUuid] = {
      selected: true,
      discountPercentage: pkg.discountPercentage,
    };
  }

  if (Object.keys(selection).length === 0) {
    return selection;
  }

  return selection;
}

export function buildSelectedPackagesPayload(
  packages: Package[],
  selection: PackageSelectionState
) {
  const packageByUuid = new Map(packages.map((pkg) => [pkg.uuid, pkg]));

  return Object.entries(selection)
    .filter(([, value]) => value.selected && value.discountPercentage >= 1)
    .map(([packageUuid, value]) => {
      if (!packageByUuid.has(packageUuid)) {
        return null;
      }

      return {
        packageUuid,
        discountPercentage: Math.round(value.discountPercentage),
      };
    })
    .filter(
      (item): item is { packageUuid: string; discountPercentage: number } =>
        item !== null
    );
}

export function toEndOfDayIso(dateValue: string): string {
  const date = new Date(`${dateValue}T23:59:59`);
  return date.toISOString();
}

export function buildPersonalDiscountCode(
  baseCode: string,
  phone: string,
  totalPhones: number
) {
  if (totalPhones === 1) {
    return baseCode;
  }

  return `${baseCode}${phone.slice(-4)}`;
}
