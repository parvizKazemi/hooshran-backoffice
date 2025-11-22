import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { User } from "../../types";

type UserResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => Promise<{ password: string }>;
};

export function UserResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UserResetPasswordDialogProps) {
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = await onConfirm();
      setPassword(result.password);
      toast.success(t("users.resetPassword.success"));
    } catch {
      // Error is already handled in the mutation
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t("users.resetPassword.copied"));
      setTimeout(() => {
        setCopied(false);
        onOpenChange(false);
        setPassword(null);
      }, 1000);
    } catch {
      toast.error(t("users.resetPassword.copyError"));
    }
  };

  const handleCancel = () => {
    if (!password) {
      onOpenChange(false);
    } else {
      setPassword(null);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("users.resetPassword.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {password ? (
              <div className="space-y-4">
                <p>{t("users.resetPassword.passwordGenerated")}</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={password}
                    readOnly
                    className="font-mono text-lg font-bold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? (
                      <IconCheck className="h-4 w-4" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <p>{t("users.resetPassword.description")}</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {password ? (
            <AlertDialogAction onClick={handleCopy}>
              {copied
                ? t("users.resetPassword.copied")
                : t("users.resetPassword.copyPassword")}
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel disabled={isLoading}>
                {t("users.resetPassword.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                {isLoading
                  ? "در حال پردازش..."
                  : t("users.resetPassword.confirm")}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
