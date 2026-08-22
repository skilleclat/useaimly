"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CurrencyCode } from "@/lib/types/finance";
import { formatCurrency, convertCurrency, detectBrowserDefaultCurrency } from "@/lib/utils/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  format: (amount: number, options?: { showDecimals?: boolean; compact?: boolean; fromCurrency?: CurrencyCode }) => string;
  convert: (amount: number, fromCurrency?: CurrencyCode, toCurrency?: CurrencyCode) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  format: (amount, options) => formatCurrency(amount, "USD", options),
  convert: (amount, from = "USD", to = "USD") => convertCurrency(amount, from, to),
});

const CURRENCY_STORAGE_KEY = "useaimly_preferred_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      if (stored) {
        setCurrencyState(stored);
      } else {
        const detected = detectBrowserDefaultCurrency();
        setCurrencyState(detected);
      }
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    }
  };

  const format = (amount: number, options?: { showDecimals?: boolean; compact?: boolean; fromCurrency?: CurrencyCode }) => {
    return formatCurrency(amount, currency, options);
  };

  const convert = (amount: number, fromCurrency: CurrencyCode = "USD", toCurrency: CurrencyCode = currency) => {
    return convertCurrency(amount, fromCurrency, toCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
