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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconDeviceMobile,
  IconInfoCircle,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";
import { SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ProviderRow } from "./components/provider-row";
import { TemplatesDialog } from "./components/templates-dialog";
import {
  useResetSmsConfig,
  useSmsConfig,
  useUpdateSmsConfig,
} from "./hooks/use-sms-config";
import type { SmsProviderConfigItem } from "./types";

function moveProvider(
  providers: SmsProviderConfigItem[],
  index: number,
  direction: -1 | 1
): SmsProviderConfigItem[] {
  const target = index + direction;
  if (target < 0 || target >= providers.length) {
    return providers;
  }

  const current = providers[index];
  const swapWith = providers[target];
  if (!current || !swapWith) {
    return providers;
  }

  const next = [...providers];
  next[index] = swapWith;
  next[target] = current;
  return next;
}

export default function SmsConfigSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useSmsConfig();
  const updateConfig = useUpdateSmsConfig();
  const resetConfig = useResetSmsConfig();

  const [providers, setProviders] = useState<SmsProviderConfigItem[]>([]);
  const [source, setSource] = useState<string>("");
  const [editingProvider, setEditingProvider] =
    useState<SmsProviderConfigItem | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    if (!data) return;
    setProviders(structuredClone(data.providers));
    setSource(data.source);
  }, [data]);

  const handleMove = (index: number, direction: -1 | 1) => {
    setProviders((prev) => moveProvider(prev, index, direction));
  };

  const handleToggle = (index: number, isActive: boolean) => {
    setProviders((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isActive } : item))
    );
  };

  const handleSaveTemplates = (updated: SmsProviderConfigItem) => {
    setProviders((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    toast.success(t("smsConfig.toasts.templatesUpdated"));
  };

  const handleSave = async () => {
    await updateConfig.mutateAsync({ providers });
  };

  const handleReset = async () => {
    const result = await resetConfig.mutateAsync();
    setProviders(structuredClone(result.providers));
    setSource(result.source);
    setIsResetOpen(false);
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="mb-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("smsConfig.header.title")}</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            {t("smsConfig.header.description")}
          </p>
        </div>
        {source && (
          <Badge variant="outline" className="shrink-0 self-start text-xs">
            {t("smsConfig.sourceLabel")}: {t(`smsConfig.sources.${source}`)}
          </Badge>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <IconDeviceMobile className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("smsConfig.card.title")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t("smsConfig.card.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="bg-muted/40 text-muted-foreground flex gap-3 rounded-xl border p-4 text-xs leading-relaxed">
            <IconInfoCircle className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <strong className="text-foreground mb-1 block">
                {t("smsConfig.info.title")}
              </strong>
              {t("smsConfig.info.description")}
            </div>
          </div>

          <div className="space-y-3">
            {providers.map((provider, index) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                priority={index + 1}
                isFirst={index === 0}
                isLast={index === providers.length - 1}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                onToggleActive={(isActive) => handleToggle(index, isActive)}
                onOpenTemplates={() => {
                  setEditingProvider(provider);
                  setIsTemplatesOpen(true);
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={resetConfig.isPending || updateConfig.isPending}
            onClick={() => setIsResetOpen(true)}
          >
            {resetConfig.isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconRefresh className="size-4" />
            )}
            {t("smsConfig.actions.reset")}
          </Button>
          <Button
            type="button"
            className="gap-2"
            disabled={updateConfig.isPending || resetConfig.isPending}
            onClick={handleSave}
          >
            {updateConfig.isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            {t("smsConfig.actions.save")}
          </Button>
        </CardContent>
      </Card>

      <TemplatesDialog
        open={isTemplatesOpen}
        provider={editingProvider}
        onOpenChange={(open) => {
          setIsTemplatesOpen(open);
          if (!open) setEditingProvider(null);
        }}
        onSave={handleSaveTemplates}
      />

      <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("smsConfig.resetDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("smsConfig.resetDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("smsConfig.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              {t("smsConfig.actions.confirmReset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
