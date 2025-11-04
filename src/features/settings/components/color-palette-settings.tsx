import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useColorPalette } from "@/hooks/use-color-palette";
import { useTranslation } from "react-i18next";

export function ColorPaletteSettings() {
  const { t } = useTranslation("common");
  const { colorPalette, setColorPalette, colorPalettes } = useColorPalette();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.colorPalette.title")}</CardTitle>
        <CardDescription>
          {t("settings.colorPalette.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* <div className="space-y-2">
            <Label>{t("settings.colorPalette.palette")}</Label>
            <Select
              value={colorPalette}
              onValueChange={(value) => setColorPalette(value as ColorPalette)}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("settings.colorPalette.selectPalette")}
                />
              </SelectTrigger>
              <SelectContent>
                {colorPalettes.map((palette) => (
                  <SelectItem key={palette.key} value={palette.key}>
                    {t(
                      `settings.colorPalette.palettes.${palette.key}`,
                      palette.name
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="rounded-lg border p-4">
            <div className="flex gap-2">
              {colorPalettes.slice(0, 4).map((palette) => (
                <div
                  key={palette.key}
                  className={`h-12 flex-1 cursor-pointer rounded-md transition-all ${
                    colorPalette === palette.key
                      ? "ring-primary ring-2 ring-offset-2"
                      : "hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: getColorPreview(palette.key),
                  }}
                  onClick={() => setColorPalette(palette.key)}
                  title={t(
                    `settings.colorPalette.palettes.${palette.key}`,
                    palette.name
                  )}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {colorPalettes.slice(4).map((palette) => (
                <div
                  key={palette.key}
                  className={`h-12 flex-1 cursor-pointer rounded-md transition-all ${
                    colorPalette === palette.key
                      ? "ring-primary ring-2 ring-offset-2"
                      : "hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: getColorPreview(palette.key),
                  }}
                  onClick={() => setColorPalette(palette.key)}
                  title={t(
                    `settings.colorPalette.palettes.${palette.key}`,
                    palette.name
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getColorPreview(palette: string): string {
  const colors: Record<string, string> = {
    default: "#737373",
    blue: "#3b82f6",
    green: "#22c55e",
    orange: "#f97316",
    red: "#ef4444",
    rose: "#f43f5e",
    violet: "#8b5cf6",
    yellow: "#eab308",
  };
  return colors[palette] ?? (colors.default as string);
}
