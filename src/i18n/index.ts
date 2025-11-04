import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en/common.json";
import fa from "@/locales/fa/common.json";

const resources = {
  en: { common: en },
  fa: { common: fa },
} as const;

function getInitialLang(): "en" | "fa" {
  const saved = localStorage.getItem("lang");
  if (saved === "fa" || saved === "en") return saved;
  // Default to Persian (fa)
  return "fa";
}

function applyDir(lang: string) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang);
}

const initialLang = getInitialLang();
applyDir(initialLang);

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: "fa",
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })
  .then(() => applyDir(i18next.language));

i18next.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  applyDir(lng);
});

export default i18next;
