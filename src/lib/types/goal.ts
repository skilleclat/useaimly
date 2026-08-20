/**
 * Useaimly Goal Domain Types
 * User defined destinations and milestone definitions.
 */

import { CurrencyCode } from "./finance";

export type GoalCategory = 
  | "BUSINESS"
  | "EMERGENCY_FUND"
  | "REAL_ESTATE"
  | "EDUCATION"
  | "VEHICLE"
  | "TRAVEL"
  | "RETIREMENT"
  | "MAJOR_PURCHASE"
  | "OTHER";

export type GoalPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type GoalFeasibility = "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "ACHIEVED" | "UNDERFUNDED";

export interface GoalMilestone {
  id: string;
  name: string;
  targetAmount: number;
  expectedDate: string; // ISO 8601 YYYY-MM-DD
  achieved: boolean;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO string YYYY-MM-DD
  currency: CurrencyCode;
  monthlyAllocation?: number; // Dedicated monthly contribution, if set explicitly
  milestones?: GoalMilestone[];
  isLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalEvaluationResult {
  goalId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  monthlyRequiredAmount: number; // required to hit targetDate
  monthlyAllocatedAmount: number; // actual allocated from free cash flow
  projectedCompletionDate: string; // ISO string
  targetDate: string;
  feasibility: GoalFeasibility;
  varianceInMonths: number; // 0 if on time, >0 if delayed, <0 if ahead of schedule
  varianceInDays: number;
  isAchieved: boolean;
}
