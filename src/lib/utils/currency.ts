import { CurrencyCode } from "../types/finance";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  KES: "KES",
  USD: "$",
  EUR: "€",
  GBP: "£",
  UGX: "UGX",
  TZS: "TZS",
  RWF: "RWF",
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "KES",
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const showDecimals = options?.showDecimals ?? false;
  const isCompact = options?.compact ?? false;

  if (isCompact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `${CURRENCY_SYMBOLS[currency]} ${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${CURRENCY_SYMBOLS[currency]} ${(amount / 1_000).toFixed(0)}k`;
    }
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `${CURRENCY_SYMBOLS[currency]} ${formattedNumber}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
