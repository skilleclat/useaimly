/**
 * Useaimly Decision Intelligence Domain Types
 * Captures decision inputs, simulated trajectory impacts, and plan affordability metrics.
 */

import { CurrencyCode } from "./finance";
import { GoalEvaluationResult } from "./goal";

export type DecisionType = 
  | "ONE_OFF_PURCHASE"
  | "RECURRING_EXPENSE"
  | "INCOME_CHANGE"
  | "WINDFALL"
  | "DEBT_ACCELERATION"
  | "GOAL_CONTRIBUTION_CHANGE";

export type PlanAffordabilityStatus = 
  | "AFFORDABLE_NO_IMPACT"
  | "AFFORDABLE_NEGLIGIBLE_DELAY"
  | "AFFORDABLE_NOTICEABLE_DELAY"
  | "PLAN_DISRUPTIVE_SEVERE_DELAY"
  | "UNAFFORDABLE_CASH_DEFICIT";

export interface FinancialDecision {
  id?: string;
  title: string;
  type: DecisionType;
  amount: number;
  currency: CurrencyCode;
  recurringFrequency?: "MONTHLY" | "ANNUAL";
  effectiveDate?: string;
  targetGoalId?: string; // Optional: specific goal to compare against, or applies globally
  notes?: string;
}

export interface GoalImpactComparison {
  goalId: string;
  goalTitle: string;
  targetAmount: number;
  baselineCompletionDate: string;
  simulatedCompletionDate: string;
  originalTargetDate: string;
  delayInMonths: number;
  delayInDays: number;
  isDelayed: boolean;
  baselineFeasibility: string;
  simulatedFeasibility: string;
  additionalMonthlySavingsRequired: number; // to recover to baseline target date
}

export interface TrajectoryPoint {
  date: string; // "YYYY-MM"
  monthIndex: number;
  baselineNetWorth: number;
  simulatedNetWorth: number;
  baselineGoalProgress: number;
  simulatedGoalProgress: number;
  baselineCash: number;
  simulatedCash: number;
}

export interface RecoveryPlan {
  feasible: boolean;
  additionalMonthlyAmountRequired: number;
  recoveryTimelineMonths: number;
  suggestedDiscretionaryCuts?: {
    category: string;
    suggestedCut: number;
  }[];
  explanation: string;
}

export interface DecisionSimulationResult {
  decision: FinancialDecision;
  cashAffordable: boolean;
  planAffordabilityStatus: PlanAffordabilityStatus;
  availableCashBefore: number;
  availableCashAfter: number;
  monthlyFreeCashFlowBefore: number;
  monthlyFreeCashFlowAfter: number;
  primaryGoalImpact: GoalImpactComparison;
  allGoalsImpact: GoalImpactComparison[];
  trajectory: TrajectoryPoint[];
  recoveryPlan: RecoveryPlan;
  keyTakeaway: string;
  calculatedAt: string;
}
