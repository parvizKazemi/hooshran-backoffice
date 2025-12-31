import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ServiceRequest } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ServiceRequestDetailProps = {
  request: ServiceRequest;
};

export const ServiceRequestDetail = memo(function ServiceRequestDetail({
  request,
}: ServiceRequestDetailProps) {
  const { t } = useTranslation("common");

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    PENDING: "outline",
    PROCESSING: "secondary",
    SUCCESS: "default",
    FAILED: "destructive",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("serviceRequests.detail.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.user")}:
              </span>
              <p className="font-medium">{request.user?.phoneNumber || "-"}</p>
              {request.user?.referralCode && (
                <p className="text-muted-foreground text-sm">
                  {t("serviceRequests.detail.referralCode")}:{" "}
                  {request.user.referralCode}
                </p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.service")}:
              </span>
              <p className="font-medium">{request.apiService?.name || "-"}</p>
              {request.apiService?.description && (
                <p className="text-muted-foreground text-sm">
                  {request.apiService.description}
                </p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.status")}:
              </span>
              <div className="mt-1">
                <Badge variant={statusVariants[request.status] || "outline"}>
                  {t(
                    `serviceRequests.statuses.${request.status.toLowerCase()}`
                  )}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.cost")}:
              </span>
              <p className="font-medium">
                {request.creditCost || 0} {t("serviceRequests.credit")}
              </p>
              {request.paidWithGems && (
                <p className="text-muted-foreground text-sm">
                  {t("serviceRequests.detail.paidWithGems")}: {request.gemsUsed}
                </p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.taskId")}:
              </span>
              <p className="font-mono text-sm">{request.taskId}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.uuid")}:
              </span>
              <p className="font-mono text-sm">{request.uuid}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {request.parameters && Object.keys(request.parameters).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("serviceRequests.detail.inputParams")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className="bg-muted overflow-auto rounded-md p-4 text-left text-sm"
              dir="ltr"
            >
              {JSON.stringify(request.parameters, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {request.responseData && (
        <Card>
          <CardHeader>
            <CardTitle>{t("serviceRequests.detail.output")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className="bg-muted overflow-auto rounded-md p-4 text-left text-sm"
              dir="ltr"
            >
              {JSON.stringify(request.responseData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("serviceRequests.detail.timestamps")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground text-sm">
              {t("serviceRequests.detail.createdAt")}:
            </span>
            <p>{new Date(request.createdAt).toLocaleString("fa-IR")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
