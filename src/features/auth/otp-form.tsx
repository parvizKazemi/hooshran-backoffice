import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOtp } from "./hooks/use-otp";

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const { t } = useTranslation("common");
  const { otp, setOtp, loading, handleVerify } = useOtp();
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{t("otp.title")}</CardTitle>
        <CardDescription>{t("otp.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">{t("otp.codeLabel")}</FieldLabel>
              <InputOTP
                maxLength={5}
                id="otp"
                value={otp}
                onChange={setOtp}
                required
                disabled={loading}
              >
                <InputOTPGroup
                  dir="ltr"
                  className="mx-auto gap-4 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
                >
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>{t("otp.codeHelp")}</FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("otp.verify")
                )}
              </Button>
              <FieldDescription className="text-center">
                {t("otp.notReceived")} <a href="#">{t("otp.resend")}</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
