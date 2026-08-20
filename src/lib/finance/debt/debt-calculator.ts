import { NormalizedDebtItem } from "../types";

/**
 * Calculates total remaining debt balance across all loans and liabilities.
 */
export function calculateTotalDebtBalance(debts: NormalizedDebtItem[]): number {
  if (!debts || !Array.isArray(debts) || debts.length === 0) {
    return 0;
  }

  return debts.reduce((sum, d) => sum + (d.currentBalance || 0), 0);
}

/**
 * Calculates total monthly debt service payments.
 */
export function calculateMonthlyDebtPayments(debts: NormalizedDebtItem[]): number {
  if (!debts || !Array.isArray(debts) || debts.length === 0) {
    return 0;
  }

  return debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
}

/**
 * Calculates Debt-To-Income (DTI) ratio percentage.
 * DTI = (Monthly Debt Payments / Monthly Gross Income) * 100
 */
export function calculateDebtToIncomeRatio(
  debts: NormalizedDebtItem[],
  monthlyGrossIncome: number
): number {
  if (!monthlyGrossIncome || monthlyGrossIncome <= 0) {
    const totalPayments = calculateMonthlyDebtPayments(debts);
    return totalPayments > 0 ? 100 : 0;
  }

  const monthlyDebt = calculateMonthlyDebtPayments(debts);
  return Number(((monthlyDebt / monthlyGrossIncome) * 100).toFixed(2));
}

/**
 * Estimates months to pay off a debt given its balance, interest rate, and monthly payment.
 */
export function calculateEstimatedDebtPayoffMonths(debt: NormalizedDebtItem): number {
  const { currentBalance, monthlyPayment, interestRate } = debt;

  if (!currentBalance || currentBalance <= 0) return 0;
  if (!monthlyPayment || monthlyPayment <= 0) return 999;

  // Simple amortization / standard formula
  if (!interestRate || interestRate <= 0) {
    return Math.ceil(currentBalance / monthlyPayment);
  }

  const monthlyRate = interestRate / 100 / 12;
  const interestCharge = currentBalance * monthlyRate;

  // If monthly payment doesn't even cover the interest, debt grows indefinitely
  if (monthlyPayment <= interestCharge) {
    return 999;
  }

  // n = -ln(1 - (r * P) / A) / ln(1 + r)
  const n = -Math.log(1 - (monthlyRate * currentBalance) / monthlyPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(n);
}
