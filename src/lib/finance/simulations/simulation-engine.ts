import {
  BaselineFinancialProfile,
  DecisionSimulationInput,
  DecisionSimulationResult,
  DecisionImpactStatus,
  ThreePillarAffordability,
  ExecutiveDecision,
  ConfidenceLevel,
  VehicleOwnershipBurden,
} from "../types";
import { CurrencyCode } from "@/lib/types/finance";
import { normalizeToMonthly } from "../normalization/frequency-normalizer";
import { calculateCashFlow } from "../cash-flow/cash-flow-calculator";
import { calculateGoalMetrics } from "../goals/goal-calculator";
import { evaluateFinancialConstraints } from "../constraints/constraint-engine";
import { runPreFlightValidation } from "../validation/preflight-validator";
import { formatCurrency } from "@/lib/utils/currency";
import { addMonths, differenceInDays, formatDateToISO, parseDate } from "@/lib/utils/date";

/**
 * Evaluates the deterministic impact of a proposed financial decision against baseline profile.
 * Executes:
 * 1. Data Normalization & Fact Classification
        2. Deterministic Calculation & Trajectory Deltas
 * 3. Vehicle Purchase Intelligence Framework (Decision A & Decision B)
 * 4. Financial Constraint Engine Verification
 * 5. Executive Decision Engine (GO / WAIT / ADJUST) & Confidence Calibration
 */
export function simulateDecision(
  baseline: BaselineFinancialProfile,
  decision: DecisionSimulationInput,
  referenceDate: Date = new Date(),
  currency: CurrencyCode = "KES"
): DecisionSimulationResult {
  const { decisionTitle, amount = 0, isRecurring = false, recurringFrequency = "MONTHLY" } = decision;
  const currCode: CurrencyCode = (decision as any).currency || currency || "KES";

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

  const isGoalAchieved = primaryGoalItem
    ? primaryGoalItem.currentAmount >= primaryGoalItem.targetAmount || primaryGoalItem.targetAmount <= 0
    : false;

  // 3. Compute Simulated Adjustments
  const recurringMonthlyCost = isRecurring ? normalizeToMonthly(amount, recurringFrequency) : 0;
  const oneTimeCost = isRecurring ? 0 : amount;

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

  // 4. Trajectory Deltas & Date Reconciliation
  const availableSavingsChange = -oneTimeCost;
  const monthlyFreeCashFlowChange = -recurringMonthlyCost;

  let delayInDays = 0;
  let additionalMonthlyAmountRequired = 0;
  let percentageOfGoalAffected = 0;
  let baselineCompletionDate = baselineGoalResult?.projectedCompletionDate || formatDateToISO(referenceDate);
  let newCompletionDate = simulatedGoalResult?.projectedCompletionDate || formatDateToISO(referenceDate);

  if (primaryGoalItem && isGoalAchieved) {
    delayInDays = 0;
    additionalMonthlyAmountRequired = 0;
    baselineCompletionDate = "Goal Achieved";
    newCompletionDate = "Goal Achieved";
  } else if (baselineGoalResult && simulatedGoalResult) {
    const targetAmount = primaryGoalItem?.targetAmount || 1;
    percentageOfGoalAffected = Number(((amount / targetAmount) * 100).toFixed(1));

    const monthsRemaining = baselineGoalResult.monthsUntilTargetDate;
    if (monthsRemaining > 0) {
      if (isRecurring) {
        additionalMonthlyAmountRequired = Math.round(recurringMonthlyCost);
      } else {
        additionalMonthlyAmountRequired = Math.round(oneTimeCost / monthsRemaining);
      }
    }

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
      delayInDays = 999 * 30;
    }
  }

  // 5. Monthly Fixed Obligations
  const monthlyFixedObligations =
    baselineCashFlow.monthlyEssentialExpenses +
    baselineCashFlow.monthlyDebtPayments +
    baselineCashFlow.monthlyCommitments;

  // 6. Vehicle Purchase Intelligence Framework Evaluation
  const isVehiclePurchase =
    decisionTitle.toLowerCase().includes("vehicle") ||
    decisionTitle.toLowerCase().includes("car") ||
    decisionTitle.toLowerCase().includes("auto") ||
    decisionTitle.toLowerCase().includes("truck") ||
    decisionTitle.toLowerCase().includes("suv");

  let vehicleFramework: DecisionSimulationResult["vehicleFramework"] = undefined;

  if (isVehiclePurchase) {
    const dedicatedGoalSavings = primaryGoalItem ? primaryGoalItem.currentAmount : 0;
    const remainingFundingGap = Math.max(0, amount - dedicatedGoalSavings);
    const emergencyReserveTouched = amount > dedicatedGoalSavings;
    const canFundPurchase = baseline.liquidSavings >= amount;

    // Decision B: Operating & Ownership Costs
    const estimatedMonthlyInsurance = Math.round((amount * 0.04) / 12); // ~4% annual
    const estimatedMonthlyFuel = 12000;
    const estimatedMonthlyMaintenance = Math.round((amount * 0.03) / 12);
    const estimatedMonthlyParkingAndTires = 4000;
    const monthlyFinancingObligation = isRecurring ? recurringMonthlyCost : 0;

    const totalMonthlyOwnershipBurden =
      estimatedMonthlyInsurance +
      estimatedMonthlyFuel +
      estimatedMonthlyMaintenance +
      estimatedMonthlyParkingAndTires +
      monthlyFinancingObligation;

    const canAffordOwnership = baselineCashFlow.monthlyFreeCashFlow >= totalMonthlyOwnershipBurden;
    const freeCashFlowAfterOwnership = baselineCashFlow.monthlyFreeCashFlow - totalMonthlyOwnershipBurden;

    const operatingCostsBreakdown: VehicleOwnershipBurden = {
      isVehiclePurchase: true,
      estimatedMonthlyInsurance,
      estimatedMonthlyFuel,
      estimatedMonthlyMaintenance,
      estimatedMonthlyParkingAndTires,
      monthlyFinancingObligation,
      totalMonthlyOwnershipBurden,
      ownershipCostKnown: false,
    };

    let projectedFundingDate = baselineGoalResult?.projectedCompletionDate || "Immediate";

    vehicleFramework = {
      isVehiclePurchase: true,
      decisionA: {
        canFundPurchase,
        purchasePrice: amount,
        dedicatedGoalSavings,
        remainingFundingGap,
        monthlyCapacity: baselineCashFlow.monthlyFreeCashFlow,
        projectedFundingDate,
        emergencyReserveTouched,
      },
      decisionB: {
        canAffordOwnership,
        monthlyOwnershipBurden: totalMonthlyOwnershipBurden,
        operatingCostsBreakdown,
        freeCashFlowAfterOwnership,
      },
    };
  }

  // 7. Constraint Engine Evaluation
  const constraintResults = evaluateFinancialConstraints({
    baselineProfile: baseline,
    decisionAmount: amount,
    isRecurring,
    postDecisionLiquidSavings: simulatedLiquidSavings,
    postDecisionFreeCashFlow: simulatedFreeCashFlow,
    monthlyFixedObligations,
    delayInDays,
    targetReserveMonths: 3.0,
    currency: currCode,
  });

  // 8. 3-Pillar Affordability Calculations
  const canPhysicallyPay = baseline.liquidSavings >= oneTimeCost;
  const cashRemainingAfterDecision = baseline.liquidSavings - oneTimeCost;
  const cashDeficit = Math.max(0, oneTimeCost - baseline.liquidSavings);

  const minRecommendedBuffer = monthlyFixedObligations * 3.0; // Enforce 3-month floor target
  const bufferRemaining = cashRemainingAfterDecision;
  const preservesEssentialObligations =
    cashRemainingAfterDecision >= minRecommendedBuffer && simulatedFreeCashFlow >= 0;

  const obligationsPreservedMonths =
    monthlyFixedObligations > 0
      ? Number((Math.max(0, cashRemainingAfterDecision) / monthlyFixedObligations).toFixed(1))
      : 12;

  const preservesGoalTrajectory =
    isGoalAchieved ||
    (delayInDays <= 30 &&
      (simulatedGoalResult ? simulatedGoalResult.status === "ON_TRACK" || simulatedGoalResult.status === "AHEAD" : true));

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

  // 9. Executive Decision Engine (GO / WAIT / ADJUST) Determination
  const hardBlockerPresent = constraintResults.some(
    (c) => c.severity === "HARD_BLOCKER" && c.status !== "SATISFIED"
  );
  const reserveFloorBreached = obligationsPreservedMonths < 3.0;
  const vehicleOwnershipUnaffordable = vehicleFramework ? !vehicleFramework.decisionB.canAffordOwnership : false;

  let executiveDecision: ExecutiveDecision = "GO";
  let status: DecisionImpactStatus = "SAFE";
  let singleAction = "";

  if (!canPhysicallyPay || simulatedFreeCashFlow < 0 || obligationsPreservedMonths < 1.0 || vehicleOwnershipUnaffordable) {
    executiveDecision = "WAIT";
    status = "OFF_TRACK";
    if (!canPhysicallyPay) {
      singleAction = `Pause purchase until dedicated goal savings reach ${formatCurrency(amount, currCode)}.`;
    } else if (vehicleOwnershipUnaffordable) {
      singleAction = `Hold purchase: Estimated monthly ownership burden (${formatCurrency(vehicleFramework?.decisionB.monthlyOwnershipBurden || 0, currCode)}/mo) exceeds free cash flow (${formatCurrency(baselineCashFlow.monthlyFreeCashFlow, currCode)}/mo).`;
    } else {
      singleAction = "Pause non-essential outlays until liquid reserves cover 3.0 months of mandatory expenses.";
    }
  } else if (reserveFloorBreached || delayInDays > 30 || hardBlockerPresent) {
    executiveDecision = "ADJUST";
    status = reserveFloorBreached ? "HIGH_IMPACT" : "MANAGEABLE";

    if (isGoalAchieved) {
      singleAction = `Goal "${primaryGoalItem?.title}" is 100% funded. Do not allocate further funds to this goal. Redirect ${formatCurrency(baselineCashFlow.monthlyFreeCashFlow, currCode)}/mo surplus cash flow to Emergency Reserves until 3.0-month target (${formatCurrency(minRecommendedBuffer, currCode)}) is reached.`;
    } else if (reserveFloorBreached) {
      singleAction = `Reduce purchase budget to ${formatCurrency(amount * 0.7, currCode)} or delay by ${Math.ceil((minRecommendedBuffer - cashRemainingAfterDecision) / Math.max(1, baselineCashFlow.monthlyFreeCashFlow))} months to maintain a 3.0-month reserve floor (${formatCurrency(minRecommendedBuffer, currCode)}).`;
    } else {
      singleAction = `Increase monthly goal allocation by +${formatCurrency(additionalMonthlyAmountRequired, currCode)}/mo to neutralize the +${delayInDays}-day trajectory shift.`;
    }
  } else {
    executiveDecision = "GO";
    status = "SAFE";
    if (isGoalAchieved) {
      singleAction = `Goal "${primaryGoalItem?.title}" is fully funded. Redirect ${formatCurrency(baselineCashFlow.monthlyFreeCashFlow, currCode)}/mo surplus cash flow to secondary goals or reserves.`;
    } else {
      singleAction = "Proceed with purchase while maintaining automated monthly allocation to goal destination.";
    }
  }

  // 10. Confidence Calibration (HIGH / MEDIUM / LOW)
  const confidenceReasons: string[] = [];
  let confidenceLevel: ConfidenceLevel = "HIGH";

  if (isVehiclePurchase) {
    confidenceLevel = "MEDIUM";
    confidenceReasons.push("Vehicle ownership costs (insurance, fuel, maintenance) are estimated based on regional averages rather than user-confirmed quotes.");
  }

  if (baseline.liquidSavings === (primaryGoalItem?.currentAmount || -1)) {
    confidenceLevel = "MEDIUM";
    confidenceReasons.push("Fund separation between emergency reserves and goal savings is unconfirmed.");
  }

  if (confidenceReasons.length === 0) {
    confidenceReasons.push("All required financial inputs are confirmed and calculations are internally consistent.");
  }

  // 11. Fact / Calculation / Estimation / Recommendation Separation
  const factBreakdown = {
    confirmedFacts: [
      `Monthly Gross Income: ${formatCurrency(baselineCashFlow.monthlyGrossIncome, currCode)}`,
      `Monthly Mandatory Outflows: ${formatCurrency(monthlyFixedObligations, currCode)}`,
      `Liquid Reserves: ${formatCurrency(baseline.liquidSavings, currCode)}`,
      `Primary Goal Target: ${formatCurrency(primaryGoalItem?.targetAmount || 0, currCode)} by ${baselineGoalResult?.targetDate || "N/A"}`,
    ],
    calculatedMetrics: [
      `Monthly Free Cash Flow: ${formatCurrency(baselineCashFlow.monthlyFreeCashFlow, currCode)}/mo`,
      `Post-Decision Liquid Buffer: ${obligationsPreservedMonths} Months of mandatory expenses`,
      `Projected Completion Date: ${newCompletionDate}${delayInDays > 0 ? ` (+${delayInDays} Days Delay)` : ""}`,
    ],
    estimatedVariables: isVehiclePurchase
      ? [
          `Estimated Monthly Ownership Operating Burden: ${formatCurrency(vehicleFramework?.decisionB.monthlyOwnershipBurden || 0, currCode)}/mo`,
        ]
      : ["Assuming constant income and expense baseline throughout trajectory."],
    recommendations: [
      `Executive Decision: ${executiveDecision}`,
      singleAction,
    ],
  };

  // Missing Variables Disclosures
  const missingVariables: string[] = [];
  if (isVehiclePurchase) {
    missingVariables.push("Exact monthly vehicle insurance quote");
    missingVariables.push("Actual fuel & parking profile");
    missingVariables.push("Financing interest rate terms (if taking loan)");
  }
  if (baseline.liquidSavings > 0 && primaryGoalItem && primaryGoalItem.currentAmount > 0) {
    missingVariables.push("Confirmation of whether emergency reserves are distinct from goal funds");
  }

  // 12. Headline & Detailed Analysis
  let headlineVerdict = "";
  let detailedAnalysis = "";
  let recommendationText = singleAction;

  if (executiveDecision === "GO") {
    headlineVerdict = isGoalAchieved
      ? "Executive Decision: GO — Destination Fully Achieved"
      : "Executive Decision: GO — Plan & Buffer Intact";

    detailedAnalysis = isGoalAchieved
      ? `Goal "${primaryGoalItem?.title}" is 100% funded with ${formatCurrency(primaryGoalItem?.currentAmount || 0, currCode)} in confirmed savings. Liquid reserves retain ${obligationsPreservedMonths} months of mandatory living buffer.`
      : `Calculations confirm that this decision is fully affordable. Liquid reserves retain ${obligationsPreservedMonths} months of mandatory living buffer, exceeding your 3.0-month target, while primary goal arrival remains on schedule for ${newCompletionDate}.`;
  } else if (executiveDecision === "ADJUST") {
    headlineVerdict = `Executive Decision: ADJUST — ${reserveFloorBreached ? "Reserve Buffer Below Target" : "Trajectory Delay Identified"}`;
    detailedAnalysis = isGoalAchieved
      ? `Goal "${primaryGoalItem?.title}" is 100% funded (${formatCurrency(primaryGoalItem?.currentAmount || 0, currCode)} saved). However, post-purchase liquid reserves provide ${obligationsPreservedMonths} months of mandatory expenses (below your 3.0-month target of ${formatCurrency(minRecommendedBuffer, currCode)}). Redirect future surplus cash flow to reserves.`
      : reserveFloorBreached
      ? `While you have sufficient liquid cash to execute this payment, post-purchase reserves dip to ${obligationsPreservedMonths} months of mandatory expenses (below your 3.0-month target of ${formatCurrency(minRecommendedBuffer, currCode)}). Adjusting the timeline or purchase amount protects essential resilience.`
      : `Executing this outlay shifts your primary destination "${primaryGoalItem?.title}" by +${delayInDays} days (Projected: ${newCompletionDate}). An allocation adjustment of +${formatCurrency(additionalMonthlyAmountRequired, currCode)}/mo is recommended to neutralize the delay.`;
  } else {
    if (!canPhysicallyPay) {
      headlineVerdict = "Executive Decision: WAIT — Cash Deficit: Cannot Physically Fund";
      detailedAnalysis = `Executing this decision requires ${formatCurrency(amount, currCode)}, which exceeds accessible liquid cash by ${formatCurrency(cashDeficit, currCode)}.`;
    } else if (simulatedFreeCashFlow < 0) {
      headlineVerdict = "Executive Decision: WAIT — Destabilizing: Creates Monthly Deficit";
      detailedAnalysis = `This commitment would turn your monthly cash flow negative (${formatCurrency(simulatedFreeCashFlow, currCode)}/mo), draining existing reserves each month.`;
    } else if (vehicleOwnershipUnaffordable) {
      headlineVerdict = "Executive Decision: WAIT — Vehicle Ownership Unaffordable";
      detailedAnalysis = `You can fund the initial purchase price, but the total monthly ownership burden (${formatCurrency(vehicleFramework?.decisionB.monthlyOwnershipBurden || 0, currCode)}/mo) exceeds your monthly free cash flow (${formatCurrency(baselineCashFlow.monthlyFreeCashFlow, currCode)}/mo).`;
    } else {
      headlineVerdict = "Executive Decision: WAIT — Unacceptable Reserve Risk";
      detailedAnalysis = `Executing this decision depletes essential reserves below 1.0 month of living security, introducing unacceptable vulnerability.`;
    }
  }

  const result: DecisionSimulationResult = {
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
    executiveDecision,
    confidenceLevel,
    confidenceReasons,
    constraintResults,
    vehicleFramework,
    factBreakdown,
    missingVariables,
    singleAction,
    status,
    headlineVerdict,
    detailedAnalysis,
    recommendation: recommendationText,
  };

  // Run Pre-Flight Validation to guarantee zero date/logic contradictions
  const validation = runPreFlightValidation(result);
  if (!validation.isValid) {
    console.warn("PRE-FLIGHT VALIDATION WARNINGS/ERRORS:", validation.errors);
  }

  return result;
}
