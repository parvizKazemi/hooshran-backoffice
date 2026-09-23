import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { IconPencil } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { usePatchTextChatModel } from "../hooks/use-text-chat-models";
import type { TextChatModel } from "../types";

type TextChatModelsTableProps = {
  models: TextChatModel[];
  isLoading?: boolean;
  onEdit: (model: TextChatModel) => void;
};

export function TextChatModelsTable({
  models,
  isLoading,
  onEdit,
}: TextChatModelsTableProps) {
  const { t, i18n } = useTranslation("common");
  const patchModel = usePatchTextChatModel();

  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || !Number.isFinite(value))
      return t("textChatModels.notSet");
    return new Intl.NumberFormat(i18n.language === "fa" ? "fa-IR" : "en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">
              {t("textChatModels.columns.name")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.code")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.priceRatio")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.outputToken")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.inputToken")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.maxToken")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.status")}
            </TableHead>
            <TableHead className="text-center">
              {t("textChatModels.columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!isLoading && models.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground h-24 text-center"
              >
                {t("textChatModels.empty")}
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading
            ? models.map((model) => {
                const isRowPending =
                  patchModel.isPending &&
                  patchModel.variables?.code === model.code;
                return (
                  <TableRow key={model.code}>
                    <TableCell className="text-center font-medium">
                      {model.name || model.code}
                    </TableCell>
                    <TableCell
                      dir="ltr"
                      className="text-muted-foreground text-center font-mono text-xs"
                    >
                      {model.code}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(model.priceRatio)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(model.outputToken)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(model.inputToken)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(model.maxToken)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          dir="ltr"
                          checked={model.isActive}
                          disabled={isRowPending}
                          aria-label={model.name}
                          onCheckedChange={(checked) => {
                            void patchModel.mutateAsync({
                              code: model.code,
                              payload: { isActive: checked },
                              toastKey: checked ? "activated" : "deactivated",
                            });
                          }}
                        />
                        <Badge
                          variant={model.isActive ? "default" : "secondary"}
                        >
                          {model.isActive
                            ? t("textChatModels.active")
                            : t("textChatModels.inactive")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(model)}
                      >
                        <IconPencil className="size-4" />
                        {t("textChatModels.edit")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
