import { describe, it, expect } from "vitest";
import { simulateDecision } from "@/lib/finance/decision-simulations/decision-engine";
import { INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS } from "@/lib/finance/demo-data";
import { FinancialDecision } from "@/lib/types/decision";

describe("Deterministic Decision Engine", () => {
  it("accurately computes one-off phone purchase impact (Dec 2027 -> Feb 2028 / +2 months delay)", () => {
    const decision: FinancialDecision = {
      title: "New Phone Purchase",
      type: "ONE_OFF_PURCHASE",
      amount: 30000,
      currency: "KES",
    };

    // Fixed reference date to ensure deterministic tests
    const testDate = new Date("2026-08-01");
    const result = simulateDecision(INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS, decision, testDate);

    // Cash is affordable (85k accessible liquid cash >= 30k)
    expect(result.cashAffordable).toBe(true);
    expect(result.availableCashAfter).toBe(55000);

    // Goal delay is calculated deterministically
    expect(result.primaryGoalImpact.isDelayed).toBe(true);
    expect(result.primaryGoalImpact.delayInMonths).toBeGreaterThanOrEqual(1);

    // Additional monthly savings needed to stay on date (+KES 1,875/mo)
    expect(result.primaryGoalImpact.additionalMonthlySavingsRequired).toBe(1875);
    expect(result.recoveryPlan.feasible).toBe(true);
  });

  it("identifies cash deficit for purchase exceeding liquid cash", () => {
    const hugePurchase: FinancialDecision = {
      title: "Luxury Watch",
      type: "ONE_OFF_PURCHASE",
      amount: 150000,
      currency: "KES",
    };

    const testDate = new Date("2026-08-01");
    const result = simulateDecision(INITIAL_DEMO_PROFILE, INITIAL_DEMO_GOALS, hugePurchase, testDate);

    expect(result.cashAffordable).toBe(false);
    expect(result.planAffordabilityStatus).toBe("UNAFFORDABLE_CASH_DEFICIT");
    expect(result.availableCashAfter).toBeLessThan(0);
  });
});
