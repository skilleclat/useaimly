import { CurrencyCode } from "../types/finance";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
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

export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  KES: 130,
  CAD: 1.36,
  NGN: 1500,
  ZAR: 18.5,
  XOF: 600,
  UGX: 3700,
  TZS: 2600,
  RWF: 1300,
};

export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode = "USD",
  toCurrency: CurrencyCode = "USD"
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = CURRENCY_RATES[fromCurrency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  const usdAmount = amount / fromRate;
  const converted = usdAmount * toRate;
  return Math.round(converted * 100) / 100;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    fromCurrency?: CurrencyCode;
  }
): string {
  const showDecimals = options?.showDecimals ?? false;
  const isCompact = options?.compact ?? false;
  const fromCurrency = options?.fromCurrency;

  const evalAmount = fromCurrency && fromCurrency !== currency
    ? convertCurrency(amount, fromCurrency, currency)
    : amount;

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (isCompact) {
    if (Math.abs(evalAmount) >= 1_000_000) {
      return `${symbol} ${(evalAmount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(evalAmount) >= 1_000) {
      return `${symbol} ${(evalAmount / 1_000).toFixed(0)}k`;
    }
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(evalAmount);

  return `${symbol} ${formattedNumber}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function detectBrowserDefaultCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";

  // 1. Timezone detection (Most accurate for physical geographic region)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Nairobi") || tz.includes("Mombasa")) return "KES";
    if (tz.includes("Kampala")) return "UGX";
    if (tz.includes("Dar_es_Salaam")) return "TZS";
    if (tz.includes("Kigali")) return "RWF";
    if (tz.includes("Lagos")) return "NGN";
    if (tz.includes("Johannesburg")) return "ZAR";
    if (tz.includes("London")) return "GBP";
    if (tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Montreal")) return "CAD";
    if (tz.includes("Abidjan") || tz.includes("Dakar") || tz.includes("Douala") || tz.includes("Bamako")) return "XOF";
    if (tz.includes("Paris") || tz.includes("Brussels") || tz.includes("Berlin") || tz.includes("Rome") || tz.includes("Madrid")) return "EUR";
  } catch (e) {
    // Fallback to navigator language
  }

  // 2. Navigator language fallback
  if (typeof navigator !== "undefined" && navigator) {
    const lang = (navigator.language || "").toLowerCase();
    if (lang.includes("ke") || lang.includes("sw")) return "KES";
    if (lang.includes("fr-ci") || lang.includes("fr-sn") || lang.includes("fr-cm") || lang.includes("fr-ga")) return "XOF";
    if (lang.includes("fr")) return "EUR";
    if (lang.includes("en-gb")) return "GBP";
    if (lang.includes("en-ca") || lang.includes("fr-ca")) return "CAD";
    if (lang.includes("ng")) return "NGN";
    if (lang.includes("za")) return "ZAR";
  }

  return "USD";
}
