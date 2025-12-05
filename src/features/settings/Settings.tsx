import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { ColorPaletteSettings } from "./components/color-palette-settings";
import { LanguageSettings } from "./components/language-settings";
import { ThemeSettings } from "./components/theme-settings";

export default function Settings() {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("settings.description")}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ThemeSettings />
        <Separator />
        <ColorPaletteSettings />
        <Separator />
        <LanguageSettings />
      </div>
    </div>
  );
}
