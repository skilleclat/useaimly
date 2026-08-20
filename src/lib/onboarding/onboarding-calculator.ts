import { OnboardingState, OnboardingCalculatedPath } from "./onboarding-types";
import { addMonths, differenceInMonths, formatDateToISO, parseDate } from "@/lib/utils/date";

export function normalizeToMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case "MONTHLY":
      return amount;
    case "ANNUAL":
      return amount / 12;
    case "WEEKLY":
      return (amount * 52) / 12;
    case "BI_WEEKLY":
      return (amount * 26) / 12;
    case "TERM": // 3 terms per school year
      return (amount * 3) / 12;
    case "ONE_OFF":
      return 0;
    default:
      return amount;
  }
}

export function calculateOnboardingPath(state: OnboardingState, referenceDate: Date = new Date()): OnboardingCalculatedPath {
  // 1. Monthly Gross Income
  const monthlyGrossIncome = state.income.reduce((sum, item) => {
    return sum + normalizeToMonthly(item.amount, item.frequency);
  }, 0);

  // 2. Monthly Essential Expenses
  const monthlyEssentialExpenses = state.expenses.reduce((sum, item) => {
    return sum + normalizeToMonthly(item.amount, item.frequency);
  }, 0);

  // 3. Monthly Debt Payments
  const monthlyDebtPayments = state.hasDebt
    ? state.debts.reduce((sum, item) => sum + (item.monthlyPayment || 0), 0)
    : 0;

  // 4. Monthly Commitments Amortized
  const monthlyCommitmentsAmortized = state.commitments.reduce((sum, item) => {
    return sum + normalizeToMonthly(item.amount, item.frequency);
  }, 0);

  // 5. Monthly Free Cash Flow
  const monthlyFreeCashFlow = Math.round(
    monthlyGrossIncome - monthlyEssentialExpenses - monthlyDebtPayments - monthlyCommitmentsAmortized
  );

  // 6. Savings & Goal Capital Breakdown
  const totalLiquidSavings = state.savings.reduce((sum, acc) => sum + acc.balance, 0);

  const assignedAccountsCapital = state.savings
    .filter((acc) => acc.isAssignedToPrimaryGoal)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const assignedGoalCapital = Math.max(state.destination.currentAmount, assignedAccountsCapital);
  const unallocatedLiquidCash = Math.max(0, totalLiquidSavings - assignedGoalCapital);

  // 7. Remaining Shortfall
  const remainingShortfall = Math.max(0, state.destination.targetAmount - assignedGoalCapital);

  // 8. Months to Target Date
  const targetDateObj = state.destination.targetDate
    ? parseDate(state.destination.targetDate)
    : addMonths(referenceDate, 24);

  const diffMonths = differenceInMonths(targetDateObj, referenceDate);
  const monthsToTargetDate = Math.max(1, diffMonths);

  // 9. Required Monthly Contribution
  const requiredMonthlySavings = Math.round(remainingShortfall / monthsToTargetDate);

  // 10. Projected Arrival Date
  let projectedMonthsToCompletion = monthsToTargetDate;
  let projectedCompletionDate = formatDateToISO(targetDateObj);

  if (remainingShortfall === 0) {
    projectedMonthsToCompletion = 0;
    projectedCompletionDate = formatDateToISO(referenceDate);
  } else if (monthlyFreeCashFlow > 0) {
    projectedMonthsToCompletion = Math.ceil(remainingShortfall / monthlyFreeCashFlow);
    const projectedDate = addMonths(referenceDate, projectedMonthsToCompletion);
    projectedCompletionDate = formatDateToISO(projectedDate);
  } else {
    // Negative or zero cash flow means goal cannot be reached at current trajectory
    projectedMonthsToCompletion = 999;
    projectedCompletionDate = "Trajectory does not arrive";
  }

  // 11. Pace Ratio & Trajectory State
  const paceRatio = requiredMonthlySavings > 0
    ? Number((monthlyFreeCashFlow / requiredMonthlySavings).toFixed(2))
    : 1;

  let trajectoryState: "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "AHEAD" = "ON_TRACK";

  if (remainingShortfall === 0) {
    trajectoryState = "AHEAD";
  } else if (monthlyFreeCashFlow <= 0) {
    trajectoryState = "OFF_TRACK";
  } else if (monthlyFreeCashFlow >= requiredMonthlySavings) {
    if (monthlyFreeCashFlow >= requiredMonthlySavings * 1.25) {
      trajectoryState = "AHEAD";
    } else {
      trajectoryState = "ON_TRACK";
    }
  } else {
    // Has positive cashflow but below required pace
    trajectoryState = "AT_RISK";
  }

  return {
    monthlyGrossIncome,
    monthlyEssentialExpenses,
    monthlyDebtPayments,
    monthlyCommitmentsAmortized,
    monthlyFreeCashFlow,
    totalLiquidSavings,
    assignedGoalCapital,
    unallocatedLiquidCash,
    remainingShortfall,
    monthsToTargetDate,
    requiredMonthlySavings,
    projectedMonthsToCompletion,
    projectedCompletionDate,
    trajectoryState,
    paceRatio,
  };
}
