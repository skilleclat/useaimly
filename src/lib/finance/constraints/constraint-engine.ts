import {
  BaselineFinancialProfile,
  ConstraintEvaluationResult,
  ConstraintSeverity,
} from "../types";
import { formatCurrency } from "@/lib/utils/currency";

export interface ConstraintCheckInput {
  baselineProfile: BaselineFinancialProfile;
  decisionAmount: number;
  isRecurring: boolean;
  postDecisionLiquidSavings: number;
  postDecisionFreeCashFlow: number;
  monthlyFixedObligations: number;
  delayInDays: number;
  targetReserveMonths?: number; // default 3.0
}

export function evaluateFinancialConstraints(
  input: ConstraintCheckInput
): ConstraintEvaluationResult[] {
  const {
    baselineProfile,
    decisionAmount,
    isRecurring,
    postDecisionLiquidSavings,
    postDecisionFreeCashFlow,
    monthlyFixedObligations,
    delayInDays,
    targetReserveMonths = 3.0,
  } = input;

  const results: ConstraintEvaluationResult[] = [];
  const currency = "KES";

  // 1. Emergency Reserve Floor Shield Rule (User Rule Target: 3.0 Months)
  const requiredReserve = monthlyFixedObligations * targetReserveMonths;
  const currentReserveMonths =
    monthlyFixedObligations > 0
      ? Number((postDecisionLiquidSavings / monthlyFixedObligations).toFixed(1))
      : 12;

  if (postDecisionLiquidSavings < requiredReserve) {
    const reserveGap = requiredReserve - postDecisionLiquidSavings;
    const severity: ConstraintSeverity =
      currentReserveMonths < 1.5 ? "HARD_BLOCKER" : "SOFT_WARNING";

    results.push({
      ruleName: "Emergency Reserve Floor Shield (3.0 Months Target)",
      thresholdValue: `${formatCurrency(requiredReserve, currency)} (${targetReserveMonths.toFixed(1)} mos)`,
      currentValue: `${formatCurrency(postDecisionLiquidSavings, currency)} (${currentReserveMonths} mos)`,
      status: currentReserveMonths < 1.0 ? "VIOLATED" : "BELOW_TARGET",
      gap: `${formatCurrency(reserveGap, currency)}`,
      severity,
      consequence: `Post-decision liquid reserve provides only ${currentReserveMonths} months of mandatory living buffer, breaching the configured ${targetReserveMonths.toFixed(1)}-month safety floor.`,
    });
  } else {
    results.push({
      ruleName: "Emergency Reserve Floor Shield (3.0 Months Target)",
      thresholdValue: `${formatCurrency(requiredReserve, currency)} (${targetReserveMonths.toFixed(1)} mos)`,
      currentValue: `${formatCurrency(postDecisionLiquidSavings, currency)} (${currentReserveMonths} mos)`,
      status: "SATISFIED",
      gap: 0,
      severity: "OPTIMIZATION",
      consequence: "Emergency reserve buffer remains at or above configured target threshold.",
    });
  }

  // 2. Positive Monthly Cash Flow Rule
  if (postDecisionFreeCashFlow < 0) {
    const deficit = Math.abs(postDecisionFreeCashFlow);
    results.push({
      ruleName: "Positive Cash Flow Protection",
      thresholdValue: "KES 0 / mo",
      currentValue: `-${formatCurrency(deficit, currency)} / mo`,
      status: "VIOLATED",
      gap: `${formatCurrency(deficit, currency)} / mo`,
      severity: "HARD_BLOCKER",
      consequence: "Decision creates an ongoing monthly deficit that drains liquid reserves every month.",
    });
  } else {
    results.push({
      ruleName: "Positive Cash Flow Protection",
      thresholdValue: "KES 0 / mo",
      currentValue: `${formatCurrency(postDecisionFreeCashFlow, currency)} / mo`,
      status: "SATISFIED",
      gap: 0,
      severity: "OPTIMIZATION",
      consequence: "Monthly free cash flow remains positive.",
    });
  }

  // 3. Physical Liquidity Overdraft Rule
  if (postDecisionLiquidSavings < 0) {
    const overdraft = Math.abs(postDecisionLiquidSavings);
    results.push({
      ruleName: "Zero Overdraft Liquidity Requirement",
      thresholdValue: "KES 0",
      currentValue: `-${formatCurrency(overdraft, currency)}`,
      status: "VIOLATED",
      gap: `${formatCurrency(overdraft, currency)}`,
      severity: "HARD_BLOCKER",
      consequence: "Decision exceeds total liquid cash reserves, creating an immediate overdraft.",
    });
  }

  // 4. Primary Goal Trajectory Impact Rule (Delay Threshold: 60 Days)
  if (delayInDays > 60) {
    results.push({
      ruleName: "Primary Goal Delay Threshold (Max 60 Days)",
      thresholdValue: "60 Days Shift",
      currentValue: `${delayInDays} Days Shift`,
      status: "BELOW_TARGET",
      gap: `${delayInDays - 60} Days`,
      severity: delayInDays > 180 ? "HARD_BLOCKER" : "SOFT_WARNING",
      consequence: `Decision delays primary goal arrival date by ${delayInDays} days (${Math.round(delayInDays / 30)} months).`,
    });
  }

  return results;
}
