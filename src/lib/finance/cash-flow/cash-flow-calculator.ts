import {
  NormalizedIncomeStream,
  NormalizedExpenseItem,
  NormalizedDebtItem,
  NormalizedCommitmentItem,
  CashFlowSummary,
} from "../types";
import { calculateMonthlyGrossIncome } from "../income/income-calculator";
import {
  calculateMonthlyEssentialExpenses,
  calculateMonthlyDiscretionaryExpenses,
  calculateTotalMonthlyExpenses,
  calculateMonthlyCommitments,
} from "../expenses/expense-calculator";
import { calculateMonthlyDebtPayments } from "../debt/debt-calculator";

/**
 * Calculates complete monthly cash flow summary deterministically.
 */
export function calculateCashFlow(
  incomes: NormalizedIncomeStream[],
  expenses: NormalizedExpenseItem[],
  debts: NormalizedDebtItem[] = [],
  commitments: NormalizedCommitmentItem[] = []
): CashFlowSummary {
  const monthlyGrossIncome = calculateMonthlyGrossIncome(incomes);
  const monthlyEssentialExpenses = calculateMonthlyEssentialExpenses(expenses);
  const monthlyDiscretionaryExpenses = calculateMonthlyDiscretionaryExpenses(expenses);
  const totalMonthlyExpenses = calculateTotalMonthlyExpenses(expenses);
  const monthlyDebtPayments = calculateMonthlyDebtPayments(debts);
  const monthlyCommitments = calculateMonthlyCommitments(commitments);

  // Free Cash Flow = Gross Inflow - Total Expenses - Debt Service - Commitments
  const monthlyFreeCashFlow = Math.round(
    monthlyGrossIncome - totalMonthlyExpenses - monthlyDebtPayments - monthlyCommitments
  );

  // Savings rate = (Free Cash Flow / Gross Income) * 100
  const savingsRatePercentage =
    monthlyGrossIncome > 0
      ? Number(((Math.max(0, monthlyFreeCashFlow) / monthlyGrossIncome) * 100).toFixed(1))
      : 0;

  return {
    monthlyGrossIncome,
    monthlyEssentialExpenses,
    monthlyDiscretionaryExpenses,
    totalMonthlyExpenses,
    monthlyDebtPayments,
    monthlyCommitments,
    monthlyFreeCashFlow,
    savingsRatePercentage,
  };
}
