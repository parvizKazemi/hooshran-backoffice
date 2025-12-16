import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PaymentGatewaysList } from "./components/payment-gateways-list";
import { mockPaymentGateways, PaymentGateway } from "./types";

export default function PaymentGateways() {
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
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("paymentGateways.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("paymentGateways.description")}
        </p>
      </div>
      <PaymentGatewaysList data={gateways} onToggle={handleToggle} />
    </div>
  );
}
