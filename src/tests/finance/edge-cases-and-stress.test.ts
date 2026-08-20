import { describe, it, expect } from "vitest";
import { normalizeToMonthly } from "@/lib/finance/normalization/frequency-normalizer";
import { calculateCashFlowSummary } from "@/lib/finance/calculations/cash-flow";
import { evaluateGoal } from "@/lib/finance/goal-logic/goal-evaluator";
import { simulateDecision } from "@/lib/finance/decision-simulations/decision-engine";
import { formatCurrency } from "@/lib/utils/currency";
import {
  FinancialProfile,
  CashFlowItem,
  FinancialAccount,
} from "@/lib/types/finance";
import { FinancialGoal } from "@/lib/types/goal";
import { FinancialDecision } from "@/lib/types/decision";

describe("Production Financial Engine: Stress & Edge Cases", () => {
  const baseAccounts: FinancialAccount[] = [
    {
      id: "acc-1",
      name: "Emergency Reserve",
      category: "LIQUID_CASH",
      balance: 180000,
      isAccessibleForGoals: true,
    },
    {
      id: "acc-2",
      name: "Sacco Shares",
      category: "SAVINGS",
      balance: 60000,
      isAccessibleForGoals: true,
    },
  ];

  const baseCashFlowItems: CashFlowItem[] = [
    {
      id: "cf-inc-1",
      name: "Primary Salary",
      amount: 150000,
      frequency: "MONTHLY",
      type: "INCOME",
    },
    {
      id: "cf-inc-2",
      name: "Weekly Consulting",
      amount: 10000,
      frequency: "WEEKLY", // (10000 * 52) / 12 = 43333.33
      type: "INCOME",
    },
    {
      id: "cf-exp-1",
      name: "Apartment Rent",
      amount: 45000,
      frequency: "MONTHLY",
      type: "FIXED_EXPENSE",
    },
    {
      id: "cf-exp-2",
      name: "Annual Insurance",
      amount: 60000,
      frequency: "ANNUAL", // 5000/mo
      type: "FIXED_EXPENSE",
    },
    {
      id: "cf-debt-1",
      name: "Vehicle Facility",
      amount: 15000,
      frequency: "MONTHLY",
      type: "DEBT_SERVICE",
    },
  ];

  const baseProfile: FinancialProfile = {
    id: "prof-stress-1",
    userId: "user-stress-1",
    currency: "KES",
    accounts: baseAccounts,
    cashFlowItems: baseCashFlowItems,
    emergencyFundTargetMonths: 3,
    monthlyAllocationPreference: {
      maxGoalAllocationRate: 0.85,
      bufferMargin: 0.15,
    },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  const primaryGoal: FinancialGoal = {
    id: "goal-stress-1",
    userId: "user-stress-1",
    title: "Start my business",
    category: "BUSINESS",
    targetAmount: 500000,
    currentAmount: 180000,
    targetDate: "2027-12-31",
    priority: "CRITICAL",
    currency: "KES",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  describe("1. Frequency Normalization & Stress Inflows", () => {
    it("converts weekly, biweekly, quarterly, and annual streams deterministically", () => {
      expect(normalizeToMonthly(1000, "DAILY")).toBeCloseTo(30416.67, 1);
      expect(normalizeToMonthly(7000, "WEEKLY")).toBeCloseTo(30333.33, 1);
      expect(normalizeToMonthly(20000, "BIWEEKLY")).toBeCloseTo(43333.33, 1);
      expect(normalizeToMonthly(15000, "QUARTERLY")).toBe(5000);
      expect(normalizeToMonthly(120000, "YEARLY")).toBe(10000);
      expect(normalizeToMonthly(120000, "ANNUAL")).toBe(10000);
    });

    it("calculates multi-frequency cash flow summary accurately", () => {
      const summary = calculateCashFlowSummary(baseCashFlowItems);
      expect(summary.monthlyGrossIncome).toBeCloseTo(193333.33, 1);
      expect(summary.monthlyFixedExpenses).toBe(50000);
      expect(summary.monthlyDebtService).toBe(15000);
      expect(summary.monthlyFreeCashFlow).toBeGreaterThan(120000);
    });
  });

  describe("2. Decision Simulation Trajectory Shift Stress Test", () => {
    it("detects trajectory delay when a recurring expense reduces destination allocation", () => {
      const decision: FinancialDecision = {
        title: "Luxury Lease Upgrade",
        type: "RECURRING_EXPENSE",
        amount: 80000,
        currency: "KES",
      };

      const result = simulateDecision(baseProfile, [primaryGoal], decision);
      expect(result.cashAffordable).toBe(true);
      expect(result.monthlyFreeCashFlowAfter).toBeLessThan(result.monthlyFreeCashFlowBefore);
      expect(result.primaryGoalImpact.isDelayed).toBe(true);
      expect(result.primaryGoalImpact.delayInMonths).toBeGreaterThan(0);
    });

    it("detects cash deficit when one-off expense exceeds available liquid reserves", () => {
      const decision: FinancialDecision = {
        title: "Supercar Downpayment",
        type: "ONE_OFF_PURCHASE",
        amount: 300000, // 300k > 180k liquid
        currency: "KES",
      };

      const result = simulateDecision(baseProfile, [primaryGoal], decision);
      expect(result.cashAffordable).toBe(false);
      expect(result.planAffordabilityStatus).toBe("UNAFFORDABLE_CASH_DEFICIT");
    });
  });

  describe("3. Completed & Zero-Target Destinations", () => {
    it("evaluates completed destination accurately", () => {
      const completedGoal: FinancialGoal = {
        ...primaryGoal,
        currentAmount: 550000, // > 500000
      };

      const evaluation = evaluateGoal(completedGoal, 40000, new Date("2026-08-20"));
      expect(evaluation.remainingAmount).toBe(0);
      expect(evaluation.feasibility).toBe("ACHIEVED");
    });
  });

  describe("4. Multi-Currency Format Precision", () => {
    it("formats amounts properly across all supported currencies", () => {
      expect(formatCurrency(50000, "KES")).toBe("KES 50,000");
      expect(formatCurrency(50000, "USD")).toBe("$ 50,000");
      expect(formatCurrency(50000, "EUR")).toBe("€ 50,000");
      expect(formatCurrency(50000, "GBP")).toBe("£ 50,000");
    });
  });
});
