import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "../../packages/types";
import { Badge } from "@/components/ui/badge";
import { IconStarFilled } from "@tabler/icons-react";

type PackageSelectorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: Package[];
  isLoading?: boolean;
  onSelect: (pkg: Package) => void;
};

export const PackageSelectorDialog = memo(function PackageSelectorDialog({
  open,
  onOpenChange,
  packages,
  isLoading = false,
  onSelect,
}: PackageSelectorDialogProps) {
  const { t } = useTranslation("common");

  // Calculate period label based on durationDays
  const getPeriodLabel = (durationDays: number | null | undefined): string => {
    if (!durationDays) return t("packages.types.permanent");
    if (durationDays === 30) return t("userCredits.form.periodMonthly");
    if (durationDays === 365 || durationDays === 360 || durationDays === 366)
      return t("userCredits.form.periodYearly");
    return `${durationDays} ${t("packages.days")}`;
  };

  // Get period type for sorting (0: permanent, 1: monthly, 2: yearly)
  const getPeriodType = (durationDays: number | null | undefined): number => {
    if (!durationDays) return 2; // permanent comes last
    if (durationDays === 30) return 0; // monthly comes first
    if (durationDays === 365 || durationDays === 360 || durationDays === 366)
      return 1; // yearly comes second
    return 3; // other durations come last
  };

  // Group and sort packages by period type (monthly - yearly - permanent)
  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      const typeA = getPeriodType(a.durationDays);
      const typeB = getPeriodType(b.durationDays);
      if (typeA !== typeB) return typeA - typeB;
      // If same type, sort by price ascending
      return a.price - b.price;
    });
  }, [packages]);

  const handlePackageSelect = (pkg: Package) => {
    onSelect(pkg);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("userCredits.form.selectPackage")}</DialogTitle>
          <DialogDescription>
            {t("userCredits.form.selectPackageDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sortedPackages.length === 0 ? (
            <div className="text-muted-foreground flex h-32 items-center justify-center">
              {t("packages.noResults")}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead className="text-center">
                      {t("packages.table.name")}
                    </TableHead>
                    <TableHead className="text-center">
                      {t("userCredits.form.period")}
                    </TableHead>
                    <TableHead className="text-center">
                      {t("packages.table.creditAmount")}
                    </TableHead>
                    <TableHead className="text-center">
                      {t("packages.table.price")}{" "}
                      <span className="text-muted-foreground text-[0.6rem]">
                        ({t("packages.rial")})
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPackages.map((pkg) => {
                    const isSpecialOffer = pkg.properties?.isSpecialOffer;
                    return (
                      <TableRow
                        key={pkg.uuid}
                        className="hover:bg-muted/50 cursor-pointer text-xs"
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        <TableCell className="mr-2 flex items-center gap-1 font-medium">
                          {pkg.name?.split(" | ")[0] || pkg.name}
                          {isSpecialOffer && (
                            <IconStarFilled className="size-3 text-amber-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span>
                            <Badge
                              variant={
                                getPeriodLabel(pkg.durationDays) ===
                                t("userCredits.form.periodMonthly")
                                  ? "secondary"
                                  : getPeriodLabel(pkg.durationDays) ===
                                      t("userCredits.form.periodYearly")
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {getPeriodLabel(pkg.durationDays)}
                            </Badge>
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {pkg.creditAmount} {t("packages.credit")}
                        </TableCell>
                        <TableCell className="text-center">
                          {pkg.price.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
