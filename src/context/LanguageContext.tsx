"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { en } from "@/lib/i18n/en";
import { tr } from "@/lib/i18n/tr";
import { ru } from "@/lib/i18n/ru";
import { ar } from "@/lib/i18n/ar";

type Language = "en" | "tr" | "ru" | "ar";
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr");

  const t = language === "en" ? en : language === "ru" ? ru : language === "ar" ? ar : tr;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
