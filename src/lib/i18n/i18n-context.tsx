"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LanguageCode, TRANSLATIONS, TranslationDictionary } from "./translations";
import { detectGeoDefaults } from "./geo-detection";

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => TRANSLATIONS.en[key] || String(key),
});

const LANGUAGE_STORAGE_KEY = "useaimly_preferred_language";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
      if (stored && (stored === "en" || stored === "fr" || stored === "es")) {
        setLanguageState(stored);
      } else {
        const geo = detectGeoDefaults();
        setLanguageState(geo.suggestedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  const t = (key: keyof TranslationDictionary): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
