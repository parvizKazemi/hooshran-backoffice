import type {
  MaintenanceModeFormState,
  MaintenanceModeMessages,
} from "./types";

type BuildMaintenanceMessagesOptions = {
  form: Pick<MaintenanceModeFormState, "description" | "estimatedTime">;
  outageTitle: string;
};

export function buildMaintenanceMessages({
  form,
  outageTitle,
}: BuildMaintenanceMessagesOptions): MaintenanceModeMessages {
  const description = form.description.trim();
  const estimatedTime = form.estimatedTime.trim();
  const outageDescription = estimatedTime
    ? `${description}\n\nزمان تقریبی بازگشت: ${estimatedTime}`
    : description;

  return {
    purchaseMessage: description,
    outageTitle,
    outageDescription,
    notificationTitle: outageTitle,
    notificationMessage: outageDescription,
    notificationBadge: estimatedTime || undefined,
  };
}
