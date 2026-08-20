/**
 * Useaimly Baseline Demo Profiles & Fixtures
 * Realistic baseline state for demo, onboarding, and deterministic simulations.
 */

import { FinancialProfile } from "../types/finance";
import { FinancialGoal } from "../types/goal";
import { FinancialDecision } from "../types/decision";

export const INITIAL_DEMO_PROFILE: FinancialProfile = {
  id: "demo-profile-1",
  userId: "user-1",
  currency: "KES",
  accounts: [
    {
      id: "acc-1",
      name: "Checking / M-Pesa Buffer",
      category: "LIQUID_CASH",
      balance: 85000,
      isAccessibleForGoals: true,
    },
    {
      id: "acc-2",
      name: "High Yield Savings / MMF",
      category: "SAVINGS",
      balance: 140000,
      interestRate: 0.12,
      isAccessibleForGoals: true,
    },
    {
      id: "acc-3",
      name: "Emergency Fund",
      category: "LIQUID_CASH",
      balance: 120000,
      isAccessibleForGoals: false,
    },
  ],
  cashFlowItems: [
    {
      id: "cf-1",
      name: "Primary Salary / Consulting",
      amount: 180000,
      frequency: "MONTHLY",
      type: "INCOME",
    },
    {
      id: "cf-2",
      name: "Rent & Utilities",
      amount: 55000,
      frequency: "MONTHLY",
      type: "FIXED_EXPENSE",
    },
    {
      id: "cf-3",
      name: "Groceries & Household",
      amount: 30000,
      frequency: "MONTHLY",
      type: "FIXED_EXPENSE",
    },
    {
      id: "cf-4",
      name: "Transport & Fuel",
      amount: 15000,
      frequency: "MONTHLY",
      type: "VARIABLE_EXPENSE",
    },
    {
      id: "cf-5",
      name: "Discretionary / Dining / Subscriptions",
      amount: 25000,
      frequency: "MONTHLY",
      type: "VARIABLE_EXPENSE",
      isDiscretionary: true,
    },
  ],
  emergencyFundTargetMonths: 6,
  monthlyAllocationPreference: {
    maxGoalAllocationRate: 0.85,
    bufferMargin: 0.15,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-08-19T00:00:00.000Z",
};

export const INITIAL_DEMO_GOALS: FinancialGoal[] = [
  {
    id: "goal-biz-1",
    userId: "user-1",
    title: "Start my business",
    description: "Launch consultancy & digital studio venture capital reserve",
    category: "BUSINESS",
    priority: "CRITICAL",
    targetAmount: 500000,
    currentAmount: 180000,
    targetDate: "2027-12-31",
    currency: "KES",
    monthlyAllocation: 20000,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-19T00:00:00.000Z",
  },
];

export const INITIAL_DEMO_DECISION: FinancialDecision = {
  title: "New Phone Purchase",
  type: "ONE_OFF_PURCHASE",
  amount: 30000,
  currency: "KES",
  notes: "Upgrade primary smartphone for work",
};
