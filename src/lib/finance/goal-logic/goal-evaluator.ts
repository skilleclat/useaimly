/**
 * Deterministic Goal Evaluation Engine
 * Evaluates goal trajectory, projected completion date, and shortfall/surplus.
 */

import { FinancialGoal, GoalEvaluationResult, GoalFeasibility } from "../../types/goal";
import { addMonths, differenceInDays, differenceInMonths, formatDateToISO, parseDate } from "../../utils/date";
import { roundTo } from "../../utils/math";

export function evaluateGoal(
  goal: FinancialGoal,
  monthlyAllocatedAmount: number,
  asOfDate: Date = new Date()
): GoalEvaluationResult {
  const targetDate = parseDate(goal.targetDate);
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progressPercentage = goal.targetAmount > 0 
    ? Math.min(100, roundTo((goal.currentAmount / goal.targetAmount) * 100, 1))
    : 100;
  const isAchieved = remainingAmount <= 0;

  const monthsRemainingToTargetDate = Math.max(1, differenceInMonths(targetDate, asOfDate));
  const monthlyRequiredAmount = isAchieved 
    ? 0 
    : roundTo(remainingAmount / monthsRemainingToTargetDate);

  let projectedCompletionDate: Date;
  let monthsNeeded: number;

  if (isAchieved) {
    projectedCompletionDate = asOfDate;
    monthsNeeded = 0;
  } else if (monthlyAllocatedAmount <= 0) {
    // If no monthly allocation, it will never complete from cash flow
    projectedCompletionDate = addMonths(asOfDate, 120); // 10 years cap
    monthsNeeded = 120;
  } else {
    monthsNeeded = Math.ceil(remainingAmount / monthlyAllocatedAmount);
    projectedCompletionDate = addMonths(asOfDate, monthsNeeded);
  }

  const varianceInMonths = differenceInMonths(projectedCompletionDate, targetDate);
  const varianceInDays = differenceInDays(projectedCompletionDate, targetDate);

  let feasibility: GoalFeasibility = "ON_TRACK";

  if (isAchieved) {
    feasibility = "ACHIEVED";
  } else if (monthlyAllocatedAmount <= 0) {
    feasibility = "UNDERFUNDED";
  } else if (varianceInMonths > 6) {
    feasibility = "OFF_TRACK";
  } else if (varianceInMonths > 0) {
    feasibility = "AT_RISK";
  } else {
    feasibility = "ON_TRACK";
  }

  return {
    goalId: goal.id,
    title: goal.title,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    remainingAmount: roundTo(remainingAmount),
    progressPercentage,
    monthlyRequiredAmount,
    monthlyAllocatedAmount: roundTo(monthlyAllocatedAmount),
    projectedCompletionDate: formatDateToISO(projectedCompletionDate),
    targetDate: goal.targetDate,
    feasibility,
    varianceInMonths,
    varianceInDays,
    isAchieved,
  };
}
