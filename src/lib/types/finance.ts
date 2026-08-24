/**
 * Useaimly Financial Domain Types
 * Core financial building blocks and data contracts.
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "KES" | "CAD" | "NGN" | "ZAR" | "XOF" | "UGX" | "TZS" | "RWF";

export type Frequency = "MONTHLY" | "ANNUAL" | "ONE_OFF" | "BI_WEEKLY" | "WEEKLY";

export type CashFlowType = "INCOME" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE" | "DEBT_SERVICE";

export type AccountCategory = "LIQUID_CASH" | "SAVINGS" | "INVESTMENT" | "LOCKED_RETIREMENT" | "DEBT";

export interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  type: CashFlowType;
  category?: string;
  isDiscretionary?: boolean;
}

export interface FinancialAccount {
  id: string;
  name: string;
  category: AccountCategory;
  balance: number;
  interestRate?: number; // annual percentage, e.g., 0.08 for 8%
  isAccessibleForGoals?: boolean;
}

export interface FinancialProfile {
  id: string;
  userId: string;
  currency: CurrencyCode;
  accounts: FinancialAccount[];
  cashFlowItems: CashFlowItem[];
  emergencyFundTargetMonths: number;
  monthlyAllocationPreference: {
    maxGoalAllocationRate: number; // e.g. 0.8 (80% of free cash flow)
    bufferMargin: number; // e.g. 0.1 (10% safety cushion)
  };
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowSummary {
  monthlyGrossIncome: number;
  monthlyNetIncome: number;
  monthlyFixedExpenses: number;
  monthlyVariableExpenses: number;
  monthlyTotalExpenses: number;
  monthlyDebtService: number;
  monthlyFreeCashFlow: number;
  savingsRate: number; // percentage (0.0 to 1.0)
  discretionaryIncome: number;
}

export interface NetWorthSummary {
  totalAssets: number;
  liquidCash: number;
  accessibleLiquidCash: number;
  emergencyReserves: number;
  investableAssets: number;
  lockedAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidRunwayMonths: number; // liquid cash / monthly total expenses
}

// ==============================================================================
// CANONICAL DECISION MODEL & INVARIANTS
// ==============================================================================
export type CanonicalDecisionStatus = "GO" | "ADJUST" | "PAUSE";
export type CanonicalGoalStatus = "ACHIEVED" | "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
export type CanonicalConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type CanonicalReserveFloorStatus = "SATISFIED" | "BELOW_MINIMUM";
export type CanonicalReserveTargetStatus = "SATISFIED" | "BELOW_TARGET" | "ABOVE_TARGET";

export interface StructuredActionPayload {
  actionRequired: boolean;
  actionType: "REALLOCATE_TO_RESERVES" | "MAINTAIN_ALLOCATION" | "INCREASE_ALLOCATION" | "REDUCE_OUTFLOWS" | "PAUSE_PURCHASE" | "SAVE_IN_ADVANCE";
  actionTarget: string; // e.g. "EMERGENCY_RESERVES" | "PRIMARY_GOAL"
  currentValue: number;
  recommendedValue: number;
  description: string;
}

export interface CanonicalFinancialDecision {
  analysisDate: string; // ISO date YYYY-MM-DD
  currency: CurrencyCode;

  // Baseline Capacity
  monthlyIncome: number;
  mandatoryOutflows: number;
  freeCashFlow: number;

  // Reserve Protection (Dual Thresholds)
  liquidReserves: number;
  reserveMonths: number;
  reserveMinimumMonths: number; // default 1.0
  reserveTargetMonths: number; // default 3.0
  minimumReserveStatus: CanonicalReserveFloorStatus;
  targetReserveStatus: CanonicalReserveTargetStatus;

  // Primary Goal Metrics (Normalized & Invariant-Checked)
  destinationTitle: string;
  targetAmount: number;
  confirmedSaved: number;
  remainingGap: number;
  currentMonthlyAllocation: number;
  requiredMonthlyAllocation: number;
  additionalFundingRequired: number;

  // Explicit Canonical Dates
  targetDate: string; // ISO date YYYY-MM-DD
  projectedCompletionDate: string; // ISO date YYYY-MM-DD
  trajectoryDelayMonths: number;

  // Dimension Separation
  goalStatus: CanonicalGoalStatus;
  purchaseDecision: CanonicalDecisionStatus;
  confidence: CanonicalConfidenceLevel;
  confidenceReasons: string[];

  // Shortfall & Action Plan (Guaranteed Non-Contradictory)
  shortfallAmount: number;
  shortfallReason: string | null;

  structuredAction: StructuredActionPayload;
  recommendedAction: string;

  headlineVerdict: string;
  strategicRead: string;
  masterStrategyParagraph: string;

  assumptions: string[];
  missingVariables: string[];
  warnings: string[];
}


