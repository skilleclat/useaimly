import { describe, it, expect } from "vitest";
import {
  calculateOnboardingPath,
  normalizeToMonthly,
} from "@/lib/onboarding/onboarding-calculator";
import { OnboardingState } from "@/lib/onboarding/onboarding-types";
import { DESTINATION_PRESETS } from "@/lib/onboarding/onboarding-presets";

describe("Onboarding Financial Engine & Calculations", () => {
  const sampleState: OnboardingState = {
    currency: "KES",
    destination: {
      presetKey: "start-business",
      title: "Start my business",
      category: "BUSINESS",
      targetAmount: 500000,
      currentAmount: 120000,
      targetDate: "2028-08-20", // 24 months from 2026-08-20
      priority: "HIGH",
    },
    income: [
      {
        id: "1",
        name: "Primary Salary",
        amount: 180000,
        frequency: "MONTHLY",
        reliability: "STABLE",
      },
    ],
    expenses: [
      { id: "1", name: "Rent", category: "FIXED", amount: 45000, frequency: "MONTHLY", isFixed: true },
      { id: "2", name: "Food", category: "FIXED", amount: 25000, frequency: "MONTHLY", isFixed: true },
      { id: "3", name: "Transport", category: "VARIABLE", amount: 15000, frequency: "MONTHLY", isFixed: false },
      { id: "4", name: "Utilities", category: "FIXED", amount: 8000, frequency: "MONTHLY", isFixed: true },
      { id: "5", name: "Internet", category: "FIXED", amount: 5000, frequency: "MONTHLY", isFixed: true },
      { id: "6", name: "Family Support", category: "FIXED", amount: 15000, frequency: "MONTHLY", isFixed: true },
      { id: "7", name: "Subscriptions", category: "FIXED", amount: 4000, frequency: "MONTHLY", isFixed: true },
    ],
    hasDebt: false,
    debts: [],
    savings: [
      { id: "1", name: "Checking Buffer", balance: 85000, type: "CHECKING", isAssignedToPrimaryGoal: false },
      { id: "2", name: "MMF Goal Capital", balance: 120000, type: "MMF", isAssignedToPrimaryGoal: true },
    ],
    commitments: [
      {
        id: "1",
        title: "Annual Insurance",
        amount: 48000,
        frequency: "ANNUAL",
        nextDueDate: "2027-02-20",
        category: "INSURANCE",
      },
    ],
  };

  const fixedRefDate = new Date("2026-08-20T00:00:00Z");

  it("correctly normalizes different payment frequencies to monthly", () => {
    expect(normalizeToMonthly(120000, "ANNUAL")).toBe(10000);
    expect(normalizeToMonthly(10000, "MONTHLY")).toBe(10000);
    expect(normalizeToMonthly(30000, "TERM")).toBe(7500); // 30k * 3 / 12 = 7.5k
    expect(normalizeToMonthly(1200, "WEEKLY")).toBe(5200); // 1.2k * 52 / 12 = 5.2k
  });

  it("calculates monthly gross income, living expenses, commitments, and free cash flow", () => {
    const result = calculateOnboardingPath(sampleState, fixedRefDate);

    // Income = 180,000
    expect(result.monthlyGrossIncome).toBe(180000);

    // Living Expenses = 45k + 25k + 15k + 8k + 5k + 15k + 4k = 117,000
    expect(result.monthlyEssentialExpenses).toBe(117000);

    // Debt = 0
    expect(result.monthlyDebtPayments).toBe(0);

    // Commitments = 48,000 / 12 = 4,000/mo
    expect(result.monthlyCommitmentsAmortized).toBe(4000);

    // Free Cash Flow = 180,000 - 117,000 - 0 - 4,000 = 59,000
    expect(result.monthlyFreeCashFlow).toBe(59000);
  });

  it("determines required monthly goal contribution and status", () => {
    const result = calculateOnboardingPath(sampleState, fixedRefDate);

    // Shortfall = 500,000 - 120,000 = 380,000
    expect(result.remainingShortfall).toBe(380000);

    // Months to Target = 24
    expect(result.monthsToTargetDate).toBe(24);

    // Required Monthly = 380,000 / 24 = ~15,833
    expect(result.requiredMonthlySavings).toBe(15833);

    // Free Cash Flow (59,000) > Required (15,833) * 1.25 -> AHEAD
    expect(result.trajectoryState).toBe("AHEAD");
  });

  it("flags AT_RISK when free cash flow is below required monthly pace", () => {
    const tightState: OnboardingState = {
      ...sampleState,
      income: [{ id: "1", name: "Salary", amount: 130000, frequency: "MONTHLY", reliability: "STABLE" }],
      // Living Expenses = 117k + Commitments = 4k -> Free cashflow = 9,000 vs required 15,833
    };

    const result = calculateOnboardingPath(tightState, fixedRefDate);
    expect(result.monthlyFreeCashFlow).toBe(9000);
    expect(result.trajectoryState).toBe("AT_RISK");
  });

  it("flags OFF_TRACK when expenses exceed inflows (cash flow <= 0)", () => {
    const deficitState: OnboardingState = {
      ...sampleState,
      income: [{ id: "1", name: "Salary", amount: 100000, frequency: "MONTHLY", reliability: "STABLE" }],
      // Living Expenses = 117k -> Free cashflow = -17k <= 0
    };

    const result = calculateOnboardingPath(deficitState, fixedRefDate);
    expect(result.monthlyFreeCashFlow).toBeLessThanOrEqual(0);
    expect(result.trajectoryState).toBe("OFF_TRACK");
  });

  it("deducts monthly debt repayments accurately", () => {
    const debtState: OnboardingState = {
      ...sampleState,
      hasDebt: true,
      debts: [
        {
          id: "d1",
          name: "SACCO Loan",
          originalAmount: 200000,
          currentBalance: 150000,
          monthlyPayment: 20000,
        },
      ],
    };

    const result = calculateOnboardingPath(debtState, fixedRefDate);
    // Free Cash Flow = 180k - 117k - 20k - 4k = 39,000
    expect(result.monthlyDebtPayments).toBe(20000);
    expect(result.monthlyFreeCashFlow).toBe(39000);
  });

  it("provides all 10 destination presets", () => {
    expect(DESTINATION_PRESETS.length).toBe(10);
    const keys = DESTINATION_PRESETS.map((p) => p.key);
    expect(keys).toContain("start-business");
    expect(keys).toContain("emergency-fund");
    expect(keys).toContain("buy-car");
    expect(keys).toContain("buy-home");
    expect(keys).toContain("education");
    expect(keys).toContain("debt-free");
    expect(keys).toContain("travel");
    expect(keys).toContain("build-savings");
    expect(keys).toContain("invest");
    expect(keys).toContain("custom");
  });
});
