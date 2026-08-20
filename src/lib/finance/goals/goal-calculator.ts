import { NormalizedGoalItem, GoalCalculationResult, GoalEvaluationStatus } from "../types";
import { addMonths, differenceInMonths, differenceInDays, formatDateToISO, parseDate } from "@/lib/utils/date";

/**
 * Deterministically evaluates a single financial goal against target date and available monthly cash flow.
 */
export function calculateGoalMetrics(
  goal: NormalizedGoalItem,
  monthlyAllocation: number,
  referenceDate: Date = new Date()
): GoalCalculationResult {
  const {
    id: goalId,
    title,
    targetAmount = 0,
    currentAmount = 0,
    targetDate: targetDateStr,
    status: goalStatus = "ACTIVE",
  } = goal;

  // 1. Edge Case: Zero or Negative Target
  if (targetAmount <= 0) {
    return {
      goalId,
      title,
      targetAmount: 0,
      currentAmount,
      remainingAmount: 0,
      targetDate: targetDateStr || formatDateToISO(referenceDate),
      monthsUntilTargetDate: 0,
      daysUntilTargetDate: 0,
      requiredMonthlyContribution: 0,
      allocatedMonthlyContribution: monthlyAllocation,
      projectedCompletionDate: formatDateToISO(referenceDate),
      projectedMonthsToCompletion: 0,
      projectedDaysToCompletion: 0,
      monthlySurplus: Math.max(0, monthlyAllocation),
      monthlyShortfall: 0,
      progressPercentage: 100,
      status: "COMPLETED",
      isAchievable: true,
      notes: "Target amount is zero or already satisfied.",
    };
  }

  // 2. Remaining Shortfall
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercentage = Number(Math.min(100, (currentAmount / targetAmount) * 100).toFixed(1));

  // 3. Edge Case: Target Already Achieved
  if (remainingAmount === 0 || goalStatus === "COMPLETED") {
    return {
      goalId,
      title,
      targetAmount,
      currentAmount,
      remainingAmount: 0,
      targetDate: targetDateStr || formatDateToISO(referenceDate),
      monthsUntilTargetDate: 0,
      daysUntilTargetDate: 0,
      requiredMonthlyContribution: 0,
      allocatedMonthlyContribution: monthlyAllocation,
      projectedCompletionDate: formatDateToISO(referenceDate),
      projectedMonthsToCompletion: 0,
      projectedDaysToCompletion: 0,
      monthlySurplus: Math.max(0, monthlyAllocation),
      monthlyShortfall: 0,
      progressPercentage: 100,
      status: "COMPLETED",
      isAchievable: true,
      notes: "Destination capital fully achieved.",
    };
  }

  // 4. Target Date Parsing & Duration
  const targetDateObj = targetDateStr ? parseDate(targetDateStr) : addMonths(referenceDate, 24);
  const daysUntilTargetDate = differenceInDays(targetDateObj, referenceDate);
  const monthsDiff = differenceInMonths(targetDateObj, referenceDate);

  // 5. Edge Case: Past Target Date (Overdue)
  if (daysUntilTargetDate < 0) {
    const requiredImmediate = remainingAmount;
    let projectedMonths = 999;
    let projectedDate = "Trajectory does not arrive";

    if (monthlyAllocation > 0) {
      projectedMonths = Math.ceil(remainingAmount / monthlyAllocation);
      projectedDate = formatDateToISO(addMonths(referenceDate, projectedMonths));
    }

    return {
      goalId,
      title,
      targetAmount,
      currentAmount,
      remainingAmount,
      targetDate: targetDateStr,
      monthsUntilTargetDate: 0,
      daysUntilTargetDate,
      requiredMonthlyContribution: requiredImmediate,
      allocatedMonthlyContribution: monthlyAllocation,
      projectedCompletionDate: projectedDate,
      projectedMonthsToCompletion: projectedMonths,
      projectedDaysToCompletion: projectedMonths * 30,
      monthlySurplus: 0,
      monthlyShortfall: Math.max(0, requiredImmediate - monthlyAllocation),
      progressPercentage,
      status: "OVERDUE",
      isAchievable: monthlyAllocation > 0,
      notes: "Target date has passed with remaining shortfall.",
    };
  }

  // 6. Required Monthly Contribution
  const monthsUntilTargetDate = Math.max(1, monthsDiff);
  const requiredMonthlyContribution = Math.round(remainingAmount / monthsUntilTargetDate);

  // 7. Projected Completion Date based on allocated monthly cash flow
  let projectedMonthsToCompletion = 999;
  let projectedCompletionDate = "Trajectory does not arrive";
  let isAchievable = false;

  if (monthlyAllocation > 0) {
    projectedMonthsToCompletion = Math.ceil(remainingAmount / monthlyAllocation);
    const projDateObj = addMonths(referenceDate, projectedMonthsToCompletion);
    projectedCompletionDate = formatDateToISO(projDateObj);
    isAchievable = true;
  }

  // 8. Surplus / Shortfall
  const monthlySurplus = Math.max(0, monthlyAllocation - requiredMonthlyContribution);
  const monthlyShortfall = Math.max(0, requiredMonthlyContribution - monthlyAllocation);

  // 9. Status Determination
  let status: GoalEvaluationStatus = "ON_TRACK";
  let notes = "";

  if (monthlyAllocation <= 0) {
    status = "OFF_TRACK";
    notes = "Zero or negative cash flow available for goal accumulation.";
  } else if (monthlyAllocation >= requiredMonthlyContribution) {
    if (projectedMonthsToCompletion <= monthsUntilTargetDate * 0.8) {
      status = "AHEAD";
      notes = `Accumulating faster than target schedule (${projectedMonthsToCompletion} mos vs ${monthsUntilTargetDate} mos).`;
    } else {
      status = "ON_TRACK";
      notes = "Current monthly contribution fully satisfies target arrival date.";
    }
  } else {
    // Has positive cash flow, but below required pace
    if (monthlyAllocation >= requiredMonthlyContribution * 0.6) {
      status = "AT_RISK";
      notes = `Monthly shortfall of ${monthlyShortfall}. Arrival delayed by ${projectedMonthsToCompletion - monthsUntilTargetDate} months.`;
    } else {
      status = "OFF_TRACK";
      notes = `Severe shortfall. Requires +${monthlyShortfall}/mo to restore trajectory.`;
    }
  }

  return {
    goalId,
    title,
    targetAmount,
    currentAmount,
    remainingAmount,
    targetDate: targetDateStr,
    monthsUntilTargetDate,
    daysUntilTargetDate,
    requiredMonthlyContribution,
    allocatedMonthlyContribution: monthlyAllocation,
    projectedCompletionDate,
    projectedMonthsToCompletion,
    projectedDaysToCompletion: projectedMonthsToCompletion * 30,
    monthlySurplus,
    monthlyShortfall,
    progressPercentage,
    status,
    isAchievable,
    notes,
  };
}

/**
 * Evaluates multiple goals with priority waterfall allocation of free cash flow.
 * Priority order: CRITICAL -> HIGH -> MEDIUM -> LOW.
 */
export function calculateMultipleGoalsMetrics(
  goals: NormalizedGoalItem[],
  totalMonthlyFreeCashFlow: number,
  referenceDate: Date = new Date()
): GoalCalculationResult[] {
  if (!goals || goals.length === 0) return [];

  const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

  // Sort by priority and then target date
  const sortedGoals = [...goals].sort((a, b) => {
    const pA = priorityOrder[a.priority || "MEDIUM"] || 3;
    const pB = priorityOrder[b.priority || "MEDIUM"] || 3;
    if (pA !== pB) return pA - pB;
    return (a.targetDate || "").localeCompare(b.targetDate || "");
  });

  let remainingCashFlow = Math.max(0, totalMonthlyFreeCashFlow);
  const results: GoalCalculationResult[] = [];

  for (const goal of sortedGoals) {
    if (goal.status === "COMPLETED") {
      results.push(calculateGoalMetrics(goal, 0, referenceDate));
      continue;
    }

    // Determine remaining shortfall and nominal required
    const targetObj = goal.targetDate ? parseDate(goal.targetDate) : addMonths(referenceDate, 24);
    const months = Math.max(1, differenceInMonths(targetObj, referenceDate));
    const shortfall = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));
    const required = Math.round(shortfall / months);

    // Waterfall allocation
    const allocation = Math.min(remainingCashFlow, required > 0 ? required : remainingCashFlow);
    remainingCashFlow = Math.max(0, remainingCashFlow - allocation);

    results.push(calculateGoalMetrics(goal, allocation, referenceDate));
  }

  return results;
}
