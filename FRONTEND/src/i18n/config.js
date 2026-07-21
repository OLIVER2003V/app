import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import es from "./locales/es.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "language",
    },
  });

// El <html lang="..."> quedaba fijo en "es" (definido en index.html) aunque
// el usuario cambiara el sitio a inglés — mala señal de accesibilidad/SEO
// (lectores de pantalla y buscadores confían en este atributo, no en el
// idioma detectado del contenido). Lo sincronizamos con i18next.
const syncHtmlLang = (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng?.startsWith("en") ? "en" : "es";
  }
};
syncHtmlLang(i18n.resolvedLanguage || i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
