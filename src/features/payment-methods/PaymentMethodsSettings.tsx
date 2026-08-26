import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import { IconLoader2 } from "@tabler/icons-react";
import { SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BankPortalSection } from "./components/bank-portal-section";
import { CardToCardSection } from "./components/card-to-card-section";
import { InstallmentSection } from "./components/installment-section";
import {
  usePaymentMethodsConfig,
  useUpdatePaymentMethodsConfig,
} from "./hooks/use-payment-methods";
import type { PaymentMethodsFormState } from "./types";
import {
  createEmptyPaymentMethodsForm,
  normalizePaymentMethodsForm,
} from "./utils/payment-methods.helpers";

export default function PaymentMethodsSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = usePaymentMethodsConfig();
  const updateConfig = useUpdatePaymentMethodsConfig();
  const [form, setForm] = useState<PaymentMethodsFormState>(
    createEmptyPaymentMethodsForm
  );

  useEffect(() => {
    if (!data?.methods) return;
    setForm(normalizePaymentMethodsForm(data.methods));
  }, [data]);

  const handleReset = () => {
    if (!data?.methods) {
      setForm(createEmptyPaymentMethodsForm());
      return;
    }
    setForm(normalizePaymentMethodsForm(data.methods));
  };

  const handleSave = async () => {
    if (
      form.BANK_PORTAL.isEnabled &&
      !Object.values(form.BANK_PORTAL.providers).some(
        (provider) => provider.isEnabled
      )
    ) {
      toast.error(t("paymentMethods.errors.bankPortalProviderRequired"));
      return;
    }

    if (
      form.BANK_PORTAL.isEnabled &&
      !form.BANK_PORTAL.providers[form.BANK_PORTAL.defaultProvider]?.isEnabled
    ) {
      toast.error(t("paymentMethods.errors.defaultProviderMustBeEnabled"));
      return;
    }

    if (form.CARD_TO_CARD.isEnabled) {
      const { cardNumber, cardHolder, bankName } = form.CARD_TO_CARD.cardInfo;
      if (!cardNumber.trim() || !cardHolder.trim() || !bankName.trim()) {
        toast.error(t("paymentMethods.errors.cardInfoRequired"));
        return;
      }
    }

    await updateConfig.mutateAsync({ methods: form });
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("paymentMethods.header.title")}
          description={t("paymentMethods.header.description")}
        />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("paymentMethods.header.title")}
        description={t("paymentMethods.header.description")}
      />

      <BankPortalSection
        value={form.BANK_PORTAL}
        onChange={(BANK_PORTAL) =>
          setForm((prev) => ({ ...prev, BANK_PORTAL }))
        }
      />

      <CardToCardSection
        value={form.CARD_TO_CARD}
        onChange={(CARD_TO_CARD) =>
          setForm((prev) => ({ ...prev, CARD_TO_CARD }))
        }
      />

      <InstallmentSection
        value={form.INSTALLMENT}
        onChange={(INSTALLMENT) =>
          setForm((prev) => ({ ...prev, INSTALLMENT }))
        }
      />

      <div className="bg-card flex items-center justify-end gap-3 rounded-2xl border p-5 shadow-sm">
        <Button
          type="button"
          variant="outline"
          disabled={updateConfig.isPending}
          onClick={handleReset}
        >
          {t("paymentMethods.actions.cancel")}
        </Button>
        <Button
          type="button"
          className="gap-2"
          disabled={updateConfig.isPending}
          onClick={handleSave}
        >
          {updateConfig.isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}
          {t("paymentMethods.actions.save")}
        </Button>
      </div>
    </div>
  );
}
