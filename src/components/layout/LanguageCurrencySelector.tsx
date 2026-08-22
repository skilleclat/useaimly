"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageCode } from "@/lib/i18n/translations";
import { CurrencyCode } from "@/lib/types/finance";
import { useAuth } from "@/lib/auth/auth-context";
import { Globe, DollarSign, ChevronDown, Check } from "lucide-react";

interface LanguageCurrencySelectorProps {
  currentCurrency?: CurrencyCode;
  onCurrencyChange?: (cur: CurrencyCode) => void;
}

const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "USD", label: "USD - Dollar", symbol: "$" },
  { code: "EUR", label: "EUR - Euro", symbol: "€" },
  { code: "GBP", label: "GBP - Pound", symbol: "£" },
  { code: "KES", label: "KES - Shilling", symbol: "KSh" },
  { code: "CAD", label: "CAD - Dollar", symbol: "C$" },
  { code: "NGN", label: "NGN - Naira", symbol: "₦" },
  { code: "ZAR", label: "ZAR - Rand", symbol: "R" },
  { code: "XOF", label: "XOF - Franc CFA", symbol: "CFA" },
];

export function LanguageCurrencySelector({
  currentCurrency = "USD",
  onCurrencyChange,
}: LanguageCurrencySelectorProps) {
  const { language, setLanguage } = useI18n();
  const { profile } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    (profile?.preferred_currency as CurrencyCode) || currentCurrency
  );
  const [isOpen, setIsOpen] = useState(false);

  function handleCurrencySelect(cur: CurrencyCode) {
    setSelectedCurrency(cur);
    if (onCurrencyChange) onCurrencyChange(cur);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-card text-xs font-bold text-foreground hover:border-primary/40 transition-all shadow-xs"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="uppercase">{language}</span>
        <span className="text-muted-foreground">•</span>
        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
          {selectedCurrency}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-card p-3 shadow-2xl z-50 animate-fadeIn space-y-3">
          {/* Language Selector */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block px-2">
              Language / Langue
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setLanguage("en")}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === "en" ? "bg-primary text-primary-foreground" : "bg-secondary/40 text-foreground hover:bg-secondary"
                }`}
              >
                <span>🇬🇧 English</span>
                {language === "en" && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === "fr" ? "bg-primary text-primary-foreground" : "bg-secondary/40 text-foreground hover:bg-secondary"
                }`}
              >
                <span>🇫🇷 Français</span>
                {language === "fr" && <Check className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="space-y-1 border-t border-border/60 pt-2">
            <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block px-2">
              Currency / Monnaie
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono">
              {SUPPORTED_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencySelect(c.code)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCurrency === c.code
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="font-extrabold">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
