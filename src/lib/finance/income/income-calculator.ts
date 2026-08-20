import { NormalizedIncomeStream } from "../types";
import { normalizeToMonthly } from "../normalization/frequency-normalizer";

/**
 * Calculates total gross monthly income across all active income streams.
 */
export function calculateMonthlyGrossIncome(incomes: NormalizedIncomeStream[]): number {
  if (!incomes || !Array.isArray(incomes) || incomes.length === 0) {
    return 0;
  }

  return incomes
    .filter((stream) => stream.isActive !== false)
    .reduce((sum, stream) => {
      return sum + normalizeToMonthly(stream.amount, stream.frequency);
    }, 0);
}

/**
 * Calculates predictable stable monthly income (e.g. permanent salaries, verified contracts).
 */
export function calculateStableIncome(incomes: NormalizedIncomeStream[]): number {
  if (!incomes || !Array.isArray(incomes) || incomes.length === 0) {
    return 0;
  }

  return incomes
    .filter((stream) => stream.isActive !== false && stream.reliability === "STABLE")
    .reduce((sum, stream) => {
      return sum + normalizeToMonthly(stream.amount, stream.frequency);
    }, 0);
}

/**
 * Calculates variable monthly income (e.g. freelance, sales commissions, seasonal bonuses).
 */
export function calculateVariableIncome(incomes: NormalizedIncomeStream[]): number {
  if (!incomes || !Array.isArray(incomes) || incomes.length === 0) {
    return 0;
  }

  return incomes
    .filter((stream) => stream.isActive !== false && stream.reliability === "VARIABLE")
    .reduce((sum, stream) => {
      return sum + normalizeToMonthly(stream.amount, stream.frequency);
    }, 0);
}

/**
 * Calculates the volatility ratio of income (0 = 100% stable, 1 = 100% variable).
 */
export function calculateIncomeVolatilityRatio(incomes: NormalizedIncomeStream[]): number {
  const total = calculateMonthlyGrossIncome(incomes);
  if (total <= 0) return 1; // No income is considered high vulnerability
  const variable = calculateVariableIncome(incomes);
  return Number((variable / total).toFixed(4));
}
