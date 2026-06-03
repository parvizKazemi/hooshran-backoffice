import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SettingsPageHeader } from "./components/settings-page-header";
import {
  useRequestToolsGateConfig,
  useUpdateRequestToolsGateConfig,
} from "./hooks/use-user-settings";
import type { RequestToolsGateSettings } from "./types";

const OUTAGE_TITLE_MAX_LENGTH = 50;
const OUTAGE_DESCRIPTION_MAX_LENGTH = 300;
const PHONE_REGEX = /^09\d{9}$/;
const TAG_DELIMITER_REGEX = /[\s,]+/;

const DEFAULT_REQUEST_TOOLS_GATE_SETTINGS: RequestToolsGateSettings = {
  isRequestSendingDisabled: false,
  outageTitle: "",
  outageDescription: "",
  testerWhitelistPhoneNumbers: [],
};

export default function UserRequestToolsGateSettings() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useRequestToolsGateConfig();
  const updateRequestToolsGateConfig = useUpdateRequestToolsGateConfig();
  const [settings, setSettings] = useState<RequestToolsGateSettings>(
    DEFAULT_REQUEST_TOOLS_GATE_SETTINGS
  );
  const [phoneDraft, setPhoneDraft] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }
    setSettings({
      isRequestSendingDisabled: Boolean(data.isRequestSendingDisabled),
      outageTitle: data.outageTitle ?? "",
      outageDescription: data.outageDescription ?? "",
      testerWhitelistPhoneNumbers: data.testerWhitelistPhoneNumbers ?? [],
    });
  }, [data]);

  const titleCharacterCount = settings.outageTitle.length;
  const descriptionCharacterCount = settings.outageDescription.length;
  const isDescriptionAtLimit =
    descriptionCharacterCount >= OUTAGE_DESCRIPTION_MAX_LENGTH;
  const isSaving = updateRequestToolsGateConfig.isPending;

  const normalizedWhitelist = useMemo(
    () =>
      settings.testerWhitelistPhoneNumbers
        .map((phone) => phone.trim())
        .filter(Boolean),
    [settings.testerWhitelistPhoneNumbers]
  );

  const applyPhoneTags = (rawValue: string) => {
    const candidates = rawValue
      .split(TAG_DELIMITER_REGEX)
      .map((value) => value.trim())
      .filter(Boolean);

    if (candidates.length === 0) {
      return;
    }

    const dedupedNumbers = new Set(normalizedWhitelist);
    let hasInvalidPhone = false;

    for (const phone of candidates) {
      if (!PHONE_REGEX.test(phone)) {
        hasInvalidPhone = true;
        continue;
      }
      dedupedNumbers.add(phone);
    }

    if (hasInvalidPhone) {
      toast.error(t("userSettings.requestGatePage.whitelist.invalidPhone"));
    }

    setSettings((prev) => ({
      ...prev,
      testerWhitelistPhoneNumbers: Array.from(dedupedNumbers),
    }));
    setPhoneDraft("");
  };

  const handlePhoneDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" ||
      event.key === "," ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      applyPhoneTags(phoneDraft);
    }
  };

  const handlePhoneDraftBlur = () => {
    if (phoneDraft.trim().length > 0) {
      applyPhoneTags(phoneDraft);
    }
  };

  const handleTagRemove = (phoneToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      testerWhitelistPhoneNumbers: prev.testerWhitelistPhoneNumbers.filter(
        (phone) => phone !== phoneToRemove
      ),
    }));
  };

  const handleTagEdit = (phoneToEdit: string) => {
    setSettings((prev) => ({
      ...prev,
      testerWhitelistPhoneNumbers: prev.testerWhitelistPhoneNumbers.filter(
        (phone) => phone !== phoneToEdit
      ),
    }));
    setPhoneDraft(phoneToEdit);
  };

  const handleSave = async () => {
    const normalizedTitle = settings.outageTitle.trim();
    const normalizedDescription = settings.outageDescription.trim();

    if (
      settings.isRequestSendingDisabled &&
      (!normalizedTitle || !normalizedDescription)
    ) {
      toast.error(
        t("userSettings.requestGatePage.errors.messageFieldsRequired")
      );
      return;
    }

    await updateRequestToolsGateConfig.mutateAsync({
      ...settings,
      outageTitle: normalizedTitle,
      outageDescription: normalizedDescription,
      testerWhitelistPhoneNumbers: normalizedWhitelist,
    });
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <SettingsPageHeader
          title={t("userSettings.requestGatePage.header.title")}
          description={t("userSettings.requestGatePage.header.description")}
        />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SettingsPageHeader
        title={t("userSettings.requestGatePage.header.title")}
        description={t("userSettings.requestGatePage.header.description")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("userSettings.requestGatePage.card.title")}</CardTitle>
          <CardDescription>
            {t("userSettings.requestGatePage.card.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-4 space-y-2">
              <p className="text-sm font-semibold">
                {t("userSettings.requestGatePage.toggle.title")}
              </p>
              <Badge
                className={cn(
                  "-mt-2",
                  settings.isRequestSendingDisabled
                    ? "border-orange-200 bg-orange-100 text-orange-800"
                    : "border-emerald-200 bg-emerald-100 text-emerald-800"
                )}
              >
                {settings.isRequestSendingDisabled
                  ? t("userSettings.requestGatePage.status.blocked")
                  : t("userSettings.requestGatePage.status.open")}
              </Badge>
            </div>
            <Switch
              dir="ltr"
              checked={settings.isRequestSendingDisabled}
              onCheckedChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  isRequestSendingDisabled: value,
                }))
              }
              aria-label={t("userSettings.aria.toggleRequestGateStatus")}
            />
          </div>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              settings.isRequestSendingDisabled
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-4 rounded-lg border p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="request-gate-outage-title">
                    {t("userSettings.requestGatePage.message.titleLabel")}
                  </Label>
                  <span className="text-muted-foreground text-xs">
                    {titleCharacterCount} / {OUTAGE_TITLE_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="request-gate-outage-title"
                  value={settings.outageTitle}
                  maxLength={OUTAGE_TITLE_MAX_LENGTH}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      outageTitle: event.target.value.slice(
                        0,
                        OUTAGE_TITLE_MAX_LENGTH
                      ),
                    }))
                  }
                  placeholder={t(
                    "userSettings.requestGatePage.message.titlePlaceholder"
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="request-gate-outage-description">
                    {t("userSettings.requestGatePage.message.descriptionLabel")}
                  </Label>
                  <span
                    className={cn(
                      "text-xs",
                      isDescriptionAtLimit
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {descriptionCharacterCount} /{" "}
                    {OUTAGE_DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="request-gate-outage-description"
                  value={settings.outageDescription}
                  maxLength={OUTAGE_DESCRIPTION_MAX_LENGTH}
                  className="min-h-28"
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      outageDescription: event.target.value.slice(
                        0,
                        OUTAGE_DESCRIPTION_MAX_LENGTH
                      ),
                    }))
                  }
                  placeholder={t(
                    "userSettings.requestGatePage.message.descriptionPlaceholder"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-gate-whitelist-input">
                  {t("userSettings.requestGatePage.whitelist.label")}
                </Label>
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {normalizedWhitelist.map((phone) => (
                      <span
                        key={phone}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-mono text-xs text-blue-800"
                      >
                        <button
                          type="button"
                          onClick={() => handleTagEdit(phone)}
                          className="cursor-pointer"
                        >
                          {phone}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTagRemove(phone)}
                          className="rounded-sm p-0.5 hover:bg-blue-100"
                          aria-label={t(
                            "userSettings.requestGatePage.whitelist.removeTagAria"
                          )}
                        >
                          <IconX className="size-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      id="request-gate-whitelist-input"
                      value={phoneDraft}
                      onChange={(event) => setPhoneDraft(event.target.value)}
                      onKeyDown={handlePhoneDraftKeyDown}
                      onBlur={handlePhoneDraftBlur}
                      className="h-9 min-w-[220px] flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
                      placeholder={t(
                        "userSettings.requestGatePage.whitelist.placeholder"
                      )}
                    />
                  </div>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("userSettings.requestGatePage.whitelist.hint")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <IconLoader2 className="size-4 animate-spin" />}
              {t("userSettings.requestGatePage.actions.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
