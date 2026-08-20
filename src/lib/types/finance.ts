/**
 * Useaimly Financial Domain Types
 * Core financial building blocks and data contracts.
 */

export type CurrencyCode = "KES" | "USD" | "EUR" | "GBP" | "UGX" | "TZS" | "RWF";

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
