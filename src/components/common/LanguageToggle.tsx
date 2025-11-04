import { Button } from "@/components/ui/button";
import i18next from "i18next";
import * as React from "react";

export function LanguageToggle() {
  const [lang, setLang] = React.useState(i18next.language);

  React.useEffect(() => {
    const handler = (lng: string) => setLang(lng);
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, []);

  // Update document direction and lang attribute when language changes
  React.useEffect(() => {
    const html = document.documentElement;
    const dir = lang === "fa" ? "rtl" : "ltr";
    html.setAttribute("dir", dir);
    html.setAttribute("lang", lang || "en");
  }, [lang]);

  function toggle() {
    const next = lang === "fa" ? "en" : "fa";
    i18next.changeLanguage(next);
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {lang === "fa" ? "EN" : "FA"}
    </Button>
  );
}
