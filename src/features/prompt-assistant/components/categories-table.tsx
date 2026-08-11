import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  IconEdit,
  IconSearch,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PROMPT_STATUS } from "../constants";
import type { PromptCategory } from "../types";

type CategoriesTableProps = {
  items: PromptCategory[];
  isLoading?: boolean;
  togglingUuid?: string | null;
  onEdit: (category: PromptCategory) => void;
  onEditValues: (category: PromptCategory) => void;
  onDelete: (category: PromptCategory) => void;
  onToggleStatus: (category: PromptCategory, active: boolean) => void;
};

export function CategoriesTable({
  items,
  isLoading = false,
  togglingUuid = null,
  onEdit,
  onEditValues,
  onDelete,
  onToggleStatus,
}: CategoriesTableProps) {
  const { t } = useTranslation("common");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.systemKey ?? "").toLowerCase().includes(query)
    );
  }, [items, search]);

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="bg-muted/20 flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold">
            <IconSparkles className="text-primary size-5" />
            {t("promptAssistant.categories.title")}
          </h3>
          <p className="text-muted-foreground mt-1 text-[11px]">
            {t("promptAssistant.categories.description")}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <IconSearch className="text-muted-foreground absolute top-2.5 right-3 size-4" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("promptAssistant.categories.searchPlaceholder")}
            className="pr-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">
                {t("promptAssistant.table.row")}
              </TableHead>
              <TableHead>{t("promptAssistant.table.title")}</TableHead>
              <TableHead>{t("promptAssistant.table.systemKey")}</TableHead>
              <TableHead className="text-center">
                {t("promptAssistant.table.options")}
              </TableHead>
              <TableHead className="text-center">
                {t("promptAssistant.table.status")}
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

            {!isLoading && filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  {t("promptAssistant.categories.empty")}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? filteredItems.map((category, index) => {
                  const isActive = category.status === PROMPT_STATUS.ACTIVE;
                  return (
                    <TableRow key={category.uuid}>
                      <TableCell className="text-center">
                        <span className="bg-muted text-muted-foreground inline-flex size-7 items-center justify-center rounded-lg text-xs font-bold">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary border-primary/20 flex size-8 items-center justify-center rounded-lg border">
                            <IconSparkles className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {category.title}
                            </p>
                            {category.icon ? (
                              <p className="text-muted-foreground font-mono text-[10px]">
                                {category.icon}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-muted-foreground font-mono text-xs"
                          dir="ltr"
                        >
                          {category.systemKey || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-primary/10 text-primary border-primary/20 inline-flex rounded-full border px-3 py-1 text-xs font-bold">
                          {t("promptAssistant.table.optionsCount", {
                            count: category.promptsCount ?? 0,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2">
                          <Switch
                            dir="ltr"
                            checked={isActive}
                            disabled={togglingUuid === category.uuid}
                            onCheckedChange={(checked) =>
                              onToggleStatus(category, checked)
                            }
                          />
                          <span
                            className={cn(
                              "rounded-lg px-2 py-0.5 text-[10px] font-black",
                              isActive
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                            )}
                          >
                            {isActive
                              ? t("promptAssistant.status.active")
                              : t("promptAssistant.status.inactive")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onEditValues(category)}
                          >
                            <IconEdit className="size-3.5" />
                            {t("promptAssistant.actions.editValues")}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(category)}
                          >
                            <IconEdit className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => onDelete(category)}
                          >
                            <IconTrash className="size-4" />
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
