import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Package } from "@/features/packages/types";
import { cn } from "@/lib/utils";
import { IconLoader2, IconTicket } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/services/api";
import { toast } from "sonner";
import {
  DEFAULT_DISCOUNT_PERCENTAGE,
  DEFAULT_GLOBAL_CAPACITY,
  DEFAULT_USAGE_LIMIT_PER_USER,
  DISCOUNT_CODE_PATTERN,
} from "../constants";
import {
  useCreateDiscountCode,
  useUpdateDiscountCode,
} from "../hooks/use-discount-codes";
import type {
  DiscountCode,
  DiscountCodeFormState,
  PackageSelectionState,
} from "../types";
import { buildNotificationPayload, resolveDiscountCodeUuid } from "../types";
import {
  extractInvalidPhoneNumbers,
  hasInvalidPhoneNumbersError,
} from "../utils/parse-discount-code-error";
import {
  buildPackageSelectionFromCode,
  buildSelectedPackagesPayload,
  toEndOfDayIso,
} from "../utils/group-packages";
import { PhoneNumbersTagInput } from "./phone-numbers-tag-input";
import { TargetPackagesSelector } from "./target-packages-selector";

type DiscountCodeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: Package[];
  isPackagesLoading?: boolean;
  discountCode?: DiscountCode | null;
};

const createInitialForm = (
  notificationTitle: string,
  notificationMessage: string
): DiscountCodeFormState => ({
  code: "",
  type: "global",
  phoneNumbers: [],
  capacity: DEFAULT_GLOBAL_CAPACITY,
  clientUsageLimit: DEFAULT_USAGE_LIMIT_PER_USER,
  hasExpiry: false,
  expiresAt: undefined,
  showNotification: false,
  notificationTitle,
  notificationMessage,
});

export function DiscountCodeFormDialog({
  open,
  onOpenChange,
  packages,
  isPackagesLoading = false,
  discountCode = null,
}: DiscountCodeFormDialogProps) {
  const { t } = useTranslation("common");
  const createDiscountCode = useCreateDiscountCode();
  const updateDiscountCode = useUpdateDiscountCode();
  const isEditMode = Boolean(discountCode);

  const defaultNotificationTitle = t(
    "discountCodes.form.notification.defaultTitle"
  );
  const defaultNotificationMessage = t(
    "discountCodes.form.notification.defaultMessage"
  );

  const [form, setForm] = useState<DiscountCodeFormState>(() =>
    createInitialForm(defaultNotificationTitle, defaultNotificationMessage)
  );
  const [packageSelection, setPackageSelection] =
    useState<PackageSelectionState>({});
  const [codeError, setCodeError] = useState<string | null>(null);
  const [serverInvalidPhones, setServerInvalidPhones] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setServerInvalidPhones([]);

    if (discountCode) {
      setForm({
        code: discountCode.code,
        type: discountCode.type,
        phoneNumbers: discountCode.phoneNumbers ?? [],
        capacity: discountCode.capacity,
        clientUsageLimit:
          discountCode.clientUsageLimit ?? DEFAULT_USAGE_LIMIT_PER_USER,
        hasExpiry: Boolean(discountCode.expiresAt),
        expiresAt: discountCode.expiresAt?.slice(0, 10),
        showNotification: discountCode.showNotification,
        notificationTitle:
          discountCode.notificationTitle?.trim() || defaultNotificationTitle,
        notificationMessage:
          discountCode.notificationText?.trim() || defaultNotificationMessage,
      });
      setPackageSelection(buildPackageSelectionFromCode(discountCode));
    } else {
      setForm(
        createInitialForm(defaultNotificationTitle, defaultNotificationMessage)
      );
      setPackageSelection({});
    }

    setCodeError(null);
  }, [
    open,
    discountCode,
    defaultNotificationTitle,
    defaultNotificationMessage,
  ]);

  const isPersonal = form.type === "personal";
  const isSaving = createDiscountCode.isPending || updateDiscountCode.isPending;

  const selectedPackagesCount = useMemo(
    () =>
      Object.values(packageSelection).filter((item) => item.selected).length,
    [packageSelection]
  );

  const handleTypeChange = (type: DiscountCodeFormState["type"]) => {
    setForm((prev) => ({
      ...prev,
      type,
      phoneNumbers: type === "personal" ? prev.phoneNumbers : [],
    }));
  };

  const handleSubmit = async () => {
    if (form.hasExpiry && !form.expiresAt) {
      toast.error(t("discountCodes.form.errors.expiryRequired"));
      return;
    }

    const selectedPackages = buildSelectedPackagesPayload(
      packages,
      packageSelection
    );

    if (selectedPackages.length === 0) {
      if (selectedPackagesCount > 0) {
        toast.error(t("discountCodes.form.errors.missingPackageUuid"));
        return;
      }

      toast.error(t("discountCodes.form.errors.packagesRequired"));
      return;
    }

    const expiresAtValue =
      form.hasExpiry && form.expiresAt ? toEndOfDayIso(form.expiresAt) : null;

    if (isPersonal && form.phoneNumbers.length === 0) {
      toast.error(t("discountCodes.form.errors.phonesRequired"));
      return;
    }

    const notificationPayload = buildNotificationPayload(
      form.showNotification,
      form.notificationTitle,
      form.notificationMessage
    );

    const sharedPayload = {
      packages: selectedPackages,
      capacity: form.capacity,
      clientUsageLimit: form.clientUsageLimit,
      expiresAt: expiresAtValue ?? undefined,
      ...notificationPayload,
    };

    try {
      if (isEditMode) {
        const discountCodeUuid = discountCode
          ? resolveDiscountCodeUuid(discountCode)
          : null;

        if (!discountCodeUuid) {
          toast.error(t("discountCodes.form.errors.missingCodeUuid"));
          return;
        }

        await updateDiscountCode.mutateAsync({
          uuid: discountCodeUuid,
          payload: {
            ...sharedPayload,
            expiresAt: expiresAtValue,
            ...(isPersonal
              ? {
                  phoneNumbers: form.phoneNumbers.map((phone) => phone.trim()),
                }
              : {}),
          },
        });
        toast.success(t("discountCodes.form.success.updated"));
      } else {
        const normalizedCode = form.code.trim().toUpperCase();

        if (!normalizedCode) {
          setCodeError(t("discountCodes.form.errors.codeRequired"));
          return;
        }

        if (!DISCOUNT_CODE_PATTERN.test(normalizedCode)) {
          setCodeError(t("discountCodes.form.errors.codePattern"));
          return;
        }

        if (isPersonal) {
          await createDiscountCode.mutateAsync({
            ...sharedPayload,
            code: normalizedCode,
            type: form.type,
            phoneNumbers: form.phoneNumbers.map((phone) => phone.trim()),
          });
        } else {
          await createDiscountCode.mutateAsync({
            ...sharedPayload,
            code: normalizedCode,
            type: form.type,
          });
        }

        toast.success(t("discountCodes.form.success.created"));
      }

      onOpenChange(false);
    } catch (error) {
      if (hasInvalidPhoneNumbersError(error)) {
        const invalidPhones = extractInvalidPhoneNumbers(error);
        setServerInvalidPhones(invalidPhones);

        if (invalidPhones.length === 0 && error instanceof ApiError) {
          toast.error(error.message);
        }

        return;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <IconTicket className="size-5" />
            </div>
            <div className="text-right">
              <DialogTitle>
                {isEditMode
                  ? t("discountCodes.form.editTitle")
                  : t("discountCodes.form.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? t("discountCodes.form.editDescription")
                  : t("discountCodes.form.createDescription")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="space-y-4 rounded-xl border p-4">
              <h3 className="text-sm font-bold">
                {t("discountCodes.form.sections.basic")}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="discount-code">
                  {t("discountCodes.form.code")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="discount-code"
                  dir="ltr"
                  autoFocus={!isEditMode}
                  disabled={isEditMode}
                  value={form.code}
                  onChange={(event) => {
                    setForm((prev) => ({
                      ...prev,
                      code: event.target.value.toUpperCase(),
                    }));
                    setCodeError(null);
                  }}
                  placeholder={t("discountCodes.form.codePlaceholder")}
                  className={cn(
                    "font-mono tracking-wider",
                    codeError && "border-destructive",
                    isEditMode && "opacity-70"
                  )}
                />
                {codeError && (
                  <p className="text-destructive text-xs font-medium">
                    {codeError}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>{t("discountCodes.form.type")}</Label>
                <div className="bg-muted flex rounded-xl p-1">
                  {(["global", "personal"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      disabled={isEditMode}
                      onClick={() => handleTypeChange(type)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition-all",
                        form.type === type
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                        isEditMode && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {t(`discountCodes.types.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              {isPersonal && (
                <div className="bg-primary/5 border-primary/20 rounded-xl border p-4">
                  <PhoneNumbersTagInput
                    value={form.phoneNumbers}
                    onChange={(phoneNumbers) => {
                      setServerInvalidPhones([]);
                      setForm((prev) => ({ ...prev, phoneNumbers }));
                    }}
                    label={`${t("discountCodes.form.phoneNumber")} *`}
                    hint={t("discountCodes.form.phoneHint")}
                    serverInvalidPhones={serverInvalidPhones}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border p-4">
              <h3 className="text-sm font-bold">
                {t("discountCodes.form.sections.rules")}
              </h3>

              <div className="space-y-3">
                <Label>{t("discountCodes.form.usage.title")}</Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">
                      {t("discountCodes.form.capacity")}
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          capacity: Math.max(
                            1,
                            Number(event.target.value) || 1
                          ),
                        }))
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      {t("discountCodes.form.capacityHint")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage-limit-per-user">
                      {t("discountCodes.form.clientUsageLimit")}
                    </Label>
                    <Input
                      id="usage-limit-per-user"
                      type="number"
                      min={1}
                      value={form.clientUsageLimit}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          clientUsageLimit: Math.max(
                            1,
                            Number(event.target.value) || 1
                          ),
                        }))
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      {t("discountCodes.form.clientUsageLimitHint")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("discountCodes.form.expiry.title")}</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-3">
                    <input
                      type="radio"
                      checked={!form.hasExpiry}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          hasExpiry: false,
                          expiresAt: undefined,
                        }))
                      }
                      className="text-primary"
                    />
                    <span className="text-sm">
                      {t("discountCodes.form.expiry.none")}
                    </span>
                  </label>
                  <label className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg border p-3">
                    <input
                      type="radio"
                      checked={form.hasExpiry}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, hasExpiry: true }))
                      }
                      className="text-primary"
                    />
                    <span className="text-sm">
                      {t("discountCodes.form.expiry.date")}
                    </span>
                  </label>
                </div>
                {form.hasExpiry && (
                  <PersianDateInput
                    value={form.expiresAt}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, expiresAt: value }))
                    }
                    placeholder={t("discountCodes.form.expiry.placeholder")}
                  />
                )}
              </div>

              <div className="bg-muted/40 space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {t("discountCodes.form.notification.title")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("discountCodes.form.notification.description")}
                    </p>
                  </div>
                  <Switch
                    checked={form.showNotification}
                    dir="ltr"
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        showNotification: checked,
                      }))
                    }
                  />
                </div>

                {form.showNotification && (
                  <div className="space-y-3 border-t pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="notification-title">
                        {t("discountCodes.form.notification.titleLabel")}
                      </Label>
                      <Input
                        id="notification-title"
                        value={form.notificationTitle}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            notificationTitle: event.target.value,
                          }))
                        }
                        placeholder={t(
                          "discountCodes.form.notification.defaultTitle"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notification-message">
                        {t("discountCodes.form.notification.messageLabel")}
                      </Label>
                      <Textarea
                        id="notification-message"
                        rows={3}
                        value={form.notificationMessage}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            notificationMessage: event.target.value,
                          }))
                        }
                        placeholder={t(
                          "discountCodes.form.notification.defaultMessage"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <TargetPackagesSelector
            packages={packages}
            isLoading={isPackagesLoading}
            selection={packageSelection}
            onSelectionChange={setPackageSelection}
            defaultDiscount={DEFAULT_DISCOUNT_PERCENTAGE}
          />
        </div>

        <DialogFooter className="bg-muted/20 border-t px-6 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">
                {t("discountCodes.form.summary", {
                  count: selectedPackagesCount,
                })}
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {t("discountCodes.form.cancel")}
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                {isSaving && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {t(
                  isEditMode
                    ? "discountCodes.form.saveChanges"
                    : "discountCodes.form.submit"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
