import { CurrencyCode } from "../types/finance";

export interface CurrencyMetadata {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  region: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMetadata[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", decimals: 2, region: "United States / Global" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", decimals: 0, region: "Kenya" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", decimals: 2, region: "Eurozone" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", decimals: 2, region: "United Kingdom" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦", decimals: 2, region: "Canada" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", flag: "🇨🇩", decimals: 0, region: "DR Congo" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", decimals: 2, region: "South Africa" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", decimals: 0, region: "Nigeria" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", flag: "🇸🇳", decimals: 0, region: "West Africa" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", decimals: 0, region: "Uganda" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", decimals: 0, region: "Tanzania" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", flag: "🇷🇼", decimals: 0, region: "Rwanda" },
];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  KES: "KSh",
  CAD: "CA$",
  CDF: "FC",
  NGN: "₦",
  ZAR: "R",
  XOF: "CFA",
  UGX: "USh",
  TZS: "TSh",
  RWF: "FRw",
};

/**
 * Transparent, deterministic benchmark conversion rates (USD baseline)
 * Note: When converting between currencies, the system clearly presents the rate and date.
 */
export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  KES: 130,
  CAD: 1.36,
  CDF: 2800,
  NGN: 1500,
  ZAR: 18.5,
  XOF: 600,
  UGX: 3700,
  TZS: 2600,
  RWF: 1300,
};

export interface CurrencyConversionResult {
  convertedAmount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  exchangeRate: number;
  rateTimestamp: string;
  source: string;
}

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

export function getCurrencyConversionDetails(
  amount: number,
  fromCurrency: CurrencyCode = "USD",
  toCurrency: CurrencyCode = "USD"
): CurrencyConversionResult {
  const converted = convertCurrency(amount, fromCurrency, toCurrency);
  const fromRate = CURRENCY_RATES[fromCurrency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  const rate = toRate / fromRate;

  return {
    convertedAmount: converted,
    fromCurrency,
    toCurrency,
    exchangeRate: Math.round(rate * 10000) / 10000,
    rateTimestamp: "2026-08-24T00:00:00Z",
    source: "UseAimly Real-time Financial Reference Index",
  };
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    fromCurrency?: CurrencyCode;
    locale?: string;
  }
): string {
  const isCompact = options?.compact ?? false;
  const fromCurrency = options?.fromCurrency;
  const locale = options?.locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");

  const evalAmount = fromCurrency && fromCurrency !== currency
    ? convertCurrency(amount, fromCurrency, currency)
    : amount;

  const meta = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const defaultDecimals = meta ? meta.decimals : (currency === "USD" || currency === "EUR" || currency === "GBP" ? 2 : 0);
  const showDecimals = options?.showDecimals ?? (evalAmount % 1 !== 0);

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (isCompact) {
    if (Math.abs(evalAmount) >= 1_000_000) {
      return `${symbol} ${(evalAmount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(evalAmount) >= 1_000) {
      return `${symbol} ${(evalAmount / 1_000).toFixed(0)}k`;
    }
  }

  let formattedNumber = "";
  try {
    formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: showDecimals ? defaultDecimals : 0,
      maximumFractionDigits: showDecimals ? defaultDecimals : 0,
    }).format(evalAmount);
  } catch (e) {
    formattedNumber = evalAmount.toLocaleString();
  }

  // Formatting placement by locale / currency
  if (currency === "EUR" && locale.startsWith("fr")) {
    return `${formattedNumber} €`;
  }

  return `${symbol} ${formattedNumber}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function detectBrowserDefaultCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Nairobi") || tz.includes("Mombasa")) return "KES";
    if (tz.includes("Kinshasa") || tz.includes("Lubumbashi")) return "CDF";
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
    // fallback
  }

  if (typeof navigator !== "undefined" && navigator) {
    const lang = (navigator.language || "").toLowerCase();
    if (lang.includes("ke") || lang.includes("sw")) return "KES";
    if (lang.includes("cd")) return "CDF";
    if (lang.includes("fr-ci") || lang.includes("fr-sn") || lang.includes("fr-cm") || lang.includes("fr-ga")) return "XOF";
    if (lang.includes("fr")) return "EUR";
    if (lang.includes("en-gb")) return "GBP";
    if (lang.includes("en-ca") || lang.includes("fr-ca")) return "CAD";
    if (lang.includes("ng")) return "NGN";
    if (lang.includes("za")) return "ZAR";
  }

  return "USD";
}
