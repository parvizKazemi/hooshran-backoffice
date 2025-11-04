import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { IconCreditCard } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PaymentGateway } from "../types";

type PaymentGatewaysListProps = {
  data: PaymentGateway[];
  isLoading?: boolean;
  onToggle?: (gatewayId: string, isActive: boolean) => void;
};

export function PaymentGatewaysList({
  data,
  isLoading = false,
  onToggle,
}: PaymentGatewaysListProps) {
  const { t } = useTranslation("common");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (gateway: PaymentGateway) => {
    if (togglingId) return; // Prevent multiple toggles

    setTogglingId(gateway.id);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      onToggle?.(gateway.id, !gateway.isActive);
    } catch (error) {
      console.error("Error toggling gateway:", error);
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconCreditCard className="text-muted-foreground mb-4 size-12" />
          <p className="text-muted-foreground text-sm">
            {t("paymentGateways.noResults")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {data.map((gateway) => {
        const isToggling = togglingId === gateway.id;
        // const ToggleIcon = gateway.isActive ? IconToggleRight : IconToggleLeft;

        return (
          <Card
            key={gateway.id}
            className={cn(
              gateway.isActive ? "border-primary" : "",
              "w-full min-w-[380px] md:w-1/2 lg:w-1/3 xl:w-1/4"
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {gateway.logo ? (
                    <img
                      src={gateway.logo}
                      alt={gateway.displayName}
                      className="size-12 rounded-md bg-white object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="bg-muted flex size-12 items-center justify-center rounded-md">
                      <IconCreditCard className="text-muted-foreground size-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {gateway.displayName}
                      </CardTitle>
                      <Badge
                        variant={gateway.isActive ? "default" : "secondary"}
                      >
                        {gateway.isActive
                          ? t("paymentGateways.active")
                          : t("paymentGateways.inactive")}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {gateway.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-muted-foreground text-xs">
                      {gateway.isActive
                        ? t("paymentGateways.active")
                        : t("paymentGateways.inactive")}
                    </span>
                    <Switch
                      dir="ltr"
                      checked={gateway.isActive}
                      onCheckedChange={() => handleToggle(gateway)}
                      disabled={isToggling}
                      aria-label={
                        gateway.isActive
                          ? t("paymentGateways.toggleInactive", {
                              gateway: gateway.displayName,
                            })
                          : t("paymentGateways.toggleActive", {
                              gateway: gateway.displayName,
                            })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            {gateway.config && Object.keys(gateway.config).length > 0 && (
              <CardContent>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    {t("paymentGateways.settings")}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(gateway.config).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-background rounded-md px-2 py-1 text-xs"
                      >
                        <span className="text-muted-foreground">{key}:</span>{" "}
                        <span className="font-mono">
                          {typeof value === "string"
                            ? value.length > 20
                              ? `${value.substring(0, 20)}...`
                              : value
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
