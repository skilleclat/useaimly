/**
 * Deterministic math & finance calculation helpers.
 */

export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the required monthly payment to reach a target future value
 * FV = PV*(1+r)^n + PMT * [((1+r)^n - 1) / r]
 */
export function calculateRequiredMonthlySavings(
  targetAmount: number,
  currentAmount: number,
  monthsRemaining: number,
  annualInterestRate: number = 0
): number {
  if (monthsRemaining <= 0) return Math.max(0, targetAmount - currentAmount);
  
  const shortfall = targetAmount - currentAmount;
  if (shortfall <= 0) return 0;

  if (annualInterestRate <= 0) {
    return roundTo(shortfall / monthsRemaining);
  }

  const monthlyRate = annualInterestRate / 12;
  const futureValueFactor = Math.pow(1 + monthlyRate, monthsRemaining);
  const futureValueOfCurrent = currentAmount * futureValueFactor;
  const remainingNeeded = targetAmount - futureValueOfCurrent;

  if (remainingNeeded <= 0) return 0;

  const annuityFactor = (futureValueFactor - 1) / monthlyRate;
  return roundTo(remainingNeeded / annuityFactor);
}
