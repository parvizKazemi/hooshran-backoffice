import ThemeToggle from "@/components/common/ThemeToggle";
import { CacheRefreshButton } from "@/components/common/CacheRefreshButton";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ServiceDomainsButton } from "@/features/service-domains/components/ServiceDomainsButton";
import i18next from "i18next";
import * as React from "react";

export function SiteHeader() {
  const [lang, setLang] = React.useState(i18next.language);

  React.useEffect(() => {
    const handler = (lng: string) => setLang(lng);
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, []);

  const locale = lang === "fa" ? "fa-IR" : "en-US";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm">
              {new Date().toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ServiceDomainsButton />
          <CacheRefreshButton />
          <ThemeToggle />
          {/* <LanguageToggle /> */}
        </div>
      </div>
    </header>
  );
}
