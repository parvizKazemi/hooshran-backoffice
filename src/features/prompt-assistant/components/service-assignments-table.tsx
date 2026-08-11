import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconLayoutGrid, IconSettings } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { ServiceAssignmentRow } from "../types";

type ServiceAssignmentsTableProps = {
  items: ServiceAssignmentRow[];
  isLoading?: boolean;
  onConfigure: (row: ServiceAssignmentRow) => void;
};

export function ServiceAssignmentsTable({
  items,
  isLoading = false,
  onConfigure,
}: ServiceAssignmentsTableProps) {
  const { t } = useTranslation("common");

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="bg-muted/20 border-b p-4">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <IconLayoutGrid className="text-primary size-5" />
          {t("promptAssistant.services.title")}
        </h3>
        <p className="text-muted-foreground mt-1 text-[11px]">
          {t("promptAssistant.services.description")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">
                {t("promptAssistant.table.row")}
              </TableHead>
              <TableHead>{t("promptAssistant.services.serviceName")}</TableHead>
              <TableHead>{t("promptAssistant.services.serviceKey")}</TableHead>
              <TableHead>
                {t("promptAssistant.services.activeParams")}
              </TableHead>
              <TableHead className="text-center">
                {t("promptAssistant.services.activeCount")}
              </TableHead>
              <TableHead className="text-left">
                {t("promptAssistant.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  {t("promptAssistant.services.empty")}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? items.map((row, index) => {
                  const activeTitles = row.assignedCategories
                    .map((item) => item.categoryTitle)
                    .join("، ");

                  return (
                    <TableRow key={row.service.uuid}>
                      <TableCell className="text-center">
                        <span className="bg-muted text-muted-foreground inline-flex size-7 items-center justify-center rounded-lg text-xs font-bold">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {row.service.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-muted-foreground font-mono text-xs"
                          dir="ltr"
                        >
                          {row.service.slug || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {activeTitles ||
                          t("promptAssistant.services.noneActive")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-primary/10 text-primary border-primary/20 inline-flex rounded-full border px-3 py-1 text-xs font-bold">
                          {t("promptAssistant.services.activeBadge", {
                            count: row.assignedCategories.length,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onConfigure(row)}
                          >
                            <IconSettings className="size-3.5" />
                            {t("promptAssistant.actions.configure")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
