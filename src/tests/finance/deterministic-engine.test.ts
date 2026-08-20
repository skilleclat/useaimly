import { describe, it, expect } from "vitest";
import {
  normalizeToMonthly,
  fromMonthly,
  calculateMonthlyGrossIncome,
  calculateStableIncome,
  calculateVariableIncome,
  calculateIncomeVolatilityRatio,
  calculateTotalMonthlyExpenses,
  calculateMonthlyEssentialExpenses,
  calculateMonthlyDiscretionaryExpenses,
  calculateMonthlyCommitments,
  calculateExpenseBreakdown,
  calculateTotalDebtBalance,
  calculateMonthlyDebtPayments,
  calculateDebtToIncomeRatio,
  calculateEstimatedDebtPayoffMonths,
  calculateCashFlow,
  calculateGoalMetrics,
  calculateMultipleGoalsMetrics,
  generateTrajectoryLedger,
  simulateDecision,
  calculateFinancialRunwayMonths,
  calculateCompositeFinancialHealth,
  BaselineFinancialProfile,
  NormalizedGoalItem,
} from "@/lib/finance";

describe("Useaimly Deterministic Financial Engine", () => {
  const fixedRefDate = new Date("2026-08-20T00:00:00Z");

  describe("1. Frequency Normalization", () => {
    it("converts all frequencies to monthly equivalents", () => {
      // Daily: 100 * 365 / 12 = 3041.6667
      expect(Math.round(normalizeToMonthly(100, "DAILY"))).toBe(3042);

      // Weekly: 1,000 * 52 / 12 = 4,333.33
      expect(Math.round(normalizeToMonthly(1000, "WEEKLY"))).toBe(4333);

      // Biweekly: 2,000 * 26 / 12 = 4,333.33
      expect(Math.round(normalizeToMonthly(2000, "BIWEEKLY"))).toBe(4333);
      expect(Math.round(normalizeToMonthly(2000, "BI_WEEKLY"))).toBe(4333);

      // Monthly: 10,000 * 1 = 10,000
      expect(normalizeToMonthly(10000, "MONTHLY")).toBe(10000);

      // Quarterly: 30,000 / 3 = 10,000
      expect(normalizeToMonthly(30000, "QUARTERLY")).toBe(10000);

      // Yearly / Annual: 120,000 / 12 = 10,000
      expect(normalizeToMonthly(120000, "YEARLY")).toBe(10000);
      expect(normalizeToMonthly(120000, "ANNUAL")).toBe(10000);

      // School Term: 40,000 * 3 / 12 = 10,000
      expect(normalizeToMonthly(40000, "TERM")).toBe(10000);

      // One-off: 0 recurring monthly
      expect(normalizeToMonthly(50000, "ONE_OFF")).toBe(0);
    });

    it("converts monthly amounts back to periodic frequencies", () => {
      expect(Math.round(fromMonthly(10000, "ANNUAL"))).toBe(120000);
      expect(Math.round(fromMonthly(10000, "QUARTERLY"))).toBe(30000);
    });
  });

  describe("2. Incomes & Income Volatility", () => {
    it("handles no income gracefully", () => {
      expect(calculateMonthlyGrossIncome([])).toBe(0);
      expect(calculateIncomeVolatilityRatio([])).toBe(1);
    });

    it("differentiates stable vs variable income", () => {
      const streams = [
        { name: "Salary", amount: 150000, frequency: "MONTHLY" as const, reliability: "STABLE" as const },
        { name: "Freelance", amount: 50000, frequency: "MONTHLY" as const, reliability: "VARIABLE" as const },
        { name: "Annual Bonus", amount: 120000, frequency: "ANNUAL" as const, reliability: "VARIABLE" as const },
      ];

      expect(calculateMonthlyGrossIncome(streams)).toBe(210000); // 150k + 50k + 10k
      expect(calculateStableIncome(streams)).toBe(150000);
      expect(calculateVariableIncome(streams)).toBe(60000);
      expect(calculateIncomeVolatilityRatio(streams)).toBe(0.2857);
    });
  });

  describe("3. Expenses, Commitments & Breakdowns", () => {
    it("separates essential vs discretionary expenses and computes breakdown", () => {
      const expenses = [
        { name: "Rent", category: "HOUSING", amount: 50000, frequency: "MONTHLY" as const, isFixed: true },
        { name: "Food", category: "FOOD", amount: 30000, frequency: "MONTHLY" as const, isFixed: true },
        { name: "Dining Out", category: "ENTERTAINMENT", amount: 20000, frequency: "MONTHLY" as const, isFixed: false },
      ];

      expect(calculateTotalMonthlyExpenses(expenses)).toBe(100000);
      expect(calculateMonthlyEssentialExpenses(expenses)).toBe(80000);
      expect(calculateMonthlyDiscretionaryExpenses(expenses)).toBe(20000);

      const breakdown = calculateExpenseBreakdown(expenses);
      expect(breakdown.HOUSING.percentage).toBe(50);
      expect(breakdown.FOOD.percentage).toBe(30);
      expect(breakdown.ENTERTAINMENT.percentage).toBe(20);
    });

    it("amortizes annual and termly commitments", () => {
      const commitments = [
        { title: "School Fees", amount: 60000, frequency: "TERM" as const }, // 60k * 3 / 12 = 15,000/mo
        { title: "Car Insurance", amount: 36000, frequency: "ANNUAL" as const }, // 36k / 12 = 3,000/mo
      ];

      expect(calculateMonthlyCommitments(commitments)).toBe(18000);
    });
  });

  describe("4. Debt & Debt-to-Income", () => {
    it("calculates total balance and monthly payments", () => {
      const debts = [
        { name: "SACCO Loan", currentBalance: 200000, monthlyPayment: 20000, interestRate: 12 },
        { name: "Credit Card", currentBalance: 50000, monthlyPayment: 5000, interestRate: 18 },
      ];

      expect(calculateTotalDebtBalance(debts)).toBe(250000);
      expect(calculateMonthlyDebtPayments(debts)).toBe(25000);
    });

    it("calculates DTI ratio and handles debt greater than income", () => {
      const debts = [{ name: "Heavy Loan", currentBalance: 500000, monthlyPayment: 120000 }];

      // Income = 100k, Debt = 120k -> DTI = 120%
      expect(calculateDebtToIncomeRatio(debts, 100000)).toBe(120);

      // No income with debt payments
      expect(calculateDebtToIncomeRatio(debts, 0)).toBe(100);
    });

    it("estimates payoff months with interest amortization", () => {
      const debt = { name: "Loan", currentBalance: 100000, monthlyPayment: 10000, interestRate: 0 };
      expect(calculateEstimatedDebtPayoffMonths(debt)).toBe(10);

      const interestDebt = { name: "Loan", currentBalance: 100000, monthlyPayment: 10000, interestRate: 12 };
      expect(calculateEstimatedDebtPayoffMonths(interestDebt)).toBe(11);
    });
  });

  describe("5. Cash Flow Calculations", () => {
    it("computes free cash flow and savings rate accurately", () => {
      const incomes = [{ name: "Salary", amount: 200000, frequency: "MONTHLY" as const }];
      const expenses = [
        { name: "Rent", amount: 60000, frequency: "MONTHLY" as const, isFixed: true },
        { name: "Living", amount: 40000, frequency: "MONTHLY" as const, isFixed: true },
      ];
      const debts = [{ name: "Loan", currentBalance: 100000, monthlyPayment: 20000 }];
      const commitments = [{ title: "Insurance", amount: 24000, frequency: "ANNUAL" as const }]; // 2k/mo

      const cf = calculateCashFlow(incomes, expenses, debts, commitments);
      expect(cf.monthlyGrossIncome).toBe(200000);
      expect(cf.totalMonthlyExpenses).toBe(100000);
      expect(cf.monthlyDebtPayments).toBe(20000);
      expect(cf.monthlyCommitments).toBe(2000);
      expect(cf.monthlyFreeCashFlow).toBe(78000); // 200k - 100k - 20k - 2k = 78k
      expect(cf.savingsRatePercentage).toBe(39);
    });

    it("handles negative cash flow scenario", () => {
      const incomes = [{ name: "Salary", amount: 80000, frequency: "MONTHLY" as const }];
      const expenses = [{ name: "Living", amount: 100000, frequency: "MONTHLY" as const, isFixed: true }];

      const cf = calculateCashFlow(incomes, expenses);
      expect(cf.monthlyFreeCashFlow).toBe(-20000);
      expect(cf.savingsRatePercentage).toBe(0);
    });
  });

  describe("6. Goal Logic & Edge Cases", () => {
    it("handles zero target goal", () => {
      const goal: NormalizedGoalItem = {
        id: "g1",
        title: "Zero Goal",
        targetAmount: 0,
        currentAmount: 0,
        targetDate: "2028-08-20",
      };

      const result = calculateGoalMetrics(goal, 20000, fixedRefDate);
      expect(result.status).toBe("COMPLETED");
      expect(result.remainingAmount).toBe(0);
      expect(result.progressPercentage).toBe(100);
    });

    it("handles target already achievable (current >= target)", () => {
      const goal: NormalizedGoalItem = {
        id: "g2",
        title: "Achieved Goal",
        targetAmount: 300000,
        currentAmount: 350000,
        targetDate: "2028-08-20",
      };

      const result = calculateGoalMetrics(goal, 20000, fixedRefDate);
      expect(result.status).toBe("COMPLETED");
      expect(result.remainingAmount).toBe(0);
      expect(result.progressPercentage).toBe(100);
    });

    it("handles completed goal status", () => {
      const goal: NormalizedGoalItem = {
        id: "g3",
        title: "Marked Completed",
        targetAmount: 500000,
        currentAmount: 200000,
        targetDate: "2028-08-20",
        status: "COMPLETED",
      };

      const result = calculateGoalMetrics(goal, 20000, fixedRefDate);
      expect(result.status).toBe("COMPLETED");
    });

    it("handles past target date (overdue)", () => {
      const goal: NormalizedGoalItem = {
        id: "g4",
        title: "Past Due Goal",
        targetAmount: 500000,
        currentAmount: 200000,
        targetDate: "2025-08-20", // Past relative to 2026-08-20
      };

      const result = calculateGoalMetrics(goal, 25000, fixedRefDate);
      expect(result.status).toBe("OVERDUE");
      expect(result.daysUntilTargetDate).toBeLessThan(0);
      expect(result.remainingAmount).toBe(300000);
      expect(result.projectedMonthsToCompletion).toBe(12); // 300k / 25k = 12 mos
    });

    it("handles insufficient monthly cash flow (AT_RISK and OFF_TRACK)", () => {
      const goal: NormalizedGoalItem = {
        id: "g5",
        title: "Business Fund",
        targetAmount: 600000,
        currentAmount: 0,
        targetDate: "2028-08-20", // 24 months -> Required = 25,000/mo
      };

      // Allocation of 18,000/mo (72% of required) -> AT_RISK
      const atRiskResult = calculateGoalMetrics(goal, 18000, fixedRefDate);
      expect(atRiskResult.status).toBe("AT_RISK");
      expect(atRiskResult.requiredMonthlyContribution).toBe(25000);
      expect(atRiskResult.monthlyShortfall).toBe(7000);

      // Allocation of 5,000/mo (20% of required) -> OFF_TRACK
      const offTrackResult = calculateGoalMetrics(goal, 5000, fixedRefDate);
      expect(offTrackResult.status).toBe("OFF_TRACK");

      // Allocation of 0/mo -> OFF_TRACK
      const zeroResult = calculateGoalMetrics(goal, 0, fixedRefDate);
      expect(zeroResult.status).toBe("OFF_TRACK");
    });

    it("evaluates multiple goals with priority waterfall allocation", () => {
      const goals: NormalizedGoalItem[] = [
        {
          id: "g1",
          title: "Emergency Fund",
          targetAmount: 300000,
          currentAmount: 180000,
          targetDate: "2027-08-20", // 12 mos -> shortfall 120k / 12 = 10,000/mo
          priority: "CRITICAL",
        },
        {
          id: "g2",
          title: "New Venture",
          targetAmount: 480000,
          currentAmount: 0,
          targetDate: "2028-08-20", // 24 mos -> shortfall 480k / 24 = 20,000/mo
          priority: "HIGH",
        },
      ];

      // Total Free Cash Flow = 25,000/mo
      // Critical goal gets full 10,000/mo -> ON_TRACK
      // High goal gets remaining 15,000/mo (out of 20,000 needed) -> AT_RISK
      const results = calculateMultipleGoalsMetrics(goals, 25000, fixedRefDate);
      expect(results.length).toBe(2);

      const g1 = results.find((r) => r.goalId === "g1")!;
      expect(g1.allocatedMonthlyContribution).toBe(10000);
      expect(g1.status).toBe("ON_TRACK");

      const g2 = results.find((r) => r.goalId === "g2")!;
      expect(g2.allocatedMonthlyContribution).toBe(15000);
      expect(g2.status).toBe("AT_RISK");
    });
  });

  describe("7. Decision Simulation & 3-Pillar Affordability", () => {
    const baselineProfile: BaselineFinancialProfile = {
      liquidSavings: 150000,
      incomes: [{ name: "Salary", amount: 200000, frequency: "MONTHLY" as const }],
      expenses: [
        { name: "Rent", amount: 60000, frequency: "MONTHLY" as const, isFixed: true },
        { name: "Living", amount: 40000, frequency: "MONTHLY" as const, isFixed: true },
      ],
      debts: [{ name: "Loan", currentBalance: 100000, monthlyPayment: 20000 }],
      commitments: [],
      goals: [
        {
          id: "g1",
          title: "Start Business",
          targetAmount: 500000,
          currentAmount: 100000,
          targetDate: "2028-08-20", // 24 mos -> 400k shortfall / 24 = 16,667/mo
          priority: "HIGH",
        },
      ],
    };

    it("evaluates a safe, manageable decision (KES 30,000 purchase)", () => {
      // Free Cash Flow = 200k - 100k - 20k = 80k/mo
      // Required for goal = 16,667/mo
      // Spend 30,000 lump sum:
      // Available savings: 150k -> 120k
      // Goal current: 100k -> 70k (shortfall: 430k)
      // Arrival at 80k/mo: 430k / 80k = 6 months
      const result = simulateDecision(
        baselineProfile,
        { decisionTitle: "New Laptop", amount: 30000, isRecurring: false },
        fixedRefDate
      );

      expect(result.affordability.canPhysicallyPay).toBe(true);
      expect(result.affordability.cashRemainingAfterDecision).toBe(120000);
      expect(result.affordability.preservesEssentialObligations).toBe(false); // Buffer required = 120k * 2 = 240k, remaining 120k
      expect(result.status).toBe("HIGH_IMPACT"); // Buffer alert
    });

    it("detects when user cannot physically pay (huge purchase > liquid savings)", () => {
      const result = simulateDecision(
        baselineProfile,
        { decisionTitle: "Luxury Trip", amount: 200000, isRecurring: false },
        fixedRefDate
      );

      expect(result.affordability.canPhysicallyPay).toBe(false);
      expect(result.affordability.cashDeficit).toBe(50000); // 200k - 150k = 50k deficit
      expect(result.status).toBe("OFF_TRACK");
      expect(result.headlineVerdict).toContain("Cannot Physically Fund");
    });

    it("detects destabilizing recurring costs that exceed cash flow", () => {
      const tightProfile: BaselineFinancialProfile = {
        ...baselineProfile,
        liquidSavings: 300000,
        incomes: [{ name: "Salary", amount: 130000, frequency: "MONTHLY" as const }],
        // Expenses = 100k + Debt = 20k -> Free cash flow = 10,000/mo
      };

      const result = simulateDecision(
        tightProfile,
        { decisionTitle: "Executive Club", amount: 15000, isRecurring: true, recurringFrequency: "MONTHLY" },
        fixedRefDate
      );

      expect(result.simulated.monthlyFreeCashFlow).toBe(-5000); // 10k - 15k = -5k
      expect(result.status).toBe("OFF_TRACK");
      expect(result.headlineVerdict).toContain("Creates Monthly Deficit");
    });
  });

  describe("8. Trajectory Accumulation Curves", () => {
    it("generates month-by-month trajectory points and arrival delay", () => {
      // Target: 500k
      // Baseline: starts at 100k, +40k/mo -> hits 500k at month 10 (100k + 400k)
      // Simulated: starts at 60k, +40k/mo -> hits 500k at month 11 (60k + 440k)
      const ledger = generateTrajectoryLedger(500000, 100000, 40000, 60000, 40000, 24, fixedRefDate);

      expect(ledger.points.length).toBe(25); // month 0 to 24
      expect(ledger.baselineArrivalMonth).toBe(10);
      expect(ledger.simulatedArrivalMonth).toBe(11);
      expect(ledger.delayMonths).toBe(1);
      expect(ledger.delayDays).toBe(30);
    });
  });

  describe("9. Financial Health & Runway", () => {
    it("calculates runway in months", () => {
      // 300,000 savings / (60k expenses + 20k debt = 80k burn) = 3.75 months -> 3.8 mos
      expect(calculateFinancialRunwayMonths(300000, 60000, 20000)).toBe(3.8);
    });

    it("evaluates composite financial health with grade and score", () => {
      const strongProfile: BaselineFinancialProfile = {
        liquidSavings: 600000,
        incomes: [{ name: "Salary", amount: 250000, frequency: "MONTHLY" as const }],
        expenses: [{ name: "Living", amount: 80000, frequency: "MONTHLY" as const, isFixed: true }],
        debts: [],
        commitments: [],
        goals: [{ id: "g1", title: "Fund", targetAmount: 500000, currentAmount: 300000, targetDate: "2028-08-20" }],
      };

      const health = calculateCompositeFinancialHealth(strongProfile);
      expect(health.score).toBeGreaterThanOrEqual(85);
      expect(["A", "A+"]).toContain(health.grade);
      expect(health.runwayMonths).toBeGreaterThanOrEqual(6);
    });
  });
});
