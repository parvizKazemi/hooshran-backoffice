import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePackages } from "@/features/packages/hooks/use-packages";
import { cn } from "@/lib/utils";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreatePlanCampaign,
  useUpdatePlanCampaign,
} from "../hooks/use-plan-campaigns";
import type {
  CampaignFormState,
  CampaignPlatformService,
  PlanCampaign,
  ServiceDisplayConfig,
} from "../types";
import {
  buildCampaignPayload,
  campaignToFormState,
  createIndividualDiscountRow,
  createInitialCampaignForm,
  normalizeTime24,
  selectedCampaignServiceUuids,
  syncDisplayServices,
  validateCampaignForm,
} from "../utils/campaign-form.helpers";
import { CampaignDisplaySettings } from "./campaign-display-settings";
import { CampaignGroupServiceSelector } from "./campaign-group-service-selector";
import { CampaignIndividualRows } from "./campaign-individual-rows";
import { CampaignTierDiscountGrid } from "./campaign-tier-discount-grid";

type CampaignFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: CampaignPlatformService[];
  campaign?: PlanCampaign | null;
};

export function CampaignFormDialog({
  open,
  onOpenChange,
  services,
  campaign = null,
}: CampaignFormDialogProps) {
  const { t } = useTranslation("common");
  const createCampaign = useCreatePlanCampaign();
  const updateCampaign = useUpdatePlanCampaign();
  const { data: packagesData, isLoading: isPackagesLoading } = usePackages({
    page: 1,
    limit: 1000,
  });
  const packages = useMemo(() => packagesData?.data ?? [], [packagesData]);
  const isEditMode = Boolean(campaign);
  const isSaving = createCampaign.isPending || updateCampaign.isPending;
  const formInitKey = useRef("");

  const [form, setForm] = useState<CampaignFormState>(
    createInitialCampaignForm
  );

  useEffect(() => {
    if (!open) {
      formInitKey.current = "";
      return;
    }
    if (isPackagesLoading) return;

    const key = campaign?.uuid ?? "new";
    if (formInitKey.current === key) return;
    formInitKey.current = key;

    setForm(
      campaign
        ? campaignToFormState(campaign, packages)
        : createInitialCampaignForm()
    );
  }, [campaign, isPackagesLoading, open, packages]);

  const setField = <K extends keyof CampaignFormState>(
    key: K,
    value: CampaignFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validationErrorKey = useMemo(
    () => validateCampaignForm(form, isPackagesLoading ? undefined : packages),
    [form, isPackagesLoading, packages]
  );

  const serviceLabelByUuid = useMemo(() => {
    const map: Record<string, string> = {};
    for (const discount of campaign?.serviceDiscounts ?? []) {
      const uuid = discount.serviceUuid ?? discount.apiServiceUuid;
      const name = discount.serviceName?.trim();
      if (uuid && name) {
        map[uuid] = name;
      }
    }
    return map;
  }, [campaign?.serviceDiscounts]);

  const serviceNameByUuid = useMemo(() => {
    const map: Record<string, string> = { ...serviceLabelByUuid };
    for (const service of services) {
      if (service.name.trim()) {
        map[service.uuid] = service.name;
      }
    }
    return map;
  }, [serviceLabelByUuid, services]);

  const selectedServiceUuids = useMemo(
    () => selectedCampaignServiceUuids(form),
    [form]
  );

  const selectedServiceKey = selectedServiceUuids.join("\u0000");

  useEffect(() => {
    setForm((prev) => {
      const next = syncDisplayServices(
        prev.displayServices,
        selectedCampaignServiceUuids(prev),
        serviceNameByUuid
      );
      if (next === prev.displayServices) return prev;
      return { ...prev, displayServices: next };
    });
  }, [selectedServiceKey, serviceNameByUuid]);

  const displayRows = useMemo(() => {
    const selected = new Set(selectedServiceUuids);
    return form.displayServices.filter((row) => selected.has(row.serviceUuid));
  }, [form.displayServices, selectedServiceUuids]);

  const updateDisplayRow = (
    serviceUuid: string,
    patch: Partial<ServiceDisplayConfig>
  ) => {
    setForm((prev) => ({
      ...prev,
      displayServices: prev.displayServices.map((row) =>
        row.serviceUuid === serviceUuid ? { ...row, ...patch } : row
      ),
    }));
  };

  const removeDisplayRow = (serviceUuid: string) => {
    updateDisplayRow(serviceUuid, {
      removedFromDisplay: true,
      showOnPlanCard: false,
      showOnPlanComparison: false,
      showInBanner: false,
      priority: null,
    });
  };

  const restoreDisplayRows = () => {
    setForm((prev) => {
      const selected = new Set(selectedCampaignServiceUuids(prev));
      let nextPriority = prev.displayServices.reduce(
        (max, row) => Math.max(max, row.priority ?? 0),
        0
      );

      return {
        ...prev,
        displayServices: prev.displayServices.map((row) => {
          if (!selected.has(row.serviceUuid) || !row.removedFromDisplay) {
            return row;
          }
          nextPriority += 1;
          return {
            ...row,
            removedFromDisplay: false,
            showOnPlanCard: true,
            showOnPlanComparison: true,
            showInBanner: true,
            priority: nextPriority,
          };
        }),
      };
    });
  };

  const handleSubmit = async () => {
    if (isPackagesLoading) return;

    const errorKey = validateCampaignForm(form, packages);
    if (errorKey) {
      return;
    }

    const payload = buildCampaignPayload(form, packages, campaign?.startsAt);

    if (isEditMode && campaign) {
      await updateCampaign.mutateAsync({ uuid: campaign.uuid, payload });
    } else {
      await createCampaign.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto flex max-h-[95vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:max-w-5xl">
        <DialogHeader className="bg-muted/40 shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg font-bold">
            {isEditMode
              ? t("planCampaigns.form.editTitle")
              : t("planCampaigns.form.createTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="campaign-title">
                {t("planCampaigns.form.title")} *
              </Label>
              <Input
                id="campaign-title"
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder={t("planCampaigns.form.titlePlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-name">
                {t("planCampaigns.form.internalName")}
              </Label>
              <Input
                id="campaign-name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder={t("planCampaigns.form.internalNamePlaceholder")}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-priority">
                {t("planCampaigns.form.priority")}
              </Label>
              <Input
                id="campaign-priority"
                type="number"
                min={0}
                value={form.priority}
                onChange={(event) =>
                  setField("priority", Number(event.target.value) || 0)
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="campaign-banner-teaser">
                {t("planCampaigns.form.bannerTeaser")} *
              </Label>
              <Textarea
                id="campaign-banner-teaser"
                value={form.bannerTeaser}
                onChange={(event) =>
                  setField("bannerTeaser", event.target.value)
                }
                placeholder={t("planCampaigns.form.bannerTeaserPlaceholder")}
                className="min-h-20 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="campaign-description">
                {t("planCampaigns.form.description")}
              </Label>
              <Textarea
                id="campaign-description"
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                className="min-h-16 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-muted/60 relative flex w-full rounded-xl p-1">
            {(["group", "individual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setField("allocationMode", mode);
                  if (
                    mode === "individual" &&
                    form.individualRows.length === 0
                  ) {
                    setField("individualRows", [createIndividualDiscountRow()]);
                  }
                }}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-bold transition-all",
                  form.allocationMode === mode
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {t(`planCampaigns.form.mode.${mode}`)}
              </button>
            ))}
          </div>

          {form.allocationMode === "group" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("planCampaigns.form.groupServices")} *</Label>
                <CampaignGroupServiceSelector
                  services={services}
                  selectedUuids={form.groupServiceUuids}
                  labelByUuid={serviceLabelByUuid}
                  onChange={(uuids) => setField("groupServiceUuids", uuids)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t("planCampaigns.form.tierAssignment")} *</Label>
                  <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-[10px]">
                    {t("planCampaigns.form.minOneTier")}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t("planCampaigns.form.planTargetHint")}
                </p>
                <CampaignTierDiscountGrid
                  tiers={form.groupTiers}
                  packages={packages}
                  packagesLoading={isPackagesLoading}
                  disabled={isPackagesLoading}
                  onChange={(tiers) => setField("groupTiers", tiers)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("planCampaigns.form.planTargetHint")}
              </p>
              <CampaignIndividualRows
                rows={form.individualRows}
                services={services}
                packages={packages}
                packagesLoading={isPackagesLoading}
                labelByUuid={serviceLabelByUuid}
                onAddRow={() =>
                  setField("individualRows", [
                    ...form.individualRows,
                    createIndividualDiscountRow(),
                  ])
                }
                onChange={(rows) => setField("individualRows", rows)}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-bold">
                {t("planCampaigns.form.campaignEndSettings")}
              </Label>
              <Switch
                dir="ltr"
                checked={form.hasCampaignEnd}
                onCheckedChange={(checked) =>
                  setField("hasCampaignEnd", checked)
                }
              />
            </div>
            {form.hasCampaignEnd ? (
              <div className="bg-muted/30 grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">
                    {t("planCampaigns.form.endDate")} *
                  </Label>
                  <PersianDateInput
                    value={form.endDate}
                    onChange={(value) => setField("endDate", value ?? "")}
                    placeholder={t("planCampaigns.form.endDatePlaceholder")}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">
                    {t("planCampaigns.form.endTime")}
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="23:59"
                    maxLength={5}
                    value={form.endTime}
                    onChange={(event) => {
                      const next = event.target.value.replace(/[^\d:]/g, "");
                      setField("endTime", next.slice(0, 5));
                    }}
                    onBlur={() =>
                      setField("endTime", normalizeTime24(form.endTime))
                    }
                    className="rounded-lg text-center font-mono tracking-widest"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                {t("planCampaigns.form.noEndHint")}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>{t("planCampaigns.form.expirationType")} *</Label>
            <div className="grid grid-cols-1 gap-3">
              {(["subscription_bound", "campaign_bound"] as const).map(
                (type) => (
                  <label
                    key={type}
                    className={cn(
                      "hover:border-primary/40 bg-card flex cursor-pointer flex-col rounded-xl border p-4 transition-colors",
                      form.expirationType === type &&
                        "border-primary bg-primary/10 dark:bg-primary/15"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="expirationType"
                        checked={form.expirationType === type}
                        onChange={() => setField("expirationType", type)}
                        className="mt-1"
                      />
                      <div>
                        <span className="block text-sm font-bold">
                          {t(`planCampaigns.form.expiration.${type}.title`)}
                        </span>
                        <span className="text-muted-foreground mt-1.5 block text-xs leading-relaxed">
                          {t(
                            `planCampaigns.form.expiration.${type}.description`
                          )}
                        </span>
                      </div>
                    </div>
                  </label>
                )
              )}
            </div>
          </div>

          <CampaignDisplaySettings
            rows={displayRows}
            showAsBanner={form.showAsBanner}
            onChangeRow={updateDisplayRow}
            onRemoveFromDisplay={removeDisplayRow}
            onRestoreAll={restoreDisplayRows}
            onShowAsBannerChange={(checked) =>
              setField("showAsBanner", checked)
            }
          />

          {validationErrorKey ? (
            <p className="text-destructive text-sm">
              {t(`planCampaigns.errors.${validationErrorKey}`)}
            </p>
          ) : null}
        </div>

        <DialogFooter className="bg-muted/40 shrink-0 border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("planCampaigns.form.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isPackagesLoading}
          >
            {isSaving ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconCheck className="size-4" />
            )}
            {t("planCampaigns.form.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
