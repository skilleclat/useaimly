"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageCode } from "@/lib/i18n/translations";
import { useCurrency } from "@/lib/currency/currency-context";
import { CurrencyCode } from "@/lib/types/finance";
import { SUPPORTED_CURRENCIES } from "@/lib/utils/currency";
import { Globe, ChevronDown, Check, Sparkles } from "lucide-react";

interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  badge: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", badge: "EN" },
  { code: "fr", label: "French", nativeLabel: "Français", badge: "FR" },
  { code: "es", label: "Spanish", nativeLabel: "Español", badge: "ES" },
];

export function LanguageCurrencySelector() {
  const { language, setLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFr = language === "fr";
  const isEs = language === "es";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const currentCur = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  function handleLanguageSelect(lang: LanguageCode) {
    setLanguage(lang);
  }

  function handleCurrencySelect(cur: CurrencyCode) {
    setCurrency(cur);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block text-left font-sans" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:border-[#FF5533]/50 text-xs font-semibold text-foreground transition-all shadow-xs cursor-pointer min-h-[38px]"
      >
        <Globe className="w-3.5 h-3.5 text-[#FF5533] shrink-0" />
        <span className="font-mono font-bold tracking-wide uppercase text-foreground">
          {currentLang.badge}
        </span>
        <span className="text-muted-foreground/60 text-[10px]">•</span>
        <span className="font-mono font-bold text-foreground">
          {currentCur.code}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {currentCur.symbol}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>

      {/* 100% Solid Opaque Dropdown Menu (No Transparency, No bleed-through) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-white dark:bg-[#141416] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-fadeIn space-y-4 text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
            <span className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#FF5533]" />
              <span>{isEs ? "Idioma y Moneda" : isFr ? "Langue & Devise" : "Language & Currency"}</span>
            </span>
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase">
              {isEs ? "Preferencias" : isFr ? "Préférences" : "Preferences"}
            </span>
          </div>

          {/* 1. Language Selection Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
              {isEs ? "Idioma de la interfaz" : isFr ? "Langue d'affichage" : "Display Language"}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {LANGUAGES.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleLanguageSelect(l.code)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FF5533]/15 border-[#FF5533] text-foreground font-bold shadow-xs"
                        : "bg-secondary/60 hover:bg-secondary border-border/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-[11px] font-mono font-black block text-[#FF5533]">
                      {l.badge}
                    </span>
                    <span className="text-xs font-medium block truncate w-full mt-0.5">
                      {l.nativeLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Currency Selection List */}
          <div className="space-y-2 border-t border-border/80 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block">
                {isEs ? "Moneda de cálculo" : isFr ? "Devise de calcul" : "Calculation Currency"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {SUPPORTED_CURRENCIES.length} {isEs ? "monedas" : isFr ? "devises" : "available"}
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(155,155,155,0.3)_transparent]">
              {SUPPORTED_CURRENCIES.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCurrencySelect(c.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FF5533]/15 border border-[#FF5533] text-foreground font-bold shadow-xs"
                        : "hover:bg-secondary/70 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-foreground text-xs w-8 text-left">
                        {c.code}
                      </span>
                      <span className="text-xs font-medium truncate max-w-[140px] text-foreground/90">
                        {c.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border/60">
                        {c.symbol}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#FF5533]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-border/80 text-[10px] font-mono text-muted-foreground text-center">
            <span>
              {isEs
                ? "Conversión determinista en tiempo real"
                : isFr
                ? "Conversion déterministe en temps réel"
                : "Deterministic real-time conversion"}
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
