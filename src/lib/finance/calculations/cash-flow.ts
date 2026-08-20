/**
 * Deterministic Cash Flow Calculation Engine
 * Pure TypeScript, zero side-effects.
 */

import { CashFlowItem, CashFlowSummary, FinancialProfile, Frequency } from "../../types/finance";
import { roundTo } from "../../utils/math";

export function normalizeToMonthly(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case "ANNUAL":
      return amount / 12;
    case "BI_WEEKLY":
      return (amount * 26) / 12;
    case "WEEKLY":
      return (amount * 52) / 12;
    case "ONE_OFF":
      return 0; // One-off items are handled in balance/decision ledger, not recurring monthly cash flow
    case "MONTHLY":
    default:
      return amount;
  }
}

export function calculateCashFlowSummary(items: CashFlowItem[]): CashFlowSummary {
  let monthlyGrossIncome = 0;
  let monthlyFixedExpenses = 0;
  let monthlyVariableExpenses = 0;
  let monthlyDebtService = 0;

  for (const item of items) {
    const monthlyAmount = normalizeToMonthly(item.amount, item.frequency);
    
    switch (item.type) {
      case "INCOME":
        monthlyGrossIncome += monthlyAmount;
        break;
      case "FIXED_EXPENSE":
        monthlyFixedExpenses += monthlyAmount;
        break;
      case "VARIABLE_EXPENSE":
        monthlyVariableExpenses += monthlyAmount;
        break;
      case "DEBT_SERVICE":
        monthlyDebtService += monthlyAmount;
        break;
    }
  }

  const monthlyNetIncome = monthlyGrossIncome; // Can support tax deduction schedules
  const monthlyTotalExpenses = monthlyFixedExpenses + monthlyVariableExpenses + monthlyDebtService;
  const monthlyFreeCashFlow = Math.max(0, monthlyNetIncome - monthlyTotalExpenses);
  const savingsRate = monthlyNetIncome > 0 ? (monthlyFreeCashFlow / monthlyNetIncome) : 0;
  const discretionaryIncome = Math.max(0, monthlyNetIncome - monthlyFixedExpenses - monthlyDebtService);

  return {
    monthlyGrossIncome: roundTo(monthlyGrossIncome),
    monthlyNetIncome: roundTo(monthlyNetIncome),
    monthlyFixedExpenses: roundTo(monthlyFixedExpenses),
    monthlyVariableExpenses: roundTo(monthlyVariableExpenses),
    monthlyTotalExpenses: roundTo(monthlyTotalExpenses),
    monthlyDebtService: roundTo(monthlyDebtService),
    monthlyFreeCashFlow: roundTo(monthlyFreeCashFlow),
    savingsRate: roundTo(savingsRate, 4),
    discretionaryIncome: roundTo(discretionaryIncome),
  };
}
