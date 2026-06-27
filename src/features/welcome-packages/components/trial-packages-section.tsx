import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPackage, IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePackages } from "@/features/packages/hooks/use-packages";
import type { Package } from "@/features/packages/types";
import { isTrialOrWelcomePackage } from "@/features/packages/utils/package-filters";

type TrialPackagesSectionProps = {
  enabled: boolean;
};

export function TrialPackagesSection({ enabled }: TrialPackagesSectionProps) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { data, isLoading } = usePackages({ page: 1, limit: 100 });

  const trialPackages = useMemo(
    () =>
      (data?.data ?? []).filter((pkg: Package) => isTrialOrWelcomePackage(pkg)),
    [data?.data]
  );

  if (!enabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <IconPackage className="size-4 text-violet-600" />
          {t("welcomePackages.trialPackages.listTitle")}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
          onClick={() => navigate("/packages?specialOffer=true")}
        >
          <IconPlus className="size-3.5" />
          {t("welcomePackages.trialPackages.addPackage")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : trialPackages.length === 0 ? (
        <div className="bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-4 text-center text-sm">
          {t("welcomePackages.trialPackages.empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {trialPackages.map((pkg) => (
            <div
              key={pkg.uuid}
              className="bg-muted/30 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{pkg.name}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t("welcomePackages.trialPackages.packageMeta", {
                    credits: pkg.creditAmount,
                    price: pkg.price.toLocaleString("fa-IR"),
                    days: pkg.durationDays ?? "-",
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {pkg.properties?.isWelcomePackage ? (
                  <Badge variant="secondary">
                    {t("welcomePackages.trialPackages.welcomePackageBadge")}
                  </Badge>
                ) : null}
                {pkg.properties?.isSpecialOffer ? (
                  <Badge variant="secondary">
                    {t("welcomePackages.trialPackages.specialOfferBadge")}
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/packages?specialOffer=true&edit=${pkg.uuid}`)
                  }
                >
                  {t("welcomePackages.trialPackages.editPackage")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-amber-200/70 bg-amber-50 p-2.5 text-[11px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        {t("welcomePackages.trialPackages.note")}
      </div>
    </div>
  );
}
