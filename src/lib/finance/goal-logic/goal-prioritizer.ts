/**
 * Multi-Goal Allocation & Prioritizer Logic
 */

import { FinancialGoal, GoalPriority } from "../../types/goal";
import { roundTo } from "../../utils/math";

const PRIORITY_WEIGHTS: Record<GoalPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function allocateFreeCashFlowToGoals(
  goals: FinancialGoal[],
  monthlyFreeCashFlow: number,
  maxAllocationRate: number = 0.8
): Map<string, number> {
  const allocationMap = new Map<string, number>();
  
  if (goals.length === 0 || monthlyFreeCashFlow <= 0) {
    return allocationMap;
  }

  const allocatableCash = monthlyFreeCashFlow * maxAllocationRate;
  
  // Calculate total weight of non-achieved goals
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
  
  if (activeGoals.length === 0) {
    return allocationMap;
  }

  // If goals have explicit monthly allocations, prioritize them
  let remainingCash = allocatableCash;
  const unassignedGoals: FinancialGoal[] = [];

  for (const goal of activeGoals) {
    if (goal.monthlyAllocation && goal.monthlyAllocation > 0) {
      const allocated = Math.min(goal.monthlyAllocation, remainingCash);
      allocationMap.set(goal.id, roundTo(allocated));
      remainingCash -= allocated;
    } else {
      unassignedGoals.push(goal);
    }
  }

  if (unassignedGoals.length > 0 && remainingCash > 0) {
    const totalWeight = unassignedGoals.reduce(
      (acc, g) => acc + (PRIORITY_WEIGHTS[g.priority] || 1),
      0
    );

    for (const goal of unassignedGoals) {
      const weight = PRIORITY_WEIGHTS[goal.priority] || 1;
      const share = (weight / totalWeight) * remainingCash;
      allocationMap.set(goal.id, roundTo(share));
    }
  }

  return allocationMap;
}
