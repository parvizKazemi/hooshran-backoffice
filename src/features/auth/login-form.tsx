import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLogin, type LoginMode } from "./hooks/use-login";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation("common");
  const {
    mode,
    setMode,
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    handleLogin,
  } = useLogin();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>
            {mode === "password"
              ? t("login.subtitlePassword")
              : t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as LoginMode)}
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-2 gap-2!">
              <TabsTrigger
                className="cursor-pointer"
                value="otp"
                disabled={loading}
              >
                {t("login.modeOtp")}
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer"
                value="password"
                disabled={loading}
              >
                {t("login.modePassword")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="phone">{t("login.phone")}</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="username"
                  placeholder={t("login.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              {mode === "password" && (
                <Field>
                  <FieldLabel htmlFor="password">
                    {t("login.password")}
                  </FieldLabel>
                  <Input
                    dir="ltr"
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
              )}

              <Field>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === "password" ? (
                    t("login.submit")
                  ) : (
                    t("login.submitOtp")
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
