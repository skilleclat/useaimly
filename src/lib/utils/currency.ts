import { CurrencyCode } from "../types/finance";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  KES: "KES",
  CAD: "C$",
  NGN: "₦",
  ZAR: "R",
  XOF: "CFA",
  UGX: "UGX",
  TZS: "TZS",
  RWF: "RWF",
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const showDecimals = options?.showDecimals ?? false;
  const isCompact = options?.compact ?? false;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (isCompact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${symbol} ${(amount / 1_000).toFixed(0)}k`;
    }
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `${symbol} ${formattedNumber}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function detectBrowserDefaultCurrency(): CurrencyCode {
  if (typeof window === "undefined" || !navigator) return "USD";
  const lang = (navigator.language || "").toLowerCase();

  if (lang.includes("fr") || lang.includes("fr-fr") || lang.includes("de") || lang.includes("es") || lang.includes("it")) {
    return "EUR";
  }
  if (lang.includes("en-gb")) {
    return "GBP";
  }
  if (lang.includes("en-ca") || lang.includes("fr-ca")) {
    return "CAD";
  }
  if (lang.includes("ke") || lang.includes("sw")) {
    return "KES";
  }
  if (lang.includes("ng")) {
    return "NGN";
  }
  if (lang.includes("za")) {
    return "ZAR";
  }
  if (lang.includes("ci") || lang.includes("sn") || lang.includes("cm") || lang.includes("ga")) {
    return "XOF";
  }

  return "USD";
}
