import { BaselineFinancialProfile } from "../types";
import { formatCurrency } from "@/lib/utils/currency";
import { addMonths, formatDateToISO } from "@/lib/utils/date";

export interface FreedomClockResult {
  currentFreedomDate: string; // ISO date format (e.g. 2031-10-14)
  formattedFreedomDate: string; // Human readable (e.g. 14 Oct 2031)
  newFreedomDate: string;
  formattedNewFreedomDate: string;
  lifeTimeCostDays: number;
  formattedLifeTimeCost: string; // e.g. "84 jours de liberté" / "84 days of freedom"
  roiMultiplier: number; // e.g. 266
  savedMoneyEstimate: number; // e.g. 2400 USD / KES equivalent
}

/**
 * Calculates Elon Musk-grade Freedom Clock metrics:
 * 1. Freedom Date (Financial Independence Arrival)
 * 2. Life Time Cost (Amount / Daily Free Cash Flow)
 * 3. Subscription ROI Multiplier (Avoided impulse spend vs $9/mo cost)
 */
export function calculateFreedomClock(
  baseline: BaselineFinancialProfile,
  decisionAmount: number,
  isFr: boolean = false,
  referenceDate: Date = new Date()
): FreedomClockResult {
  // Compute monthly inflow & outflow
  const monthlyInflow = baseline.incomes.reduce((acc, i) => acc + (i.isActive ? i.amount : 0), 0);
  const monthlyOutflow = baseline.expenses.reduce((acc, e) => acc + e.amount, 0);
  const monthlyFreeCashFlow = Math.max(1, monthlyInflow - monthlyOutflow);

  const dailyFreeCashFlow = Math.max(1, monthlyFreeCashFlow / 30);

  // Compute primary target goal
  const primaryGoal = baseline.goals.length > 0 ? baseline.goals[0] : null;
  const targetAmount = primaryGoal ? primaryGoal.targetAmount : 500000;
  const currentAmount = primaryGoal ? primaryGoal.currentAmount : baseline.liquidSavings;

  const remainingTarget = Math.max(0, targetAmount - currentAmount);
  const monthsToTarget = Math.ceil(remainingTarget / monthlyFreeCashFlow);

  // Current Baseline Freedom Date
  const currentFreedomObj = addMonths(referenceDate, monthsToTarget);
  const currentFreedomDate = formatDateToISO(currentFreedomObj);

  // Life Time Cost in Days (Decision Amount / Daily Free Cash Flow)
  const lifeTimeCostDays = Math.max(1, Math.round(decisionAmount / dailyFreeCashFlow));

  // Months shift due to decision
  const monthsShift = Math.ceil(decisionAmount / monthlyFreeCashFlow);
  const newFreedomObj = addMonths(currentFreedomObj, monthsShift);
  const newFreedomDate = formatDateToISO(newFreedomObj);

  // Format Dates
  const formatDateHuman = (d: Date) => {
    return d.toLocaleDateString(isFr ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formattedFreedomDate = formatDateHuman(currentFreedomObj);
  const formattedNewFreedomDate = formatDateHuman(newFreedomObj);

  const formattedLifeTimeCost = isFr
    ? `${lifeTimeCostDays} jours de travail & liberté`
    : `${lifeTimeCostDays} days of labor & freedom`;

  // ROI Calculation ($9/mo = $108/yr. Average avoided bad decision = $2,400+)
  const avoidedMistakeSavings = Math.max(2400, Math.round(decisionAmount * 0.4));
  const annualSubscriptionCost = 108;
  const roiMultiplier = Math.max(10, Math.round(avoidedMistakeSavings / annualSubscriptionCost));

  return {
    currentFreedomDate,
    formattedFreedomDate,
    newFreedomDate,
    formattedNewFreedomDate,
    lifeTimeCostDays,
    formattedLifeTimeCost,
    roiMultiplier,
    savedMoneyEstimate: avoidedMistakeSavings,
  };
}
