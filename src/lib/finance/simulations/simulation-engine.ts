import {
  BaselineFinancialProfile,
  DecisionSimulationInput,
  DecisionSimulationResult,
  DecisionImpactStatus,
  ThreePillarAffordability,
} from "../types";
import { normalizeToMonthly } from "../normalization/frequency-normalizer";
import { calculateCashFlow } from "../cash-flow/cash-flow-calculator";
import { calculateGoalMetrics, calculateMultipleGoalsMetrics } from "../goals/goal-calculator";
import { addMonths, differenceInDays, differenceInMonths, formatDateToISO, parseDate } from "@/lib/utils/date";

/**
 * Evaluates the deterministic impact of a proposed financial decision against baseline profile.
 * Executes the 3-Pillar Affordability framework:
 * 1. Physical Cash Affordability
 * 2. Essential Obligation & Buffer Resilience
 * 3. Goal Trajectory Preservation
 */
export function simulateDecision(
  baseline: BaselineFinancialProfile,
  decision: DecisionSimulationInput,
  referenceDate: Date = new Date()
): DecisionSimulationResult {
  const { decisionTitle, amount = 0, isRecurring = false, recurringFrequency = "MONTHLY" } = decision;

  // 1. Calculate Baseline Cash Flow
  const baselineCashFlow = calculateCashFlow(
    baseline.incomes,
    baseline.expenses,
    baseline.debts,
    baseline.commitments
  );

  // 2. Determine Primary Goal
  const primaryGoalItem = baseline.goals.length > 0
    ? baseline.goals.find((g) => g.id === decision.targetGoalId) || baseline.goals[0]
    : null;

  const baselineGoalResult = primaryGoalItem
    ? calculateGoalMetrics(primaryGoalItem, Math.max(0, baselineCashFlow.monthlyFreeCashFlow), referenceDate)
    : null;

  // 3. Compute Simulated Adjustments
  const recurringMonthlyCost = isRecurring ? normalizeToMonthly(amount, recurringFrequency) : 0;
  const oneTimeCost = isRecurring ? 0 : amount;

  // New Liquid Savings & New Free Cash Flow
  const simulatedLiquidSavings = Math.max(0, baseline.liquidSavings - oneTimeCost);
  const simulatedFreeCashFlow = baselineCashFlow.monthlyFreeCashFlow - recurringMonthlyCost;

  // Simulated Primary Goal
  let simulatedGoalResult = null;
  if (primaryGoalItem) {
    const updatedGoalItem = {
      ...primaryGoalItem,
      currentAmount: Math.max(0, primaryGoalItem.currentAmount - oneTimeCost),
    };
    simulatedGoalResult = calculateGoalMetrics(
      updatedGoalItem,
      Math.max(0, simulatedFreeCashFlow),
      referenceDate
    );
  }

  // 4. Calculate Trajectory Deltas
  const availableSavingsChange = -oneTimeCost;
  const monthlyFreeCashFlowChange = -recurringMonthlyCost;

  let delayInDays = 0;
  let additionalMonthlyAmountRequired = 0;
  let percentageOfGoalAffected = 0;
  let baselineCompletionDate = baselineGoalResult?.projectedCompletionDate || formatDateToISO(referenceDate);
  let newCompletionDate = simulatedGoalResult?.projectedCompletionDate || formatDateToISO(referenceDate);

  if (baselineGoalResult && simulatedGoalResult) {
    const targetAmount = primaryGoalItem?.targetAmount || 1;
    percentageOfGoalAffected = Number(((amount / targetAmount) * 100).toFixed(1));

    // Recovery calculation: How much additional per month is needed to still hit the target date?
    const monthsRemaining = baselineGoalResult.monthsUntilTargetDate;
    if (monthsRemaining > 0) {
      if (isRecurring) {
        additionalMonthlyAmountRequired = Math.round(recurringMonthlyCost);
      } else {
        additionalMonthlyAmountRequired = Math.round(oneTimeCost / monthsRemaining);
      }
    }

    // Delay calculation
    if (
      !baselineGoalResult.projectedCompletionDate.includes("does not") &&
      !simulatedGoalResult.projectedCompletionDate.includes("does not")
    ) {
      const bDate = parseDate(baselineGoalResult.projectedCompletionDate);
      const sDate = parseDate(simulatedGoalResult.projectedCompletionDate);
      delayInDays = Math.max(0, differenceInDays(sDate, bDate));
    } else if (
      !baselineGoalResult.projectedCompletionDate.includes("does not") &&
      simulatedGoalResult.projectedCompletionDate.includes("does not")
    ) {
      // Decision pushes trajectory into indefinite stall
      delayInDays = 999 * 30;
    }
  }

  // 5. 3-Pillar Affordability Calculations
  // Pillar 1: Can physically pay?
  const canPhysicallyPay = baseline.liquidSavings >= oneTimeCost;
  const cashRemainingAfterDecision = baseline.liquidSavings - oneTimeCost;
  const cashDeficit = Math.max(0, oneTimeCost - baseline.liquidSavings);

  // Pillar 2: Preserves essential obligations?
  // Recommended buffer = 2 months of essential living costs + debt payments
  const monthlyFixedObligations =
    baselineCashFlow.monthlyEssentialExpenses +
    baselineCashFlow.monthlyDebtPayments +
    baselineCashFlow.monthlyCommitments;

  const minRecommendedBuffer = monthlyFixedObligations * 2;
  const bufferRemaining = cashRemainingAfterDecision;
  const preservesEssentialObligations =
    cashRemainingAfterDecision >= minRecommendedBuffer && simulatedFreeCashFlow >= 0;

  const obligationsPreservedMonths =
    monthlyFixedObligations > 0
      ? Number((Math.max(0, cashRemainingAfterDecision) / monthlyFixedObligations).toFixed(1))
      : 12;

  // Pillar 3: Preserves goal trajectory?
  const preservesGoalTrajectory =
    delayInDays <= 30 &&
    (simulatedGoalResult ? simulatedGoalResult.status === "ON_TRACK" || simulatedGoalResult.status === "AHEAD" : true);

  const affordability: ThreePillarAffordability = {
    canPhysicallyPay,
    availableLiquidCash: baseline.liquidSavings,
    cashRemainingAfterDecision,
    cashDeficit,
    preservesEssentialObligations,
    minRecommendedBuffer,
    bufferRemaining,
    obligationsPreservedMonths,
    preservesGoalTrajectory,
    trajectoryDelayDays: delayInDays,
    additionalMonthlyToRecover: additionalMonthlyAmountRequired,
    percentageOfGoalAffected,
  };

  // 6. Verdict Status Determination
  let status: DecisionImpactStatus = "SAFE";
  let headlineVerdict = "";
  let detailedAnalysis = "";
  let recommendation = "";

  if (!canPhysicallyPay) {
    status = "OFF_TRACK";
    headlineVerdict = "Cash Deficit: Cannot Physically Fund";
    detailedAnalysis = `This decision exceeds your total accessible liquid cash by ${cashDeficit}. Proceeding would create an immediate liquidity overdraft.`;
    recommendation = `Postpone this purchase until you have built at least ${oneTimeCost + minRecommendedBuffer} in reserves.`;
  } else if (simulatedFreeCashFlow < 0) {
    status = "OFF_TRACK";
    headlineVerdict = "Destabilizing: Creates Monthly Deficit";
    detailedAnalysis = `This commitment would turn your monthly cash flow negative (${simulatedFreeCashFlow}/mo), draining existing reserves each month.`;
    recommendation = `Avoid adding recurring costs that exceed your surplus cash flow.`;
  } else if (!preservesEssentialObligations) {
    status = "HIGH_IMPACT";
    headlineVerdict = "High Impact: Depletes Emergency Cushion";
    detailedAnalysis = `While you can physically pay, this decision leaves only ${obligationsPreservedMonths} months of essential buffer (below the recommended 2-month threshold of ${minRecommendedBuffer}).`;
    recommendation = `Consider funding this over 2–3 milestones rather than a single lump-sum deduction.`;
  } else if (delayInDays > 60 || (simulatedGoalResult && simulatedGoalResult.status === "AT_RISK")) {
    status = "MANAGEABLE";
    headlineVerdict = "Manageable: Delays Primary Destination";
    detailedAnalysis = `You have sufficient capital and buffer, but this decision will push your goal arrival back by ${delayInDays} days (${Math.round(delayInDays / 30)} months). You will need +${additionalMonthlyAmountRequired}/mo to recover the timeline.`;
    recommendation = `Acceptable if this purchase is a high priority, but requires increasing monthly savings to compensate.`;
  } else {
    status = "SAFE";
    headlineVerdict = "Safe: Preserves Plan & Liquidity";
    detailedAnalysis = `This decision is fully affordable. It preserves your essential reserves (${obligationsPreservedMonths} months of buffer) and keeps your primary goal on schedule with minimal delay (${delayInDays} days).`;
    recommendation = `Safe to proceed without disrupting your trajectory.`;
  }

  return {
    decisionTitle,
    amount,
    isRecurring,
    recurringMonthlyAmount: recurringMonthlyCost,
    baseline: {
      liquidSavings: baseline.liquidSavings,
      monthlyFreeCashFlow: baselineCashFlow.monthlyFreeCashFlow,
      primaryGoal: baselineGoalResult,
    },
    simulated: {
      liquidSavings: simulatedLiquidSavings,
      monthlyFreeCashFlow: simulatedFreeCashFlow,
      primaryGoal: simulatedGoalResult,
    },
    delta: {
      availableSavingsChange,
      monthlyFreeCashFlowChange,
      delayInDays,
      additionalMonthlyAmountRequired,
      percentageOfGoalAffected,
      baselineCompletionDate,
      newCompletionDate,
    },
    affordability,
    status,
    headlineVerdict,
    detailedAnalysis,
    recommendation,
  };
}
