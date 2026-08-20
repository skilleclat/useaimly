import { CurrencyCode, Frequency } from "../types/finance";
import { GoalPriority } from "../types/goal";

export interface OnboardingDestination {
  presetKey: string;
  title: string;
  description?: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: GoalPriority;
}

export interface OnboardingIncomeItem {
  id: string;
  name: string;
  amount: number;
  frequency: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY" | "ONE_OFF" | "IRREGULAR";
  reliability: "STABLE" | "VARIABLE" | "ONE_OFF";
}

export interface OnboardingExpenseItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "MONTHLY" | "ANNUAL" | "WEEKLY" | "BI_WEEKLY";
  isFixed: boolean;
}

export interface OnboardingDebtItem {
  id: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  interestRate?: number;
}

export interface OnboardingSavingsAccount {
  id: string;
  name: string;
  balance: number;
  type: "CHECKING" | "SAVINGS" | "MMF" | "LOCKED";
  isAssignedToPrimaryGoal: boolean;
}

export interface OnboardingCommitmentItem {
  id: string;
  title: string;
  amount: number;
  frequency: "ANNUAL" | "MONTHLY" | "ONE_OFF" | "TERM";
  nextDueDate: string;
  category: string;
}

export interface OnboardingState {
  currency: CurrencyCode;
  destination: OnboardingDestination;
  income: OnboardingIncomeItem[];
  expenses: OnboardingExpenseItem[];
  hasDebt: boolean;
  debts: OnboardingDebtItem[];
  savings: OnboardingSavingsAccount[];
  commitments: OnboardingCommitmentItem[];
}

export interface OnboardingCalculatedPath {
  monthlyGrossIncome: number;
  monthlyEssentialExpenses: number;
  monthlyDebtPayments: number;
  monthlyCommitmentsAmortized: number;
  monthlyFreeCashFlow: number;
  totalLiquidSavings: number;
  assignedGoalCapital: number;
  unallocatedLiquidCash: number;
  remainingShortfall: number;
  monthsToTargetDate: number;
  requiredMonthlySavings: number;
  projectedMonthsToCompletion: number;
  projectedCompletionDate: string;
  trajectoryState: "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "AHEAD";
  paceRatio: number; // monthlyFreeCashFlow / requiredMonthlySavings
}
