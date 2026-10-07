import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2, IconMessageCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useTextChatAvailability,
  useUpdateTextChatAvailability,
} from "../hooks/use-text-chat-availability";

const MESSAGE_MAX_LENGTH = 400;

export function TextChatAvailabilityCard() {
  const { t } = useTranslation("common");
  const { data, isLoading, isError } = useTextChatAvailability();
  const updateAvailability = useUpdateTextChatAvailability();
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data) return;
    setIsActive(data.isActive);
    setMessage(data.message);
  }, [data]);

  const isSaving = updateAvailability.isPending;
  const isDirty =
    !data || data.isActive !== isActive || data.message !== message;

  const handleSave = () => {
    void updateAvailability.mutateAsync({
      isActive,
      message: message.trim(),
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
              <IconMessageCircle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("textChatModels.availability.title")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t("textChatModels.availability.description")}
              </CardDescription>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="mt-1 h-5 w-9 shrink-0 rounded-full" />
          ) : (
            <Switch
              dir="ltr"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSaving}
              aria-label={t("textChatModels.availability.ariaLabel")}
              className="mt-1 shrink-0"
            />
          )}
        </div>

        {isError ? (
          <p className="text-destructive mr-12.5 text-xs">
            {t("textChatModels.availability.loadError")}
          </p>
        ) : null}
      </CardHeader>

      {!isActive && (
        <CardContent className="space-y-3 px-6 py-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Textarea
                  id="text-chat-availability-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value.slice(0, MESSAGE_MAX_LENGTH))
                  }
                  placeholder={t(
                    "textChatModels.availability.messagePlaceholder"
                  )}
                  disabled={isSaving}
                  rows={3}
                  className="min-h-24 resize-y"
                />
              </div>
            </>
          )}
        </CardContent>
      )}
      <div className="ml-6 flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? <IconLoader2 className="size-4 animate-spin" /> : null}
          {isSaving
            ? t("textChatModels.availability.saving")
            : t("textChatModels.availability.save")}
        </Button>
      </div>
    </Card>
  );
}
