import { BaselineFinancialProfile } from "./types";
import { calculateCashFlow } from "./cash-flow/cash-flow-calculator";

export interface MaxSafePriceResult {
  comfortablePrice: number; // Price keeping 3+ months emergency buffer & 0 goal delay
  absoluteUpperPrice: number; // Price keeping 1.5+ months emergency buffer
  requestedPrice: number;
  deltaComfortable: number; // requestedPrice - comfortablePrice
  deltaUpper: number; // requestedPrice - absoluteUpperPrice
  verdict: "WITHIN_COMFORTABLE" | "WITHIN_UPPER" | "EXCEEDS_UPPER";
  explanation: string;
  maxMonthlyPaymentComfortable: number;
  maxMonthlyPaymentUpper: number;
}

/**
 * Calculates the Maximum Safe Spending Price for a one-time purchase or financing commitment.
 * Formula:
 * Comfortable Price = Available Savings - (3 * Monthly Mandatory Expenses)
 * Absolute Upper Price = Available Savings - (1.5 * Monthly Mandatory Expenses)
 */
export function calculateMaxSafePrice(
  baseline: BaselineFinancialProfile,
  requestedPrice: number = 0,
  isRecurring: boolean = false
): MaxSafePriceResult {
  const cashFlow = calculateCashFlow(
    baseline.incomes,
    baseline.expenses,
    baseline.debts,
    baseline.commitments
  );

  const monthlyFixedObligations =
    cashFlow.monthlyEssentialExpenses +
    cashFlow.monthlyDebtPayments +
    cashFlow.monthlyCommitments;

  // Reserves floor requirements
  const comfortableReserveFloor = monthlyFixedObligations * 3.0;
  const upperReserveFloor = monthlyFixedObligations * 1.5;

  // Liquid savings available for purchase
  const liquidSavings = Math.max(0, baseline.liquidSavings);

  let comfortablePrice = 0;
  let absoluteUpperPrice = 0;

  if (isRecurring) {
    // For recurring monthly commitments
    const safeMonthlyFreeCash = Math.max(0, cashFlow.monthlyFreeCashFlow);
    comfortablePrice = Math.round(safeMonthlyFreeCash * 0.4); // max 40% of free cash flow
    absoluteUpperPrice = Math.round(safeMonthlyFreeCash * 0.7); // max 70% of free cash flow
  } else {
    // For one-time lump sum outlays
    comfortablePrice = Math.max(0, Math.round(liquidSavings - comfortableReserveFloor));
    absoluteUpperPrice = Math.max(0, Math.round(liquidSavings - upperReserveFloor));
  }

  const deltaComfortable = requestedPrice - comfortablePrice;
  const deltaUpper = requestedPrice - absoluteUpperPrice;

  let verdict: MaxSafePriceResult["verdict"] = "WITHIN_COMFORTABLE";
  let explanation = "";

  if (requestedPrice <= comfortablePrice) {
    verdict = "WITHIN_COMFORTABLE";
    explanation = `Your requested amount of ${requestedPrice.toLocaleString()} KES is within your comfortable safety range (Up to ${comfortablePrice.toLocaleString()} KES), preserving your 3-month emergency buffer.`;
  } else if (requestedPrice <= absoluteUpperPrice) {
    verdict = "WITHIN_UPPER";
    explanation = `Your requested amount of ${requestedPrice.toLocaleString()} KES exceeds comfortable limits by ${deltaComfortable.toLocaleString()} KES, but remains under your absolute ceiling of ${absoluteUpperPrice.toLocaleString()} KES.`;
  } else {
    verdict = "EXCEEDS_UPPER";
    explanation = `Your requested amount of ${requestedPrice.toLocaleString()} KES exceeds your absolute safe upper limit of ${absoluteUpperPrice.toLocaleString()} KES by ${deltaUpper.toLocaleString()} KES. Executing this would breach your emergency reserve floor.`;
  }

  const maxMonthlyPaymentComfortable = Math.round(Math.max(0, cashFlow.monthlyFreeCashFlow * 0.35));
  const maxMonthlyPaymentUpper = Math.round(Math.max(0, cashFlow.monthlyFreeCashFlow * 0.60));

  return {
    comfortablePrice,
    absoluteUpperPrice,
    requestedPrice,
    deltaComfortable,
    deltaUpper,
    verdict,
    explanation,
    maxMonthlyPaymentComfortable,
    maxMonthlyPaymentUpper,
  };
}
