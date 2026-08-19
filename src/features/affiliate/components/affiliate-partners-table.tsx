import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AffiliatePartner } from "../types";
import {
  filterAffiliatePartners,
  formatToman,
  isPartnerActive,
} from "../utils/affiliate.helpers";

type AffiliatePartnersTableProps = {
  partners: AffiliatePartner[];
  isLoading?: boolean;
  isToggling?: boolean;
  togglingPartnerId?: string | null;
  onToggleStatus: (partner: AffiliatePartner) => void;
};

export function AffiliatePartnersTable({
  partners,
  isLoading,
  isToggling,
  togglingPartnerId,
  onToggleStatus,
}: AffiliatePartnersTableProps) {
  const { t } = useTranslation("common");
  const [search, setSearch] = useState("");

  const filteredPartners = useMemo(
    () => filterAffiliatePartners(partners, search),
    [partners, search]
  );

  return (
    <div className="bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <IconUsers className="size-4 text-blue-500" />
            {t("affiliate.partners.title")}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {t("affiliate.partners.description")}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("affiliate.partners.searchPlaceholder")}
            className="h-10 rounded-xl pr-10 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 *:text-start">
              <TableHead className="text-xs font-bold">
                {t("affiliate.partners.table.name")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.partners.table.code")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.partners.table.buyers")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.partners.table.totalEarned")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.partners.table.availableBalance")}
              </TableHead>
              <TableHead className="text-xs font-bold">
                {t("affiliate.partners.table.status")}
              </TableHead>
              <TableHead className="text-center text-xs font-bold">
                {t("affiliate.partners.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPartners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {t("affiliate.partners.empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredPartners.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-bold">
                    {item.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {item.code}
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    {item.buyersCount.toLocaleString("fa-IR")}{" "}
                    {t("affiliate.stats.personUnit")}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {formatToman(item.totalEarned)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatToman(item.availableBalance)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isPartnerActive(item.status)
                          ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                          : "border-rose-500/30 bg-rose-500/10 text-[10px] text-rose-500"
                      }
                    >
                      {isPartnerActive(item.status)
                        ? t("affiliate.partners.status.active")
                        : t("affiliate.partners.status.suspended")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs"
                      disabled={isToggling && togglingPartnerId === item.id}
                      onClick={() => onToggleStatus(item)}
                    >
                      {isPartnerActive(item.status)
                        ? t("affiliate.partners.actions.suspend")
                        : t("affiliate.partners.actions.activate")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
