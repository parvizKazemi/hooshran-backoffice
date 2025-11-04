import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PaymentGatewaysList } from "./components/payment-gateways-list";
import { mockPaymentGateways, PaymentGateway } from "./types";

function PaymentGatewaysContent() {
  const { t } = useTranslation("common");
  const [gateways, setGateways] =
    useState<PaymentGateway[]>(mockPaymentGateways);

  const handleToggle = (gatewayId: string, isActive: boolean) => {
    setGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId
          ? { ...gateway, isActive, updatedAt: new Date().toISOString() }
          : gateway
      )
    );

    const gateway = gateways.find((g) => g.id === gatewayId);
    toast.success(
      isActive
        ? t("paymentGateways.toast.activated", {
            gateway: gateway?.displayName,
          })
        : t("paymentGateways.toast.deactivated", {
            gateway: gateway?.displayName,
          })
    );
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold">
                    {t("paymentGateways.title")}
                  </h1>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {t("paymentGateways.description")}
                  </p>
                </div>
                <PaymentGatewaysList data={gateways} onToggle={handleToggle} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function PaymentGateways() {
  return <PaymentGatewaysContent />;
}
