/**
 * Useaimly Deterministic Decision Engine
 * "See tomorrow before deciding today"
 * 
 * Core Philosophy: Cash affordability ≠ Plan affordability.
 * Evaluates immediate cash impact vs long-term goal completion timeline shifts.
 */

import {
  DecisionSimulationResult,
  FinancialDecision,
  GoalImpactComparison,
  PlanAffordabilityStatus,
  RecoveryPlan,
} from "../../types/decision";
import { FinancialProfile } from "../../types/finance";
import { FinancialGoal } from "../../types/goal";
import { calculateCashFlowSummary } from "../calculations/cash-flow";
import { calculateNetWorth } from "../calculations/net-worth";
import { evaluateGoal } from "../goal-logic/goal-evaluator";
import { allocateFreeCashFlowToGoals } from "../goal-logic/goal-prioritizer";
import { generateTrajectoryPoints } from "../projections/trajectory-engine";
import { addMonths, differenceInDays, differenceInMonths, formatDateToISO, parseDate } from "../../utils/date";
import { roundTo } from "../../utils/math";

export function simulateDecision(
  profile: FinancialProfile,
  goals: FinancialGoal[],
  decision: FinancialDecision,
  asOfDate: Date = new Date()
): DecisionSimulationResult {
  // 1. Baseline Calculations
  const baselineCashFlow = calculateCashFlowSummary(profile.cashFlowItems);
  const baselineNetWorth = calculateNetWorth(profile.accounts, baselineCashFlow.monthlyTotalExpenses);
  const baselineAllocations = allocateFreeCashFlowToGoals(
    goals,
    baselineCashFlow.monthlyFreeCashFlow,
    profile.monthlyAllocationPreference.maxGoalAllocationRate
  );

  // Primary goal is targetGoalId or highest priority active goal
  const primaryGoal =
    goals.find((g) => g.id === decision.targetGoalId) ||
    goals.find((g) => g.priority === "CRITICAL" && g.currentAmount < g.targetAmount) ||
    goals[0];

  const primaryGoalBaselineAllocation = primaryGoal
    ? baselineAllocations.get(primaryGoal.id) || 0
    : 0;

  const primaryGoalBaselineEval = primaryGoal
    ? evaluateGoal(primaryGoal, primaryGoalBaselineAllocation, asOfDate)
    : null;

  // 2. Decision Impact Vectors
  let oneOffCashImpact = 0;
  let monthlyCashFlowDelta = 0;

  switch (decision.type) {
    case "ONE_OFF_PURCHASE":
      oneOffCashImpact = -Math.abs(decision.amount);
      break;
    case "WINDFALL":
      oneOffCashImpact = Math.abs(decision.amount);
      break;
    case "RECURRING_EXPENSE":
      monthlyCashFlowDelta = -Math.abs(
        decision.recurringFrequency === "ANNUAL"
          ? decision.amount / 12
          : decision.amount
      );
      break;
    case "INCOME_CHANGE":
      monthlyCashFlowDelta =
        decision.recurringFrequency === "ANNUAL"
          ? decision.amount / 12
          : decision.amount;
      break;
    case "GOAL_CONTRIBUTION_CHANGE":
      // Handled directly on goal allocation
      break;
  }

  // 3. Simulated State Metrics
  const availableCashBefore = baselineNetWorth.accessibleLiquidCash;
  const availableCashAfter = roundTo(availableCashBefore + oneOffCashImpact);
  const cashAffordable = availableCashAfter >= 0;

  const monthlyFreeCashFlowBefore = baselineCashFlow.monthlyFreeCashFlow;
  const monthlyFreeCashFlowAfter = roundTo(
    Math.max(0, monthlyFreeCashFlowBefore + monthlyCashFlowDelta)
  );

  // 4. Simulated Goal Impact
  const simulatedAllocations = allocateFreeCashFlowToGoals(
    goals,
    monthlyFreeCashFlowAfter,
    profile.monthlyAllocationPreference.maxGoalAllocationRate
  );

  const allGoalsImpact: GoalImpactComparison[] = goals.map((goal) => {
    const baselineAlloc = baselineAllocations.get(goal.id) || 0;
    const simulatedAlloc = simulatedAllocations.get(goal.id) || 0;

    const baseEval = evaluateGoal(goal, baselineAlloc, asOfDate);

    // If one-off purchase draws directly from liquid cash, and goal is relying on cash reserves or flow:
    // Simulated goal remaining is unchanged, but if cash is depleted, contribution might reduce
    // In our standard simulation: one-off purchase consumes available cash that would have gone to goal,
    // or delays goal savings by (Amount / MonthlyAllocatedAmount) months.
    let simulatedCompletionDate: Date;
    let delayInMonths = 0;

    if (decision.type === "ONE_OFF_PURCHASE") {
      // Direct time delay = Purchase Amount / Monthly Goal Allocation
      const monthsOfSavingsLost =
        simulatedAlloc > 0
          ? roundTo(Math.abs(decision.amount) / simulatedAlloc, 1)
          : 0;
      
      const baselineCompletionParsed = parseDate(baseEval.projectedCompletionDate);
      simulatedCompletionDate = addMonths(
        baselineCompletionParsed,
        Math.ceil(monthsOfSavingsLost)
      );
      delayInMonths = Math.ceil(monthsOfSavingsLost);
    } else {
      const simEval = evaluateGoal(goal, simulatedAlloc, asOfDate);
      simulatedCompletionDate = parseDate(simEval.projectedCompletionDate);
      delayInMonths = differenceInMonths(
        simulatedCompletionDate,
        parseDate(baseEval.projectedCompletionDate)
      );
    }

    const baselineCompletionDate = baseEval.projectedCompletionDate;
    const simulatedCompletionISO = formatDateToISO(simulatedCompletionDate);
    const delayInDays = differenceInDays(
      simulatedCompletionDate,
      parseDate(baselineCompletionDate)
    );

    // Calculate additional monthly savings required to recover to original target date
    const targetDateParsed = parseDate(goal.targetDate);
    const monthsToTarget = Math.max(1, differenceInMonths(targetDateParsed, asOfDate));
    const totalNeededAtTarget = goal.targetAmount - goal.currentAmount + Math.abs(oneOffCashImpact);
    const requiredMonthlyForOriginalDate = roundTo(totalNeededAtTarget / monthsToTarget);
    const additionalMonthlySavingsRequired = Math.max(
      0,
      roundTo(requiredMonthlyForOriginalDate - simulatedAlloc)
    );

    return {
      goalId: goal.id,
      goalTitle: goal.title,
      targetAmount: goal.targetAmount,
      baselineCompletionDate,
      simulatedCompletionDate: simulatedCompletionISO,
      originalTargetDate: goal.targetDate,
      delayInMonths,
      delayInDays,
      isDelayed: delayInMonths > 0,
      baselineFeasibility: baseEval.feasibility,
      simulatedFeasibility:
        delayInMonths > 6
          ? "OFF_TRACK"
          : delayInMonths > 0
          ? "AT_RISK"
          : "ON_TRACK",
      additionalMonthlySavingsRequired,
    };
  });

  const primaryGoalImpact =
    allGoalsImpact.find((g) => g.goalId === primaryGoal?.id) ||
    allGoalsImpact[0] || {
      goalId: "default",
      goalTitle: "General Wealth",
      targetAmount: 0,
      baselineCompletionDate: formatDateToISO(asOfDate),
      simulatedCompletionDate: formatDateToISO(asOfDate),
      originalTargetDate: formatDateToISO(asOfDate),
      delayInMonths: 0,
      delayInDays: 0,
      isDelayed: false,
      baselineFeasibility: "ON_TRACK",
      simulatedFeasibility: "ON_TRACK",
      additionalMonthlySavingsRequired: 0,
    };

  // 5. Plan Affordability Status Determination
  let planAffordabilityStatus: PlanAffordabilityStatus = "AFFORDABLE_NO_IMPACT";

  if (!cashAffordable) {
    planAffordabilityStatus = "UNAFFORDABLE_CASH_DEFICIT";
  } else if (primaryGoalImpact.delayInMonths > 4) {
    planAffordabilityStatus = "PLAN_DISRUPTIVE_SEVERE_DELAY";
  } else if (primaryGoalImpact.delayInMonths >= 2) {
    planAffordabilityStatus = "AFFORDABLE_NOTICEABLE_DELAY";
  } else if (primaryGoalImpact.delayInMonths > 0) {
    planAffordabilityStatus = "AFFORDABLE_NEGLIGIBLE_DELAY";
  } else {
    planAffordabilityStatus = "AFFORDABLE_NO_IMPACT";
  }

  // 6. Horizon Trajectory Points Generation
  const trajectory = primaryGoal
    ? generateTrajectoryPoints({
        startDate: asOfDate,
        horizonMonths: 36,
        initialCash: availableCashBefore,
        initialInvestments: baselineNetWorth.investableAssets,
        monthlyFreeCashFlow: monthlyFreeCashFlowBefore,
        primaryGoal,
        monthlyGoalAllocation: primaryGoalBaselineAllocation,
        oneOffCashImpact,
        monthlyCashFlowDelta,
        effectiveMonthIndex: 0,
      })
    : [];

  // 7. Recovery Plan Formulation
  const recoveryMonths = Math.max(
    1,
    differenceInMonths(parseDate(primaryGoalImpact.originalTargetDate), asOfDate)
  );

  const recoveryPlan: RecoveryPlan = {
    feasible: primaryGoalImpact.additionalMonthlySavingsRequired <= (baselineCashFlow.monthlyVariableExpenses * 0.5),
    additionalMonthlyAmountRequired: primaryGoalImpact.additionalMonthlySavingsRequired,
    recoveryTimelineMonths: recoveryMonths,
    suggestedDiscretionaryCuts: [
      {
        category: "Discretionary / Entertainment",
        suggestedCut: roundTo(primaryGoalImpact.additionalMonthlySavingsRequired * 0.6),
      },
      {
        category: "Dining / Subscriptions",
        suggestedCut: roundTo(primaryGoalImpact.additionalMonthlySavingsRequired * 0.4),
      },
    ],
    explanation: primaryGoalImpact.isDelayed
      ? `To stay on your original target date (${primaryGoalImpact.originalTargetDate}), you need to save an additional KES ${primaryGoalImpact.additionalMonthlySavingsRequired.toLocaleString()} per month for the next ${recoveryMonths} months.`
      : `No recovery needed. Your timeline remains on track.`,
  };

  // 8. Key Takeaway Synthesis
  const keyTakeaway = cashAffordable
    ? primaryGoalImpact.isDelayed
      ? `You can pay for it in cash today. However, it shifts "${primaryGoalImpact.goalTitle}" completion by ${primaryGoalImpact.delayInMonths} month${primaryGoalImpact.delayInMonths > 1 ? "s" : ""}.`
      : `You can comfortably afford this without delaying your "${primaryGoalImpact.goalTitle}" goal.`
    : `This purchase causes a cash deficit of KES ${Math.abs(availableCashAfter).toLocaleString()}.`;

  return {
    decision,
    cashAffordable,
    planAffordabilityStatus,
    availableCashBefore,
    availableCashAfter,
    monthlyFreeCashFlowBefore,
    monthlyFreeCashFlowAfter,
    primaryGoalImpact,
    allGoalsImpact,
    trajectory,
    recoveryPlan,
    keyTakeaway,
    calculatedAt: new Date().toISOString(),
  };
}
