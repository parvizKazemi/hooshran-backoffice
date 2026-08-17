import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconArrowDownLeft,
  IconReceipt,
  IconSettings,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AFFILIATE_DEFAULT_RULES } from "./constants";
import { AffiliateCommissionsTable } from "./components/affiliate-commissions-table";
import { AffiliatePartnersTable } from "./components/affiliate-partners-table";
import { AffiliatePayoutsTable } from "./components/affiliate-payouts-table";
import { AffiliateRulesForm } from "./components/affiliate-rules-form";
import { AffiliateStatsCards } from "./components/affiliate-stats-cards";
import { ApprovePayoutDialog } from "./components/approve-payout-dialog";
import { RejectPayoutDialog } from "./components/reject-payout-dialog";
import {
  useAffiliateAdminDashboard,
  useApproveAffiliatePayout,
  useRejectAffiliatePayout,
  useSaveAffiliateProgramRules,
  useToggleAffiliatePartnerStatus,
} from "./hooks/use-affiliate-admin";
import type { AffiliatePayoutRequest, AffiliateProgramRules } from "./types";

export default function Affiliate() {
  const { t } = useTranslation("common");
  const dashboardQuery = useAffiliateAdminDashboard();
  const approveMutation = useApproveAffiliatePayout();
  const rejectMutation = useRejectAffiliatePayout();
  const togglePartnerMutation = useToggleAffiliatePartnerStatus();
  const saveRulesMutation = useSaveAffiliateProgramRules();

  const [activeTab, setActiveTab] = useState("payouts");
  const [approveTarget, setApproveTarget] =
    useState<AffiliatePayoutRequest | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<AffiliatePayoutRequest | null>(null);

  const data = dashboardQuery.data;
  const isLoading = dashboardQuery.isLoading;
  const rules: AffiliateProgramRules = data?.rules ?? AFFILIATE_DEFAULT_RULES;

  const handleApprove = (payaTrackingCode: string) => {
    if (!approveTarget) return;
    approveMutation.mutate(
      { payoutId: approveTarget.id, payaTrackingCode },
      { onSuccess: () => setApproveTarget(null) }
    );
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    rejectMutation.mutate(
      { payoutId: rejectTarget.id, reason },
      { onSuccess: () => setRejectTarget(null) }
    );
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {t("affiliate.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("affiliate.description")}
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start rounded-xl border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
        >
          <span className="me-2 inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
          {t("affiliate.antiFraudActive")}
        </Badge>
      </div>

      <div className="bg-card flex items-center gap-2 rounded-2xl border px-3 py-2">
        <IconShieldCheck className="text-primary size-4 shrink-0" />
        <div className="min-w-0 text-start">
          <h2 className="text-xs font-bold">{t("affiliate.headerTitle")}</h2>
          <p className="text-muted-foreground truncate text-[11px]">
            {t("affiliate.headerDescription")}
          </p>
        </div>
      </div>

      <AffiliateStatsCards stats={data?.stats} isLoading={isLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="bg-muted/40 h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl p-2">
          <TabsTrigger
            value="payouts"
            className="rounded-xl px-4 py-2.5 text-xs font-bold"
          >
            <IconArrowDownLeft className="size-4" />
            {t("affiliate.tabs.payouts")}
            {(data?.stats.pendingPayoutCount ?? 0) > 0 ? (
              <Badge className="ms-1 rounded-full bg-amber-500 px-1.5 py-0 text-[10px] font-bold text-slate-950">
                {data?.stats.pendingPayoutCount.toLocaleString("fa-IR")}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="partners"
            className="rounded-xl px-4 py-2.5 text-xs font-bold"
          >
            <IconUsers className="size-4" />
            {t("affiliate.tabs.partners")}
          </TabsTrigger>
          <TabsTrigger
            value="commissions"
            className="rounded-xl px-4 py-2.5 text-xs font-bold"
          >
            <IconReceipt className="size-4" />
            {t("affiliate.tabs.commissions")}
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-xl px-4 py-2.5 text-xs font-bold"
          >
            <IconSettings className="size-4" />
            {t("affiliate.tabs.rules")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payouts">
          <AffiliatePayoutsTable
            payouts={data?.payouts ?? []}
            isLoading={isLoading}
            onApprove={setApproveTarget}
            onReject={setRejectTarget}
          />
        </TabsContent>

        <TabsContent value="partners">
          <AffiliatePartnersTable
            partners={data?.partners ?? []}
            isLoading={isLoading}
            isToggling={togglePartnerMutation.isPending}
            togglingPartnerId={
              togglePartnerMutation.variables?.partnerId ?? null
            }
            onToggleStatus={(partner) =>
              togglePartnerMutation.mutate({ partnerId: partner.id })
            }
          />
        </TabsContent>

        <TabsContent value="commissions">
          <AffiliateCommissionsTable
            commissions={data?.commissions ?? []}
            rules={rules}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="rules">
          <AffiliateRulesForm
            rules={rules}
            isSaving={saveRulesMutation.isPending}
            onSave={(nextRules) => saveRulesMutation.mutate(nextRules)}
          />
        </TabsContent>
      </Tabs>

      <ApprovePayoutDialog
        payout={approveTarget}
        open={Boolean(approveTarget)}
        isSubmitting={approveMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
        onConfirm={handleApprove}
      />

      <RejectPayoutDialog
        open={Boolean(rejectTarget)}
        isSubmitting={rejectMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        onConfirm={handleReject}
      />
    </div>
  );
}
