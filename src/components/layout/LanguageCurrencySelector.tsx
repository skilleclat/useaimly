"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageCode } from "@/lib/i18n/translations";
import { useCurrency } from "@/lib/currency/currency-context";
import { CurrencyCode } from "@/lib/types/finance";
import { SUPPORTED_CURRENCIES } from "@/lib/utils/currency";
import { Globe, ChevronDown, Check } from "lucide-react";

export function LanguageCurrencySelector() {
  const { language, setLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  ];

  function handleLanguageSelect(lang: LanguageCode) {
    setLanguage(lang);
    setIsOpen(false);
  }

  function handleCurrencySelect(cur: CurrencyCode) {
    setCurrency(cur);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block text-left font-sans">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-card text-xs font-bold text-foreground hover:border-primary/40 transition-all shadow-xs cursor-pointer min-h-[36px]"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="uppercase font-mono">{language}</span>
        <span className="text-muted-foreground">•</span>
        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
          {currency}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
      </button>

      {/* Dropdown Modal & Outside Click Backdrop */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-card p-3 shadow-2xl z-50 animate-fadeIn space-y-3 font-sans text-left">
            {/* Language Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block px-2">
                Language / Lugha
              </span>
              <div className="grid grid-cols-1 gap-1">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleLanguageSelect(l.code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      language === l.code
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/40 text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{l.flag} {l.label}</span>
                    {language === l.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1 border-t border-border/60 pt-2">
              <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block px-2">
                Preferred Currency / Sarafu
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencySelect(c.code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      currency === c.code
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <span>{c.flag} {c.code} - {c.name}</span>
                    <span className="font-extrabold">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
