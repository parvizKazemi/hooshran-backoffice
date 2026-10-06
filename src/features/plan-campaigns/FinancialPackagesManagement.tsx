import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanCampaignsTab } from "./components/plan-campaigns-tab";
import { ModelDiscountsTab } from "./model-discounts/components/model-discounts-tab";

export default function FinancialPackagesManagement() {
  const { t } = useTranslation("common");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {t("planCampaigns.pageTitle")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("planCampaigns.pageDescription")}
        </p>
      </div>

      <Tabs defaultValue="plan-campaigns" className="gap-4">
        <TabsList className="bg-muted/40 h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl p-2">
          <TabsTrigger value="plan-campaigns">
            {t("planCampaigns.tabs.planCampaigns")}
          </TabsTrigger>
          <TabsTrigger value="model-discounts">
            {t("planCampaigns.tabs.modelDiscounts")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan-campaigns">
          <PlanCampaignsTab />
        </TabsContent>

        <TabsContent value="model-discounts">
          <ModelDiscountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
