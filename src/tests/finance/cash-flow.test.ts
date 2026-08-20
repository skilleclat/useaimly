import { describe, it, expect } from "vitest";
import { calculateCashFlowSummary, normalizeToMonthly } from "@/lib/finance/calculations/cash-flow";
import { CashFlowItem } from "@/lib/types/finance";

describe("Cash Flow Calculations", () => {
  it("normalizes frequencies correctly", () => {
    expect(normalizeToMonthly(120000, "ANNUAL")).toBe(10000);
    expect(normalizeToMonthly(5000, "MONTHLY")).toBe(5000);
    expect(normalizeToMonthly(1000, "WEEKLY")).toBeCloseTo(4333.33, 1);
  });

  it("accurately calculates free cash flow and savings rate", () => {
    const items: CashFlowItem[] = [
      { id: "1", name: "Salary", amount: 180000, frequency: "MONTHLY", type: "INCOME" },
      { id: "2", name: "Rent", amount: 55000, frequency: "MONTHLY", type: "FIXED_EXPENSE" },
      { id: "3", name: "Living", amount: 30000, frequency: "MONTHLY", type: "FIXED_EXPENSE" },
      { id: "4", name: "Variable", amount: 40000, frequency: "MONTHLY", type: "VARIABLE_EXPENSE" },
    ];

    const summary = calculateCashFlowSummary(items);

    expect(summary.monthlyGrossIncome).toBe(180000);
    expect(summary.monthlyTotalExpenses).toBe(125000);
    expect(summary.monthlyFreeCashFlow).toBe(55000);
    expect(summary.savingsRate).toBeCloseTo(0.3056, 3);
  });
});
