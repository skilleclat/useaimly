/**
 * Useaimly Financial Engine Core Domain Types
 */

export type CalculationFrequency =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "ANNUAL"
  | "TERM"
  | "ONE_OFF"
  | "IRREGULAR";

export type IncomeReliability = "STABLE" | "VARIABLE" | "ONE_OFF";

export type DecisionImpactStatus = "SAFE" | "MANAGEABLE" | "HIGH_IMPACT" | "OFF_TRACK";

export type GoalEvaluationStatus =
  | "AHEAD"
  | "ON_TRACK"
  | "AT_RISK"
  | "OFF_TRACK"
  | "COMPLETED"
  | "OVERDUE";

export interface NormalizedIncomeStream {
  id?: string;
  name: string;
  amount: number;
  frequency: CalculationFrequency;
  reliability?: IncomeReliability;
  isActive?: boolean;
}

export interface NormalizedExpenseItem {
  id?: string;
  name: string;
  category?: string;
  amount: number;
  frequency: CalculationFrequency;
  isFixed?: boolean;
}

export interface NormalizedDebtItem {
  id?: string;
  name: string;
  originalAmount?: number;
  currentBalance: number;
  monthlyPayment: number;
  interestRate?: number; // annual percentage, e.g. 12%
}

export interface NormalizedCommitmentItem {
  id?: string;
  title: string;
  amount: number;
  frequency: CalculationFrequency;
  nextDueDate?: string;
  category?: string;
}

export interface NormalizedGoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string YYYY-MM-DD
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status?: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
}

export interface CashFlowSummary {
  monthlyGrossIncome: number;
  monthlyEssentialExpenses: number;
  monthlyDiscretionaryExpenses: number;
  totalMonthlyExpenses: number;
  monthlyDebtPayments: number;
  monthlyCommitments: number;
  monthlyFreeCashFlow: number;
  savingsRatePercentage: number;
}

export interface GoalCalculationResult {
  goalId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  targetDate: string;
  monthsUntilTargetDate: number;
  daysUntilTargetDate: number;
  requiredMonthlyContribution: number;
  allocatedMonthlyContribution: number;
  projectedCompletionDate: string;
  projectedMonthsToCompletion: number;
  projectedDaysToCompletion: number;
  monthlySurplus: number;
  monthlyShortfall: number;
  progressPercentage: number;
  status: GoalEvaluationStatus;
  isAchievable: boolean;
  notes: string;
}

export interface ThreePillarAffordability {
  // Pillar 1: Cash Affordability (Can the user physically pay now?)
  canPhysicallyPay: boolean;
  availableLiquidCash: number;
  cashRemainingAfterDecision: number;
  cashDeficit: number;

  // Pillar 2: Obligation Resilience (Does it preserve fixed expenses, debt, and buffer?)
  preservesEssentialObligations: boolean;
  minRecommendedBuffer: number;
  bufferRemaining: number;
  obligationsPreservedMonths: number;

  // Pillar 3: Plan Affordability (Does it preserve the primary goal trajectory?)
  preservesGoalTrajectory: boolean;
  trajectoryDelayDays: number;
  additionalMonthlyToRecover: number;
  percentageOfGoalAffected: number;
}

export interface DecisionSimulationInput {
  decisionTitle: string;
  amount: number;
  isRecurring: boolean;
  recurringFrequency?: CalculationFrequency;
  targetGoalId?: string;
  decisionDate?: string;
}

export interface BaselineFinancialProfile {
  liquidSavings: number;
  incomes: NormalizedIncomeStream[];
  expenses: NormalizedExpenseItem[];
  debts: NormalizedDebtItem[];
  commitments: NormalizedCommitmentItem[];
  goals: NormalizedGoalItem[];
}

export interface DecisionSimulationResult {
  decisionTitle: string;
  amount: number;
  isRecurring: boolean;
  recurringMonthlyAmount: number;

  baseline: {
    liquidSavings: number;
    monthlyFreeCashFlow: number;
    primaryGoal: GoalCalculationResult | null;
  };

  simulated: {
    liquidSavings: number;
    monthlyFreeCashFlow: number;
    primaryGoal: GoalCalculationResult | null;
  };

  // Trajectory Delta
  delta: {
    availableSavingsChange: number;
    monthlyFreeCashFlowChange: number;
    delayInDays: number;
    additionalMonthlyAmountRequired: number;
    percentageOfGoalAffected: number;
    baselineCompletionDate: string;
    newCompletionDate: string;
  };

  // 3-Pillar Affordability Check
  affordability: ThreePillarAffordability;

  // Synthesis & Status
  status: DecisionImpactStatus;
  headlineVerdict: string;
  detailedAnalysis: string;
  recommendation: string;
}
