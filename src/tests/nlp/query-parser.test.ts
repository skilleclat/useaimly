import { describe, it, expect } from "vitest";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";

describe("Decision Query Parser & Signature Simulation", () => {
  it("extracts phone purchase intent and amount", () => {
    const result = parseDecisionQuery("I want to buy a KES 30,000 phone.");
    expect(result.extractedAmount).toBe(30000);
    expect(result.extractedTitle).toContain("Phone");
    expect(result.isRecurring).toBe(false);
    expect(result.decisionType).toBe("ONE_OFF_PURCHASE");
    expect(result.isValid).toBe(true);
  });

  it("extracts shorthand 'k' notation (e.g. 100k)", () => {
    const result = parseDecisionQuery("I am thinking about taking a KES 100k loan.");
    expect(result.extractedAmount).toBe(100000);
    expect(result.extractedTitle).toContain("Loan");
    expect(result.isValid).toBe(true);
  });

  it("detects business investment", () => {
    const result = parseDecisionQuery("I want to invest KES 50,000 into a business.");
    expect(result.extractedAmount).toBe(50000);
    expect(result.extractedTitle).toBe("Business Investment");
    expect(result.isValid).toBe(true);
  });

  it("detects travel & leisure queries", () => {
    const result = parseDecisionQuery("Can I afford a KES 15,000 trip?");
    expect(result.extractedAmount).toBe(15000);
    expect(result.extractedTitle).toBe("Travel & Leisure");
    expect(result.isValid).toBe(true);
  });

  it("detects recurring rent increase", () => {
    const result = parseDecisionQuery("Should I increase my rent by KES 12,000/mo?");
    expect(result.extractedAmount).toBe(12000);
    expect(result.isRecurring).toBe(true);
    expect(result.decisionType).toBe("RECURRING_EXPENSE");
    expect(result.isValid).toBe(true);
  });

  it("runs simulation producing the 4 signature outputs", () => {
    const baseline: BaselineFinancialProfile = {
      liquidSavings: 180000,
      incomes: [{ name: "Inflow", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true }],
      expenses: [{ name: "Living", amount: 112000, frequency: "MONTHLY", isFixed: true }],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "g1",
          title: "Start my business",
          targetAmount: 500000,
          currentAmount: 180000,
          targetDate: "2027-12-31",
          priority: "HIGH",
        },
      ],
    };

    const sim = simulateDecision(baseline, {
      decisionTitle: "New Phone",
      amount: 30000,
      isRecurring: false,
    });

    // 1. What you can do: physically pay
    expect(sim.affordability.canPhysicallyPay).toBe(true);
    expect(sim.affordability.cashRemainingAfterDecision).toBe(150000);

    // 2. What it changes: delay
    expect(sim.delta.percentageOfGoalAffected).toBe(6);

    // 3. To stay on track
    expect(sim.delta.additionalMonthlyAmountRequired).toBeGreaterThan(0);

    // 4. Useaimly's read
    expect(sim.headlineVerdict).toBeDefined();
    expect(sim.detailedAnalysis).toBeDefined();
  });
});
