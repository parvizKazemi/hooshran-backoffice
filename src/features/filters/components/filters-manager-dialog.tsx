import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  EMPTY_FILTERS,
  useAddMasterFilter,
  useDeleteMasterFilter,
  useMasterFilters,
  useRenameMasterFilter,
} from "../hooks/use-filters";
import { hasFilterName } from "../utils";

type FiltersManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FiltersManagerDialog({
  open,
  onOpenChange,
}: FiltersManagerDialogProps) {
  const { t } = useTranslation("common");
  const {
    data: filters = EMPTY_FILTERS,
    isLoading,
    isError,
  } = useMasterFilters(open);
  const addMutation = useAddMasterFilter();
  const renameMutation = useRenameMasterFilter();
  const deleteMutation = useDeleteMasterFilter();

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setDraft("");
    setSearch("");
    setEditingName(null);
    setEditingValue("");
    setPendingDelete(null);
  }, [open]);

  const visibleFilters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return filters;
    return filters.filter((item) => item.toLowerCase().includes(query));
  }, [filters, search]);

  const handleAdd = async () => {
    const next = draft.trim();
    if (!next) {
      toast.error(t("serviceFilters.validation.required"));
      return;
    }
    if (hasFilterName(filters, next)) {
      toast.error(t("serviceFilters.validation.duplicate"));
      return;
    }

    await addMutation.mutateAsync(next);
    setDraft("");
  };

  const handleRename = async () => {
    if (!editingName) return;
    const next = editingValue.trim();
    if (!next) {
      toast.error(t("serviceFilters.validation.required"));
      return;
    }

    await renameMutation.mutateAsync({
      currentName: editingName,
      nextName: next,
    });
    setEditingName(null);
    setEditingValue("");
  };

  const isBusy =
    addMutation.isPending ||
    renameMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{t("serviceFilters.title")}</DialogTitle>
            <DialogDescription>
              {t("serviceFilters.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 border-b px-6 py-4">
            <div className="flex gap-2">
              <Input
                value={draft}
                disabled={isBusy}
                className="font-mono text-xs"
                placeholder={t("serviceFilters.placeholder")}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAdd();
                  }
                }}
              />
              <Button
                type="button"
                disabled={isBusy}
                onClick={() => void handleAdd()}
              >
                {addMutation.isPending ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconPlus className="size-4" />
                )}
                {t("serviceFilters.add")}
              </Button>
            </div>
            {filters.length > 6 ? (
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("serviceFilters.searchPlaceholder")}
              />
            ) : null}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
                <IconLoader2 className="size-4 animate-spin" />
                {t("serviceFilters.loading")}
              </div>
            ) : null}

            {isError ? (
              <div className="text-destructive rounded-2xl border border-dashed py-10 text-center text-xs">
                {t("serviceFilters.loadFailed")}
              </div>
            ) : null}

            {!isLoading && !isError && visibleFilters.length === 0 ? (
              <div className="text-muted-foreground rounded-2xl border border-dashed py-10 text-center text-xs">
                {t("serviceFilters.empty")}
              </div>
            ) : null}

            {visibleFilters.map((filter) => {
              const isEditing = editingName === filter;

              return (
                <div
                  key={filter}
                  className="bg-muted/20 flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5"
                >
                  {isEditing ? (
                    <Input
                      autoFocus
                      dir="ltr"
                      value={editingValue}
                      disabled={isBusy}
                      className="h-8 font-mono text-xs"
                      onChange={(event) => setEditingValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleRename();
                        }
                        if (event.key === "Escape") {
                          setEditingName(null);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="truncate font-mono text-sm font-bold"
                      dir="ltr"
                    >
                      {filter}
                    </span>
                  )}

                  <div className="flex shrink-0 items-center gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          disabled={isBusy}
                          onClick={() => void handleRename()}
                        >
                          <IconCheck className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          disabled={isBusy}
                          onClick={() => setEditingName(null)}
                        >
                          <IconX className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          disabled={isBusy}
                          onClick={() => {
                            setEditingName(filter);
                            setEditingValue(filter);
                          }}
                        >
                          <IconPencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive size-8"
                          disabled={isBusy}
                          onClick={() => setPendingDelete(filter)}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("serviceFilters.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="border-destructive/30 sm:max-w-md">
          <AlertDialogHeader className="items-center text-center sm:text-center">
            <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto mb-2 flex size-14 items-center justify-center rounded-full border">
              <IconAlertTriangle className="size-7" />
            </div>
            <AlertDialogTitle>
              {t("serviceFilters.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center leading-relaxed">
              {t("serviceFilters.deleteDescription", {
                name: pendingDelete ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("serviceFilters.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(event) => {
                event.preventDefault();
                if (!pendingDelete) return;
                void deleteMutation.mutateAsync(pendingDelete).then(() => {
                  setPendingDelete(null);
                });
              }}
            >
              {deleteMutation.isPending ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : null}
              {t("serviceFilters.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
