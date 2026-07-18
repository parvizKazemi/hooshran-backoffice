import { memo } from "react";
import { useTranslation } from "react-i18next";
import { UserCredit } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  creditStatusBadgeClassName,
  normalizeCreditStatus,
} from "../utils/credit-status.helpers";

type UserCreditDetailProps = {
  credit: UserCredit;
};

export const UserCreditDetail = memo(function UserCreditDetail({
  credit,
}: UserCreditDetailProps) {
  const { t } = useTranslation("common");
  const status = normalizeCreditStatus(credit.status);

  const typeLabels: Record<string, string> = {
    PURCHASE: t("userCredits.types.purchase"),
    GIFT: t("userCredits.types.gift"),
    REFERRAL: t("userCredits.types.referral"),
    SYSTEM: t("userCredits.types.system"),
    ADMIN: t("userCredits.types.admin"),
  };

  const packageTypeLabels: Record<string, string> = {
    SUBSCRIPTION: t("userCredits.packageTypes.subscription"),
    "SUBSCRIPTION-TRANSFERED": t("userCredits.packageTypes.transferred"),
    PERMANENT: t("userCredits.packageTypes.permanent"),
    ONE_TIME: t("userCredits.packageTypes.oneTime"),
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("userCredits.detail.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.userPhone")}:
              </span>
              <p className="font-mono font-medium">{credit.userPhoneNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.status")}:
              </span>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={creditStatusBadgeClassName(status)}
                >
                  {t(`userCredits.statuses.${status}`, {
                    defaultValue: status,
                  })}
                </Badge>
              </div>
            </div>
            {status === "cancelled" && credit.cancelReason ? (
              <div className="col-span-2">
                <span className="text-muted-foreground text-sm">
                  {t("userCredits.form.cancelReason")}:
                </span>
                <p className="mt-1 text-sm leading-relaxed">
                  {credit.cancelReason}
                </p>
              </div>
            ) : null}
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.creditBalance")}:
              </span>
              <p className="font-medium">
                {credit.creditBalance} {t("userCredits.credit")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.creditAmount")}:
              </span>
              <p className="font-medium">
                {credit.creditAmount} {t("userCredits.credit")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.pricePaid")}:
              </span>
              <p className="font-medium">
                {credit.pricePaid.toLocaleString()} {t("userCredits.rial")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.type")}:
              </span>
              <p className="font-medium">
                {typeLabels[credit.type] || credit.type}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.packageType")}:
              </span>
              <p className="font-medium">
                {packageTypeLabels[credit.packageType] || credit.packageType}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.packageUuid")}:
              </span>
              <p className="font-mono text-sm">{credit.packageUuid}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.uuid")}:
              </span>
              <p className="font-mono text-sm">{credit.uuid}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">
                {t("userCredits.detail.userUuid")}:
              </span>
              <p className="font-mono text-sm">{credit.userUuid}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("userCredits.detail.timestamps")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground text-sm">
              {t("userCredits.detail.createdAt")}:
            </span>
            <p>{new Date(credit.createdAt).toLocaleString("fa-IR")}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">
              {t("userCredits.detail.expiresAt")}:
            </span>
            <p>
              {credit.expiresAt
                ? new Date(credit.expiresAt).toLocaleString("fa-IR")
                : "-"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
