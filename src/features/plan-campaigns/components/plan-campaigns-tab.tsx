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
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CampaignFormDialog } from "./campaign-form-dialog";
import { CampaignsTable } from "./campaigns-table";
import {
  useCampaignPlatformServices,
  useDeletePlanCampaign,
  usePlanCampaigns,
} from "../hooks/use-plan-campaigns";
import type { PlanCampaign } from "../types";

export function PlanCampaignsTab() {
  const { t } = useTranslation("common");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PlanCampaign | null>(
    null
  );
  const [deletingCampaign, setDeletingCampaign] = useState<PlanCampaign | null>(
    null
  );

  const { data, isLoading } = usePlanCampaigns({ page: 1, limit: 200 });
  const { data: platformData, isLoading: isServicesLoading } =
    useCampaignPlatformServices();
  const deleteCampaign = useDeletePlanCampaign();

  const campaigns = data?.data ?? [];
  const services = platformData?.services ?? [];
  const serviceIdByUuid = useMemo(
    () => platformData?.serviceIdByUuid ?? new Map<string, number>(),
    [platformData?.serviceIdByUuid]
  );

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const handleEdit = (campaign: PlanCampaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;
    await deleteCampaign.mutateAsync(deletingCampaign.uuid);
    setDeletingCampaign(null);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border p-4 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">
              {t("planCampaigns.rulesTitle")}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t("planCampaigns.rulesDescription")}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="w-full rounded-xl shadow-md sm:w-auto"
            disabled={isServicesLoading}
          >
            <IconPlus className="size-4" />
            {t("planCampaigns.actions.create")}
          </Button>
        </div>

        <CampaignsTable
          campaigns={campaigns}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeletingCampaign}
        />
      </div>

      <CampaignFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        services={services}
        serviceIdByUuid={serviceIdByUuid}
        campaign={editingCampaign}
      />

      <AlertDialog
        open={Boolean(deletingCampaign)}
        onOpenChange={(open) => {
          if (!open) setDeletingCampaign(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("planCampaigns.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("planCampaigns.delete.description", {
                name: deletingCampaign?.title ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("planCampaigns.form.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("planCampaigns.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
