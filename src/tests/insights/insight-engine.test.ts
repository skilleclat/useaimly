import { describe, it, expect } from "vitest";
import { generateProactiveInsights, InsightEngineInput } from "@/lib/insights/insight-engine";

describe("Proactive Insight Engine", () => {
  it("generates pace shortfall warning when required contribution exceeds current allocation", () => {
    const input: InsightEngineInput = {
      currency: "KES",
      monthlyGrossIncome: 180000,
      monthlyLivingExpenses: 97000,
      monthlyDebtService: 10000,
      monthlyFreeCashFlow: 68000,
      totalLiquidSavings: 240000,
      primaryGoal: {
        id: "g1",
        title: "Start my business",
        targetAmount: 500000,
        currentAmount: 180000,
        monthlyContribution: 20000,
        requiredMonthlyContribution: 24500, // Shortfall of 4,500
        targetDate: "2027-12-31",
        projectedArrivalDate: "2028-02-15",
        monthsAheadOrBehind: -2,
      },
      activeGoalsCount: 1,
      totalGoalsAllocated: 20000,
      recentDecisionsDelayWeeks: 0,
    };

    const insights = generateProactiveInsights(input);
    const paceInsight = insights.find((i) => i.category === "PACE");

    expect(paceInsight).toBeDefined();
    expect(paceInsight?.severity).toBe("WARNING");
    expect(paceInsight?.title).toContain("4,500 more per month");
  });

  it("detects high debt-to-income burden (>= 30%)", () => {
    const input: InsightEngineInput = {
      currency: "KES",
      monthlyGrossIncome: 100000,
      monthlyLivingExpenses: 50000,
      monthlyDebtService: 31000, // 31% DTI
      monthlyFreeCashFlow: 19000,
      totalLiquidSavings: 50000,
      primaryGoal: {
        id: "g1",
        title: "Emergency Fund",
        targetAmount: 300000,
        currentAmount: 100000,
        monthlyContribution: 10000,
        requiredMonthlyContribution: 10000,
        targetDate: "2027-12-31",
        projectedArrivalDate: "2027-12-31",
        monthsAheadOrBehind: 0,
      },
      activeGoalsCount: 1,
      totalGoalsAllocated: 10000,
      recentDecisionsDelayWeeks: 0,
    };

    const insights = generateProactiveInsights(input);
    const debtInsight = insights.find((i) => i.category === "DEBT");

    expect(debtInsight).toBeDefined();
    expect(debtInsight?.severity).toBe("CRITICAL");
    expect(debtInsight?.title).toContain("31%");
  });

  it("detects multi-destination capacity conflict", () => {
    const input: InsightEngineInput = {
      currency: "KES",
      monthlyGrossIncome: 180000,
      monthlyLivingExpenses: 112000,
      monthlyDebtService: 0,
      monthlyFreeCashFlow: 68000,
      totalLiquidSavings: 180000,
      primaryGoal: {
        id: "g1",
        title: "Start my business",
        targetAmount: 500000,
        currentAmount: 180000,
        monthlyContribution: 45000,
        requiredMonthlyContribution: 30000,
        targetDate: "2027-12-31",
        projectedArrivalDate: "2027-11-15",
        monthsAheadOrBehind: 1,
      },
      activeGoalsCount: 3,
      totalGoalsAllocated: 78000, // 78k > 68k free cash flow
      recentDecisionsDelayWeeks: 0,
    };

    const insights = generateProactiveInsights(input);
    const conflictInsight = insights.find((i) => i.category === "CONFLICT");

    expect(conflictInsight).toBeDefined();
    expect(conflictInsight?.severity).toBe("WARNING");
    expect(conflictInsight?.title).toContain("competing with another");
  });

  it("detects cumulative decision trajectory drag (>= 3 weeks)", () => {
    const input: InsightEngineInput = {
      currency: "KES",
      monthlyGrossIncome: 180000,
      monthlyLivingExpenses: 112000,
      monthlyDebtService: 0,
      monthlyFreeCashFlow: 68000,
      totalLiquidSavings: 180000,
      primaryGoal: {
        id: "g1",
        title: "Start my business",
        targetAmount: 500000,
        currentAmount: 180000,
        monthlyContribution: 45000,
        requiredMonthlyContribution: 45000,
        targetDate: "2027-12-31",
        projectedArrivalDate: "2027-12-31",
        monthsAheadOrBehind: 0,
      },
      activeGoalsCount: 1,
      totalGoalsAllocated: 45000,
      recentDecisionsDelayWeeks: 7,
    };

    const insights = generateProactiveInsights(input);
    const dragInsight = insights.find((i) => i.category === "CUMULATIVE_DRAG");

    expect(dragInsight).toBeDefined();
    expect(dragInsight?.title).toContain("delayed your primary destination by 7 weeks");
  });
});
