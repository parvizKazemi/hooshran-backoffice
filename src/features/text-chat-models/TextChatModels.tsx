import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextChatModelFormDialog } from "./components/text-chat-model-form-dialog";
import { TextChatModelsTable } from "./components/text-chat-models-table";
import { useTextChatModels } from "./hooks/use-text-chat-models";
import type { TextChatModel, TextChatModelStatusFilter } from "./types";
import { filterTextChatModels } from "./utils/text-chat-model-form";

export default function TextChatModels() {
  const { t } = useTranslation("common");
  const { data, isLoading, isError, refetch, isFetching } = useTextChatModels();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TextChatModelStatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TextChatModel | null>(null);

  const models = useMemo(
    () => filterTextChatModels(data ?? [], query, status),
    [data, query, status]
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (model: TextChatModel) => {
    setEditing(model);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("textChatModels.title")}</h1>
          <p className="text-muted-foreground mt-3 text-sm">{t("textChatModels.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <IconRefresh className="size-4" />
            {t("textChatModels.refresh")}
          </Button>
          <Button type="button" onClick={openCreate}>
            <IconPlus className="size-4" />
            {t("textChatModels.add")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("textChatModels.searchPlaceholder")}
          className="max-w-xs"
        />
        <StatusFilters value={status} onChange={setStatus} />
      </div>

      {isError ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 px-4 py-3">
          <p className="text-destructive text-sm">{t("textChatModels.loadError")}</p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            {t("textChatModels.retry")}
          </Button>
        </div>
      ) : (
        <TextChatModelsTable models={models} isLoading={isLoading} onEdit={openEdit} />
      )}

      <TextChatModelFormDialog
        open={dialogOpen}
        model={editing}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function StatusFilters({
  value,
  onChange,
}: {
  value: TextChatModelStatusFilter;
  onChange: (value: TextChatModelStatusFilter) => void;
}) {
  const { t } = useTranslation("common");
  const options: Array<{ id: TextChatModelStatusFilter; label: string }> = [
    { id: "all", label: t("textChatModels.filterAll") },
    { id: "active", label: t("textChatModels.filterActive") },
    { id: "inactive", label: t("textChatModels.filterInactive") },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl border p-1">
      {options.map((option) => (
        <Button
          key={option.id}
          type="button"
          size="sm"
          variant={value === option.id ? "default" : "ghost"}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
