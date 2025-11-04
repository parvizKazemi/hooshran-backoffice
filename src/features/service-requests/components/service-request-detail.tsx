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
              <p className="font-medium">{request.user_name || "-"}</p>
              {request.user_phone && (
                <p className="text-muted-foreground text-sm">
                  {request.user_phone}
                </p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.service")}:
              </span>
              <p className="font-medium">{request.api_service_name || "-"}</p>
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
                {request.credit_cost || 0} {t("serviceRequests.credit")}
              </p>
            </div>
            {request.rating && (
              <div>
                <span className="text-muted-foreground text-sm">
                  {t("serviceRequests.detail.rating")}:
                </span>
                <p className="font-medium">{"⭐".repeat(request.rating)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {request.input_params && (
        <Card>
          <CardHeader>
            <CardTitle>{t("serviceRequests.detail.inputParams")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-md p-4 text-sm">
              {JSON.stringify(request.input_params, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {request.output && (
        <Card>
          <CardHeader>
            <CardTitle>{t("serviceRequests.detail.output")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-md p-4 text-sm">
              {JSON.stringify(request.output, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {request.error_message && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("serviceRequests.detail.error")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{request.error_message}</p>
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
          {request.updatedAt && (
            <div>
              <span className="text-muted-foreground text-sm">
                {t("serviceRequests.detail.updatedAt")}:
              </span>
              <p>{new Date(request.updatedAt).toLocaleString("fa-IR")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
