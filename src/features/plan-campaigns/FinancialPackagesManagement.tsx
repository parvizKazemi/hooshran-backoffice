import { useTranslation } from "react-i18next";
import { PlanCampaignsTab } from "./components/plan-campaigns-tab";

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

      <PlanCampaignsTab />
    </div>
  );
}
