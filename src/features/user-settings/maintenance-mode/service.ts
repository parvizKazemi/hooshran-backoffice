import type { BasicNotification } from "@/features/notifications/types";
import { apiPost, apiPut } from "@/services/api";
import {
  getPaymentGateConfig,
  getRequestToolsGateConfig,
  updatePaymentGateConfig,
  updateRequestToolsGateConfig,
} from "../api/service";
import { MAINTENANCE_NOTIFICATION_TARGET_GROUP } from "./constants";
import { buildMaintenanceMessages } from "./message-builder";
import {
  clearMaintenanceModeState,
  writeMaintenanceModeState,
} from "./storage";
import type {
  MaintenanceModeFormState,
  MaintenanceModeMessages,
  MaintenanceModePersistedState,
  MaintenanceModeSnapshot,
} from "./types";

type CreateMaintenanceNotificationInput = {
  messages: MaintenanceModeMessages;
  adminUserId?: string;
};

async function createMaintenanceNotification({
  messages,
  adminUserId,
}: CreateMaintenanceNotificationInput): Promise<BasicNotification> {
  const notificationData: Record<string, unknown> = {
    title: messages.notificationTitle,
    message: messages.notificationMessage,
    visibility: {
      route: ["all"],
      rules: { all: "include" },
    },
  };

  if (messages.notificationBadge) {
    notificationData.badge = messages.notificationBadge;
  }

  return apiPost<BasicNotification>("/admin/notification", {
    type: "information",
    metaData: {
      type: "simple",
      data: notificationData,
    },
    targetGroup: MAINTENANCE_NOTIFICATION_TARGET_GROUP,
    isActive: true,
    isPopup: true,
    isPublic: true,
    ...(adminUserId ? { userId: adminUserId } : {}),
  });
}

async function deactivateMaintenanceNotification(
  notificationId: string
): Promise<void> {
  await apiPut(`/admin/notification/${notificationId}`, {
    isActive: false,
  });
}

async function activateMaintenanceNotification(
  notificationId: string
): Promise<void> {
  await apiPut(`/admin/notification/${notificationId}`, {
    isActive: true,
  });
}

export async function loadMaintenanceModeSnapshot(): Promise<MaintenanceModeSnapshot> {
  const [previousPaymentGate, previousRequestToolsGate] = await Promise.all([
    getPaymentGateConfig(),
    getRequestToolsGateConfig(),
  ]);

  return {
    previousPaymentGate,
    previousRequestToolsGate,
  };
}

export async function enableMaintenanceMode({
  form,
  snapshot,
  outageTitle,
  adminUserId,
}: {
  form: MaintenanceModeFormState;
  snapshot: MaintenanceModeSnapshot;
  outageTitle: string;
  adminUserId?: string;
}): Promise<MaintenanceModePersistedState> {
  const messages = buildMaintenanceMessages({ form, outageTitle });
  let paymentUpdated = false;
  let requestGateUpdated = false;
  let notification: BasicNotification | null = null;

  try {
    await updatePaymentGateConfig({
      isPurchaseDisabled: true,
      purchaseDisabledMessage: messages.purchaseMessage,
    });
    paymentUpdated = true;

    await updateRequestToolsGateConfig({
      ...snapshot.previousRequestToolsGate,
      isRequestSendingDisabled: true,
      outageTitle: messages.outageTitle,
      outageDescription: messages.outageDescription,
    });
    requestGateUpdated = true;

    notification = await createMaintenanceNotification({
      messages,
      adminUserId,
    });

    const persistedState: MaintenanceModePersistedState = {
      isActive: true,
      isEnabled: true,
      description: form.description.trim(),
      estimatedTime: form.estimatedTime.trim(),
      notificationId: notification.uuid,
      ...snapshot,
    };

    writeMaintenanceModeState(persistedState);
    return persistedState;
  } catch (error) {
    if (notification?.uuid) {
      try {
        await deactivateMaintenanceNotification(notification.uuid);
      } catch {
        // Best-effort rollback for partially created notification.
      }
    }

    if (requestGateUpdated) {
      await updateRequestToolsGateConfig(snapshot.previousRequestToolsGate);
    }

    if (paymentUpdated) {
      await updatePaymentGateConfig(snapshot.previousPaymentGate);
    }

    throw error;
  }
}

export async function disableMaintenanceMode({
  snapshot,
  notificationId,
  currentForm,
  outageTitle,
}: {
  snapshot: MaintenanceModeSnapshot;
  notificationId: string;
  currentForm: MaintenanceModeFormState;
  outageTitle: string;
}): Promise<void> {
  let paymentUpdated = false;
  let requestGateUpdated = false;
  let notificationDeactivated = false;

  const currentMessages = buildMaintenanceMessages({
    form: currentForm,
    outageTitle,
  });

  try {
    await updatePaymentGateConfig(snapshot.previousPaymentGate);
    paymentUpdated = true;

    await updateRequestToolsGateConfig(snapshot.previousRequestToolsGate);
    requestGateUpdated = true;

    await deactivateMaintenanceNotification(notificationId);
    notificationDeactivated = true;

    clearMaintenanceModeState();
  } catch (error) {
    if (notificationDeactivated) {
      await activateMaintenanceNotification(notificationId);
    }

    if (requestGateUpdated) {
      await updateRequestToolsGateConfig({
        ...snapshot.previousRequestToolsGate,
        isRequestSendingDisabled: true,
        outageTitle: currentMessages.outageTitle,
        outageDescription: currentMessages.outageDescription,
      });
    }

    if (paymentUpdated) {
      await updatePaymentGateConfig({
        isPurchaseDisabled: true,
        purchaseDisabledMessage: currentMessages.purchaseMessage,
      });
    }

    throw error;
  }
}
