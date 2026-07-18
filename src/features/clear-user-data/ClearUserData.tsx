import { SettingsPageHeader } from "@/features/user-settings/components/settings-page-header";
import { isTestMode } from "@/lib/env";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ClearUserConfirmDialog } from "./components/clear-user-confirm-dialog";
import { ClearUserDataForm } from "./components/clear-user-data-form";
import {
  DEFAULT_PURGE_OPTIONS,
  PURGE_OPTION_ORDER,
  hasSelectedPurgeOption,
  toRemoveUserDataQuery,
} from "./constants";
import { useClearUserData } from "./hooks/use-clear-user-data";
import type { PurgeOptionId, PurgeOptionsState } from "./types";
import { isValidIranPhone } from "./utils/phone";

export default function ClearUserData() {
  const { t } = useTranslation("common");
  const clearUser = useClearUserData();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [options, setOptions] = useState<PurgeOptionsState>(
    DEFAULT_PURGE_OPTIONS
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [summaryOptions, setSummaryOptions] = useState<PurgeOptionId[]>([]);

  if (!isTestMode) {
    return <Navigate to="/" replace />;
  }

  const getSelectedOptions = (): PurgeOptionId[] => {
    if (options.hardPurge) {
      return ["hardPurge"];
    }

    return PURGE_OPTION_ORDER.filter((id) => id !== "hardPurge" && options[id]);
  };

  const handleSubmit = () => {
    const trimmedPhone = phoneNumber.trim();

    if (!isValidIranPhone(trimmedPhone)) {
      toast.error(t("clearUserData.toasts.invalidPhone"));
      return;
    }

    if (!hasSelectedPurgeOption(options)) {
      toast.warning(t("clearUserData.toasts.noOptionSelected"));
      return;
    }

    setSummaryOptions(getSelectedOptions());
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const trimmedPhone = phoneNumber.trim();
    const query = toRemoveUserDataQuery(options);

    try {
      await clearUser.mutateAsync({
        phoneNumber: trimmedPhone,
        options: query,
      });
      setIsConfirmOpen(false);
      setPhoneNumber("");
      setOptions(DEFAULT_PURGE_OPTIONS);
      setSummaryOptions([]);
    } catch {
      // Error toast handled in mutation onError
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("clearUserData.header.title")}
        description={t("clearUserData.header.description")}
      />

      <ClearUserDataForm
        phoneNumber={phoneNumber}
        options={options}
        isPending={clearUser.isPending}
        onPhoneChange={setPhoneNumber}
        onOptionsChange={setOptions}
        onSubmit={handleSubmit}
      />

      <ClearUserConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        phoneNumber={phoneNumber.trim()}
        selectedOptions={summaryOptions}
        isPending={clearUser.isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
