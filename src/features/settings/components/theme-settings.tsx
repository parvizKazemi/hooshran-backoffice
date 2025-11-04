import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/hooks/use-theme";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ThemeSettings() {
  const { t } = useTranslation("common");
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.theme.title")}</CardTitle>
        <CardDescription>{t("settings.theme.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settings.theme.mode")}</Label>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(value) => {
                if (value) setTheme(value as "light" | "dark" | "system");
              }}
              className="w-full"
            >
              <ToggleGroupItem
                value="light"
                aria-label={t("settings.theme.light")}
                className="flex-1"
              >
                <Sun className="size-4" />
                <span>{t("settings.theme.light")}</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                aria-label={t("settings.theme.dark")}
                className="flex-1"
              >
                <Moon className="size-4" />
                <span>{t("settings.theme.dark")}</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="system"
                aria-label={t("settings.theme.system")}
                className="flex-1"
              >
                <Monitor className="size-4" />
                <span>{t("settings.theme.system")}</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
