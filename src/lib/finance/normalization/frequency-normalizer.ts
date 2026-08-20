import { CalculationFrequency } from "../types";

/**
 * Deterministic frequency normalization.
 * Converts any periodic cash flow into exact monthly equivalent.
 */
export function normalizeToMonthly(amount: number, frequency: CalculationFrequency | string): number {
  if (!amount || isNaN(amount) || amount === 0) {
    return 0;
  }

  const normalizedFreq = (frequency || "MONTHLY").toUpperCase().replace("-", "_");

  switch (normalizedFreq) {
    case "DAILY":
      // Average 365 / 12 = 30.416667 days per month
      return (amount * 365) / 12;

    case "WEEKLY":
      // 52 weeks per year / 12 months
      return (amount * 52) / 12;

    case "BIWEEKLY":
    case "BI_WEEKLY":
      // 26 fortnights per year / 12 months
      return (amount * 26) / 12;

    case "MONTHLY":
      return amount;

    case "QUARTERLY":
      // 4 quarters per year / 12 months = 1/3
      return amount / 3;

    case "YEARLY":
    case "ANNUAL":
      return amount / 12;

    case "TERM":
      // 3 school terms per year / 12 months
      return (amount * 3) / 12;

    case "ONE_OFF":
      // One-off items are not ongoing monthly recurring
      return 0;

    case "IRREGULAR":
    default:
      return amount;
  }
}

/**
 * Converts a monthly amount into an equivalent periodic frequency amount.
 */
export function fromMonthly(monthlyAmount: number, frequency: CalculationFrequency | string): number {
  if (!monthlyAmount || isNaN(monthlyAmount) || monthlyAmount === 0) {
    return 0;
  }

  const normalizedFreq = (frequency || "MONTHLY").toUpperCase().replace("-", "_");

  switch (normalizedFreq) {
    case "DAILY":
      return (monthlyAmount * 12) / 365;
    case "WEEKLY":
      return (monthlyAmount * 12) / 52;
    case "BIWEEKLY":
    case "BI_WEEKLY":
      return (monthlyAmount * 12) / 26;
    case "MONTHLY":
      return monthlyAmount;
    case "QUARTERLY":
      return monthlyAmount * 3;
    case "YEARLY":
    case "ANNUAL":
      return monthlyAmount * 12;
    case "TERM":
      return (monthlyAmount * 12) / 3;
    case "ONE_OFF":
      return monthlyAmount;
    default:
      return monthlyAmount;
  }
}
