import { NormalizedExpenseItem, NormalizedCommitmentItem } from "../types";
import { normalizeToMonthly } from "../normalization/frequency-normalizer";

/**
 * Calculates total monthly recurring expenses.
 */
export function calculateTotalMonthlyExpenses(expenses: NormalizedExpenseItem[]): number {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return 0;
  }

  return expenses.reduce((sum, item) => {
    return sum + normalizeToMonthly(item.amount, item.frequency);
  }, 0);
}

/**
 * Calculates essential / fixed living expenses (rent, food, utilities, health, child care).
 */
export function calculateMonthlyEssentialExpenses(expenses: NormalizedExpenseItem[]): number {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return 0;
  }

  return expenses
    .filter((item) => item.isFixed !== false)
    .reduce((sum, item) => {
      return sum + normalizeToMonthly(item.amount, item.frequency);
    }, 0);
}

/**
 * Calculates discretionary / flexible expenses (dining out, entertainment, travel, luxury).
 */
export function calculateMonthlyDiscretionaryExpenses(expenses: NormalizedExpenseItem[]): number {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return 0;
  }

  return expenses
    .filter((item) => item.isFixed === false)
    .reduce((sum, item) => {
      return sum + normalizeToMonthly(item.amount, item.frequency);
    }, 0);
}

/**
 * Calculates monthly amortized commitments (e.g. school fees, annual motor/health insurance).
 */
export function calculateMonthlyCommitments(commitments: NormalizedCommitmentItem[]): number {
  if (!commitments || !Array.isArray(commitments) || commitments.length === 0) {
    return 0;
  }

  return commitments.reduce((sum, item) => {
    return sum + normalizeToMonthly(item.amount, item.frequency);
  }, 0);
}

/**
 * Calculates a breakdown of expenses grouped by category.
 */
export function calculateExpenseBreakdown(
  expenses: NormalizedExpenseItem[]
): Record<string, { totalMonthly: number; percentage: number }> {
  const total = calculateTotalMonthlyExpenses(expenses);
  const result: Record<string, { totalMonthly: number; percentage: number }> = {};

  if (total === 0) return result;

  for (const item of expenses) {
    const cat = item.category || "OTHER";
    const monthlyAmt = normalizeToMonthly(item.amount, item.frequency);
    if (!result[cat]) {
      result[cat] = { totalMonthly: 0, percentage: 0 };
    }
    result[cat].totalMonthly += monthlyAmt;
  }

  for (const cat in result) {
    result[cat].percentage = Number(((result[cat].totalMonthly / total) * 100).toFixed(1));
  }

  return result;
}
