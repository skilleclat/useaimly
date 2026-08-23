import { BaselineFinancialProfile } from "./types";
import { calculateMaxSafePrice } from "./max-safe-price";
import { calculateCashFlow } from "./cash-flow/cash-flow-calculator";

export interface AlternativeOption {
  id: string;
  title: string;
  subtitle: string;
  suggestedAmount: number;
  monthlyPayment: number;
  goalDelayDays: number;
  safetyRating: "SAFE" | "MANAGEABLE" | "OPTIMAL";
  explanation: string;
  actionText: string;
}

/**
 * Generates concrete, safe alternatives when a decision is risky or requires adjustment.
 */
export function generateBetterAlternatives(
  baseline: BaselineFinancialProfile,
  requestedAmount: number,
  decisionTitle: string = "Purchase"
): AlternativeOption[] {
  const safeBounds = calculateMaxSafePrice(baseline, requestedAmount);
  const cashFlow = calculateCashFlow(
    baseline.incomes,
    baseline.expenses,
    baseline.debts,
    baseline.commitments
  );

  const alternatives: AlternativeOption[] = [];

  // 1. Lower Purchase Price Option (Target Max Safe Price)
  const lowerPrice = safeBounds.comfortablePrice > 0 ? safeBounds.comfortablePrice : Math.round(requestedAmount * 0.75);
  const lowerPriceMonthly = Math.round((lowerPrice * 0.8) / 36); // Assuming 36 mo finance with 20% down
  alternatives.push({
    id: "ALT_LOWER_PRICE",
    title: `Consider a ${lowerPrice.toLocaleString()} KES ${decisionTitle}`,
    subtitle: "Comfortable Price Target",
    suggestedAmount: lowerPrice,
    monthlyPayment: lowerPriceMonthly,
    goalDelayDays: 0,
    safetyRating: "OPTIMAL",
    explanation: `Buying at ${lowerPrice.toLocaleString()} KES protects 100% of your 3-month emergency reserve and keeps your target savings goal on schedule.`,
    actionText: "Apply This Budget",
  });

  // 2. Structured Financing / Higher Down Payment Option
  const suggestedDownPayment = Math.min(baseline.liquidSavings * 0.4, Math.round(requestedAmount * 0.3));
  const financedAmount = Math.max(0, requestedAmount - suggestedDownPayment);
  const spreadMonthlyPayment = Math.round(financedAmount / 24); // 24-month spread
  const spreadGoalDelay = Math.round((financedAmount / Math.max(1, cashFlow.monthlyFreeCashFlow)) * 3.5);

  alternatives.push({
    id: "ALT_STRUCTURED_PAYMENT",
    title: `Put ${suggestedDownPayment.toLocaleString()} KES down & finance rest`,
    subtitle: "24-Month Structured Payment",
    suggestedAmount: requestedAmount,
    monthlyPayment: spreadMonthlyPayment,
    goalDelayDays: Math.min(30, spreadGoalDelay),
    safetyRating: "SAFE",
    explanation: `Making a ${suggestedDownPayment.toLocaleString()} KES down payment and spreading ${financedAmount.toLocaleString()} KES over 24 months limits monthly cash flow pressure to ${spreadMonthlyPayment.toLocaleString()} KES/month.`,
    actionText: "Simulate Structured Plan",
  });

  // 3. Postpone & Save First Option (60-90 Days Delay)
  const monthlyFreeCash = Math.max(1, cashFlow.monthlyFreeCashFlow);
  const gapToFund = Math.max(0, requestedAmount - safeBounds.comfortablePrice);
  const monthsToSave = Math.ceil(gapToFund / monthlyFreeCash);
  const saveFirstDays = Math.min(180, monthsToSave * 30);

  alternatives.push({
    id: "ALT_SAVE_FIRST",
    title: `Save for ${monthsToSave} months first before buying`,
    subtitle: "Zero-Risk Delay Strategy",
    suggestedAmount: requestedAmount,
    monthlyPayment: 0,
    goalDelayDays: 0,
    safetyRating: "MANAGEABLE",
    explanation: `By building up an additional ${gapToFund.toLocaleString()} KES over the next ${monthsToSave} months, you can buy at your full ${requestedAmount.toLocaleString()} KES target without compromising your financial safety.`,
    actionText: "Set Save-First Plan",
  });

  return alternatives;
}
