/**
 * Useaimly Goal Domain Types
 * The Aimly Goal Intelligence System — Living financial trajectory data models.
 */

import { CurrencyCode } from "./finance";

// Core Supported Goal Types
export type GoalType =
  | "BUY_A_HOUSE"
  | "BUY_A_CAR"
  | "START_A_BUSINESS"
  | "EMERGENCY_FUND"
  | "INVESTMENT_TARGET"
  | "EDUCATION"
  | "TRAVEL"
  | "RETIREMENT"
  | "CUSTOM_GOAL"
  // Legacy category compatibility
  | "BUSINESS"
  | "REAL_ESTATE"
  | "VEHICLE"
  | "MAJOR_PURCHASE"
  | "OTHER";

export type GoalCategory = GoalType;

export type GoalPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type GoalFlexibilityOfDeadline = "STRICT" | "MODERATE" | "FLEXIBLE";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED" | "ARCHIVED";

export type ContributionFrequency =
  | "MONTHLY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "QUARTERLY"
  | "YEARLY"
  | "ONE_OFF";

export type GoalHealthClassification =
  | "ON_TRACK"
  | "WATCH"
  | "AT_RISK"
  | "DELAYED"
  | "CRITICAL";

export type GoalFeasibility = "ON_TRACK" | "WATCH" | "AT_RISK" | "OFF_TRACK" | "DELAYED" | "CRITICAL" | "ACHIEVED" | "UNDERFUNDED";

export interface GoalMilestone {
  id: string;
  name: string;
  targetAmount: number;
  expectedDate: string; // ISO 8601 YYYY-MM-DD
  achieved: boolean;
}

/**
 * Goal Delay & Schedule Variance Intelligence
 */
export interface GoalDelayData {
  scheduleVarianceMonths: number; // <0 ahead, 0 on-time, >0 delayed
  scheduleVarianceDays: number;
  isDelayed: boolean;
  isAhead: boolean;
  isOnTrack: boolean;
  delayClassification: "ON_TIME" | "SLIGHT_DELAY" | "MODERATE_DELAY" | "SEVERE_DELAY";
}

/**
 * Core Living Goal Model
 * Supports both standard camelCase and direct database/API snake_case properties.
 */
export interface FinancialGoal {
  id: string;
  goal_id?: string;
  userId?: string;
  user_id?: string;
  title: string;
  customGoalName?: string;
  custom_goal_name?: string;
  description?: string;
  category: GoalCategory;
  goalType?: GoalType;
  goal_type?: GoalType;
  priority: GoalPriority;
  targetAmount: number;
  target_amount?: number;
  currentAmount: number;
  current_amount?: number;
  targetDate: string; // ISO string YYYY-MM-DD
  target_date?: string;
  startDate?: string; // ISO string YYYY-MM-DD
  start_date?: string;
  currency: CurrencyCode;
  monthlyAllocation?: number; // Dedicated monthly contribution, if set explicitly
  monthlyContribution?: number; // Alias for monthlyAllocation
  monthly_contribution?: number;
  contributionFrequency?: ContributionFrequency;
  contribution_frequency?: ContributionFrequency;
  flexibilityOfDeadline?: GoalFlexibilityOfDeadline;
  flexibility_of_deadline?: GoalFlexibilityOfDeadline;
  minimumRequiredAmount?: number;
  minimum_required_amount?: number;
  expectedGrowthRate?: number; // e.g. 0.05 for 5% annual growth
  expected_growth_rate?: number;
  goalStatus?: GoalStatus;
  goal_status?: GoalStatus;
  status?: GoalStatus;
  milestones?: GoalMilestone[];
  isLocked?: boolean;
  isPrimary?: boolean;
  dedicatedAccountIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Trajectory point in a living goal projection
 */
export interface GoalTrajectoryPoint {
  monthIndex: number;
  date: string;
  accumulatedAmount: number;
  targetAmount: number;
  monthlyContribution: number;
  growthAmount: number;
  isReached: boolean;
}

/**
 * Trajectory sensitivity: Impact of changing monthly contribution
 */
export interface ContributionSensitivityImpact {
  percentageChange: number; // e.g. +25 for +25%, -20 for -20%
  monthlyAmount: number;
  additionalMonthly: number;
  estimatedCompletionDate: string;
  monthsDelta: number; // negative = saved, positive = delayed
  isAchievableBeforeDeadline: boolean;
}

/**
 * Trajectory sensitivity: Impact of one-time capital withdrawal / decision shock
 */
export interface WithdrawalSensitivityImpact {
  withdrawalAmount: number;
  remainingAmountAfterWithdrawal: number;
  newEstimatedCompletionDate: string;
  delayMonths: number;
  delayDays: number;
  requiredMonthlyRecovery: number; // extra monthly needed to restore target date
}

/**
 * Goal Trajectory Data Output
 */
export interface GoalTrajectoryData {
  currentProgress: number; // percentage (0-100)
  remainingAmount: number;
  projectedMonthlyProgress: number; // amount accumulating per month
  estimatedCompletionDate: string; // ISO string
  scheduleVarianceMonths: number; // <0 ahead, 0 on-time, >0 delayed
  scheduleVarianceDays: number;
  requiredMonthlyContribution: number; // exact pace needed to hit targetDate
  allocatedMonthlyContribution: number;
  monthlySurplus: number;
  monthlyShortfall: number;
  impactOfIncreasedContributions: ContributionSensitivityImpact[];
  impactOfReducedContributions: ContributionSensitivityImpact[];
  impactOfOneTimeWithdrawals: WithdrawalSensitivityImpact[];
  trajectoryPoints: GoalTrajectoryPoint[];
  isAchievable: boolean;
}

/**
 * Goal Health Intelligence
 */
export interface GoalHealth {
  classification: GoalHealthClassification;
  primaryReason: string;
  contributingFactors: string[];
  currentTrajectory: string;
  recommendedRecoveryPath?: {
    monthlyContributionIncrease?: number;
    targetDateDelayMonths?: number;
    targetAmountReduction?: number;
    summary: string;
  };
}

/**
 * Goal Risk Intelligence
 */
export interface GoalRisk {
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  primaryThreats: string[];
  marketExposure: boolean;
  inflationExposure: boolean;
  timePressure: "NONE" | "MODERATE" | "HIGH";
  riskScore: number; // 0 (safest) - 100 (highest risk)
}

/**
 * Goal Confidence Intelligence
 */
export interface GoalConfidence {
  level: "HIGH" | "MEDIUM" | "LOW";
  score: number; // 0-100
  keyAssumptions: string[];
  missingVariables: string[];
  reasoning: string;
}

/**
 * Goal Robustness & Resilience Intelligence
 */
export interface GoalRobustness {
  resilienceScore: number; // 0-100
  maxSustainableWithdrawal: number; // max one-time shock without missing flexible deadline
  maxTolerableDelayMonths: number;
  bufferMonths: number;
  resilienceSummary: string;
}

/**
 * Goal Dependencies & Relationships
 */
export interface GoalDependency {
  targetGoalId: string;
  targetGoalTitle: string;
  dependencyType: "PREREQUISITE" | "SHARED_FUNDING" | "COMPETING" | "CUSHION";
  relationshipDescription: string;
  isBlocking: boolean;
}

/**
 * Goal Impact Events
 */
export interface GoalImpactEvent {
  id: string;
  eventType: "DECISION" | "WITHDRAWAL" | "WINDFALL" | "ALLOCATION_CHANGE" | "INCOME_SHOCK";
  timestamp: string;
  amount: number;
  sourceDecisionId?: string;
  delayDaysDelta: number;
  notes: string;
}

/**
 * Goal Accelerators & Threats
 */
export interface GoalAccelerator {
  description: string;
  potentialMonthsSaved: number;
  additionalContributionRequired: number;
}

export interface GoalThreat {
  threatType: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  potentialDelayMonths: number;
}

/**
 * Complete Aimly Goal Intelligence Model
 */
export interface AimlyGoalIntelligenceModel {
  goalId: string;
  core: FinancialGoal;
  trajectory: GoalTrajectoryData;
  health: GoalHealth;
  risk: GoalRisk;
  confidence: GoalConfidence;
  robustness: GoalRobustness;
  delays: GoalDelayData;
  dependencies: GoalDependency[];
  impactEvents: GoalImpactEvent[];
  accelerators: GoalAccelerator[];
  threats: GoalThreat[];
}

/**
 * Human-readable mapping for all 9 supported Goal Types
 */
export const GOAL_TYPE_LABELS: Record<GoalType, { en: string; fr: string; iconName: string }> = {
  BUY_A_HOUSE: { en: "Buy a House", fr: "Acheter un bien immobilier", iconName: "Home" },
  BUY_A_CAR: { en: "Buy a Car", fr: "Acheter un véhicule", iconName: "Car" },
  START_A_BUSINESS: { en: "Start a Business", fr: "Lancer une entreprise", iconName: "Briefcase" },
  EMERGENCY_FUND: { en: "Emergency Fund", fr: "Fonds d'urgence", iconName: "ShieldCheck" },
  INVESTMENT_TARGET: { en: "Investment Target", fr: "Objectif d'investissement", iconName: "TrendingUp" },
  EDUCATION: { en: "Education", fr: "Études & Formation", iconName: "GraduationCap" },
  TRAVEL: { en: "Travel", fr: "Voyages & Aventures", iconName: "Plane" },
  RETIREMENT: { en: "Retirement", fr: "Retraite & Indépendance", iconName: "Compass" },
  CUSTOM_GOAL: { en: "Custom Goal", fr: "Objectif personnalisé", iconName: "Target" },
  // Legacy aliases
  BUSINESS: { en: "Start a Business", fr: "Lancer une entreprise", iconName: "Briefcase" },
  REAL_ESTATE: { en: "Buy a House", fr: "Acheter un bien immobilier", iconName: "Home" },
  VEHICLE: { en: "Buy a Car", fr: "Acheter un véhicule", iconName: "Car" },
  MAJOR_PURCHASE: { en: "Major Purchase", fr: "Achat majeur", iconName: "Tag" },
  OTHER: { en: "Custom Goal", fr: "Objectif personnalisé", iconName: "Target" },
};

/**
 * Normalizes any partial or snake_case goal input into a canonical FinancialGoal
 */
export function normalizeGoalData(input: Partial<FinancialGoal> | Record<string, any>): FinancialGoal {
  const id = input.id || input.goal_id || `goal-${Date.now()}`;
  const title = input.title || input.custom_goal_name || input.customGoalName || "Financial Goal";
  const customGoalName = input.customGoalName || input.custom_goal_name || title;
  const category = (input.category || input.goalType || input.goal_type || "CUSTOM_GOAL") as GoalCategory;
  const priority = (input.priority || "HIGH") as GoalPriority;
  const targetAmount = Number(input.targetAmount ?? input.target_amount ?? 0);
  const currentAmount = Number(input.currentAmount ?? input.current_amount ?? 0);
  const targetDate = input.targetDate || input.target_date || new Date().toISOString().split("T")[0];
  const startDate = input.startDate || input.start_date;
  const currency = input.currency || "KES";
  const monthlyAllocation = Number(
    input.monthlyAllocation ?? input.monthlyContribution ?? input.monthly_contribution ?? 0
  );
  const contributionFrequency = (input.contributionFrequency || input.contribution_frequency || "MONTHLY") as ContributionFrequency;
  const flexibilityOfDeadline = (input.flexibilityOfDeadline || input.flexibility_of_deadline || "MODERATE") as GoalFlexibilityOfDeadline;
  const minimumRequiredAmount = input.minimumRequiredAmount ?? input.minimum_required_amount;
  const expectedGrowthRate = input.expectedGrowthRate ?? input.expected_growth_rate;
  const goalStatus = (input.goalStatus || input.goal_status || input.status || "ACTIVE") as GoalStatus;

  return {
    id,
    userId: input.userId || input.user_id,
    title,
    customGoalName,
    description: input.description,
    category,
    goalType: category,
    priority,
    targetAmount,
    currentAmount,
    targetDate,
    startDate,
    currency,
    monthlyAllocation,
    monthlyContribution: monthlyAllocation,
    contributionFrequency,
    flexibilityOfDeadline,
    minimumRequiredAmount: minimumRequiredAmount !== undefined ? Number(minimumRequiredAmount) : undefined,
    expectedGrowthRate: expectedGrowthRate !== undefined ? Number(expectedGrowthRate) : undefined,
    goalStatus,
    status: goalStatus,
    milestones: input.milestones,
    isLocked: input.isLocked,
    isPrimary: input.isPrimary,
    dedicatedAccountIds: input.dedicatedAccountIds,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

/**
 * Backwards compatibility interface for existing evaluation results
 */
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
  intelligence?: AimlyGoalIntelligenceModel;
}


