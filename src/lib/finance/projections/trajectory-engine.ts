/**
 * Deterministic Trajectory Forecast Engine
 * Pure TypeScript, zero external dependencies.
 * Generates month-by-month financial forward simulation points.
 */

import { FinancialAccount } from "../../types/finance";
import { FinancialGoal } from "../../types/goal";
import { TrajectoryPoint } from "../../types/decision";
import { addMonths, formatMonthYear } from "../../utils/date";
import { roundTo } from "../../utils/math";

export interface TrajectoryEngineParams {
  startDate: Date;
  horizonMonths: number;
  initialCash: number;
  initialInvestments: number;
  monthlyFreeCashFlow: number;
  primaryGoal: FinancialGoal;
  monthlyGoalAllocation: number;
  // Decision adjustments (optional)
  oneOffCashImpact?: number; // negative for expense, positive for windfall
  monthlyCashFlowDelta?: number; // e.g. -2500 for recurring subscription
  effectiveMonthIndex?: number; // month in which decision happens (0 = immediate)
}

export function generateTrajectoryPoints(
  params: TrajectoryEngineParams
): TrajectoryPoint[] {
  const {
    startDate,
    horizonMonths = 36,
    initialCash,
    monthlyFreeCashFlow,
    primaryGoal,
    monthlyGoalAllocation,
    oneOffCashImpact = 0,
    monthlyCashFlowDelta = 0,
    effectiveMonthIndex = 0,
  } = params;

  const points: TrajectoryPoint[] = [];

  let baselineCash = initialCash;
  let simulatedCash = initialCash;

  let baselineGoalProgress = primaryGoal.currentAmount;
  let simulatedGoalProgress = primaryGoal.currentAmount;

  for (let month = 0; month <= horizonMonths; month++) {
    const currentDate = addMonths(startDate, month);
    const dateLabel = formatMonthYear(currentDate);

    if (month > 0) {
      // Baseline progression
      const baselineAllocated = Math.min(
        monthlyGoalAllocation,
        Math.max(0, primaryGoal.targetAmount - baselineGoalProgress)
      );
      baselineGoalProgress = Math.min(
        primaryGoal.targetAmount,
        baselineGoalProgress + baselineAllocated
      );
      baselineCash = baselineCash + (monthlyFreeCashFlow - baselineAllocated);

      // Simulated progression
      const activeMonthlyCashFlow =
        month >= effectiveMonthIndex
          ? monthlyFreeCashFlow + monthlyCashFlowDelta
          : monthlyFreeCashFlow;

      // Apply one-off impact at designated month
      if (month === effectiveMonthIndex + 1 && oneOffCashImpact !== 0) {
        simulatedCash = simulatedCash + oneOffCashImpact;
      }

      // If one-off impact created a cash shortfall or goal draws directly from cash:
      const simulatedAllocated = Math.min(
        Math.max(0, activeMonthlyCashFlow * (monthlyGoalAllocation / (monthlyFreeCashFlow || 1))),
        Math.max(0, primaryGoal.targetAmount - simulatedGoalProgress)
      );

      simulatedGoalProgress = Math.min(
        primaryGoal.targetAmount,
        simulatedGoalProgress + simulatedAllocated
      );
      simulatedCash = simulatedCash + (activeMonthlyCashFlow - simulatedAllocated);
    } else {
      // Month 0: immediate state
      if (effectiveMonthIndex === 0 && oneOffCashImpact !== 0) {
        simulatedCash = Math.max(0, initialCash + oneOffCashImpact);
      }
    }

    points.push({
      date: dateLabel,
      monthIndex: month,
      baselineNetWorth: roundTo(baselineCash + baselineGoalProgress),
      simulatedNetWorth: roundTo(simulatedCash + simulatedGoalProgress),
      baselineGoalProgress: roundTo(baselineGoalProgress),
      simulatedGoalProgress: roundTo(simulatedGoalProgress),
      baselineCash: roundTo(baselineCash),
      simulatedCash: roundTo(simulatedCash),
    });
  }

  return points;
}
