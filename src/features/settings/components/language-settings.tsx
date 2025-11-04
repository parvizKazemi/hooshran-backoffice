import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import i18next from "i18next";
import { Languages } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

export function LanguageSettings() {
  const { t } = useTranslation("common");
  const [lang, setLang] = React.useState(i18next.language);

  React.useEffect(() => {
    const handler = (lng: string) => setLang(lng);
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, []);

  const handleLanguageChange = (lang: "fa" | "en") => {
    i18next.changeLanguage(lang);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.language.title")}</CardTitle>
        <CardDescription>{t("settings.language.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {/* <Label>{t("settings.language.language")}</Label> */}
            <ToggleGroup
              type="single"
              value={lang}
              onValueChange={(value) => {
                if (value === "fa" || value === "en") {
                  handleLanguageChange(value);
                }
              }}
              className="w-full"
            >
              <ToggleGroupItem
                value="fa"
                aria-label={t("settings.language.persian")}
                className="flex-1"
              >
                <Languages className="size-4" />
                <span>{t("settings.language.persian")}</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="en"
                aria-label={t("settings.language.english")}
                className="flex-1"
              >
                <Languages className="size-4" />
                <span>{t("settings.language.english")}</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
