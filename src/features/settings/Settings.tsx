import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { ColorPaletteSettings } from "./components/color-palette-settings";
import { LanguageSettings } from "./components/language-settings";
import { ThemeSettings } from "./components/theme-settings";

export default function Settings() {
  const { t } = useTranslation("common");

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" side="right" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
