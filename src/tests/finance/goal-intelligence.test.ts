import { describe, it, expect } from "vitest";
import {
  FinancialGoal,
  GOAL_TYPE_LABELS,
  GoalType,
  normalizeGoalData,
} from "../../lib/types/goal";
import {
  calculateLivingGoalTrajectory,
  computeContributionSensitivity,
  computeWithdrawalSensitivity,
  evaluateGoalHealth,
  evaluateGoalRisk,
  evaluateGoalConfidence,
  evaluateGoalRobustness,
  buildLivingGoalModel,
  evaluateMultipleLivingGoals,
  normalizeContributionToMonthly,
} from "../../lib/finance/goals/goal-intelligence-engine";
import { FinancialGoalSchema } from "../../lib/validation/goal.schema";
import { addMonths, formatDateToISO, parseDate } from "../../lib/utils/date";

describe("PROMPT 1: AIMLY GOAL INTELLIGENCE SYSTEM — ARCHITECTURE & CORE ENGINE", () => {
  const referenceDate = new Date("2026-08-01T00:00:00Z");

  describe("1. Core Goal Data Model & All 9 Supported Goal Types", () => {
    const supportedTypes: GoalType[] = [
      "BUY_A_HOUSE",
      "BUY_A_CAR",
      "START_A_BUSINESS",
      "EMERGENCY_FUND",
      "INVESTMENT_TARGET",
      "EDUCATION",
      "TRAVEL",
      "RETIREMENT",
      "CUSTOM_GOAL",
    ];

    it("supports all 9 core goal types with English and French label mappings", () => {
      supportedTypes.forEach((type) => {
        const mapping = GOAL_TYPE_LABELS[type];
        expect(mapping).toBeDefined();
        expect(mapping.en).toBeTruthy();
        expect(mapping.fr).toBeTruthy();
        expect(mapping.iconName).toBeTruthy();
      });
    });

    it("normalizes snake_case database records into canonical FinancialGoal models", () => {
      const rawDbRecord = {
        goal_id: "goal-101",
        user_id: "user-42",
        custom_goal_name: "Cape Town Expedition",
        goal_type: "TRAVEL",
        target_amount: 150000,
        current_amount: 30000,
        target_date: "2027-12-31",
        start_date: "2026-01-01",
        monthly_contribution: 6000,
        contribution_frequency: "MONTHLY",
        priority: "HIGH",
        flexibility_of_deadline: "FLEXIBLE",
        minimum_required_amount: 120000,
        expected_growth_rate: 0.04,
        goal_status: "ACTIVE",
      };

      const normalized = normalizeGoalData(rawDbRecord);

      expect(normalized.id).toBe("goal-101");
      expect(normalized.userId).toBe("user-42");
      expect(normalized.title).toBe("Cape Town Expedition");
      expect(normalized.category).toBe("TRAVEL");
      expect(normalized.goalType).toBe("TRAVEL");
      expect(normalized.targetAmount).toBe(150000);
      expect(normalized.currentAmount).toBe(30000);
      expect(normalized.monthlyAllocation).toBe(6000);
      expect(normalized.flexibilityOfDeadline).toBe("FLEXIBLE");
      expect(normalized.minimumRequiredAmount).toBe(120000);
      expect(normalized.expectedGrowthRate).toBe(0.04);
      expect(normalized.goalStatus).toBe("ACTIVE");
    });

    it("validates and parses goal schemas with Zod seamlessly", () => {
      const parsed = FinancialGoalSchema.parse({
        title: "Downpayment for Apartment",
        target_amount: 500000,
        current_amount: 100000,
        target_date: "2028-06-30",
        category: "BUY_A_HOUSE",
        priority: "CRITICAL",
        monthly_contribution: 15000,
      });

      expect(parsed.title).toBe("Downpayment for Apartment");
      expect(parsed.targetAmount).toBe(500000);
      expect(parsed.currentAmount).toBe(100000);
      expect(parsed.monthlyContribution).toBe(15000);
      expect(parsed.category).toBe("BUY_A_HOUSE");
    });
  });

  describe("2. Living Goal Trajectory Data & Schedule Calculations", () => {
    const sampleGoal: FinancialGoal = {
      id: "g-house",
      title: "Buy First Home",
      category: "BUY_A_HOUSE",
      priority: "CRITICAL",
      targetAmount: 600000,
      currentAmount: 120000, // remaining 480,000
      targetDate: "2028-08-01", // 24 months from referenceDate (2026-08-01)
      currency: "KES",
      flexibilityOfDeadline: "MODERATE",
    };

    it("calculates exact progress, remaining amount, and required monthly pace", () => {
      // 480,000 remaining / 24 months = 20,000 / month required
      const allocatedMonthly = 20000;
      const trajectory = calculateLivingGoalTrajectory(sampleGoal, allocatedMonthly, {
        referenceDate,
      });

      expect(trajectory.currentProgress).toBe(20); // 120,000 / 600,000
      expect(trajectory.remainingAmount).toBe(480000);
      expect(trajectory.requiredMonthlyContribution).toBe(20000);
      expect(trajectory.allocatedMonthlyContribution).toBe(20000);
      expect(trajectory.monthlyShortfall).toBe(0);
      expect(trajectory.monthlySurplus).toBe(0);
      expect(trajectory.isAchievable).toBe(true);
      expect(trajectory.scheduleVarianceMonths).toBe(0); // exactly on time
      expect(trajectory.scheduleVarianceDays).toBe(0);
      expect(trajectory.estimatedCompletionDate).toBe("2028-08-01");
    });

    it("detects ahead-of-schedule velocity when monthly contribution exceeds required pace", () => {
      // Allocated 30,000 / month: 480,000 / 30,000 = 16 months (reaches 2027-12-01 instead of 2028-08-01, 8 months early)
      const allocatedMonthly = 30000;
      const trajectory = calculateLivingGoalTrajectory(sampleGoal, allocatedMonthly, {
        referenceDate,
      });

      expect(trajectory.monthlySurplus).toBe(10000);
      expect(trajectory.monthlyShortfall).toBe(0);
      expect(trajectory.scheduleVarianceMonths).toBe(-8); // 8 months early
      expect(trajectory.scheduleVarianceDays).toBe(-240);
      expect(trajectory.estimatedCompletionDate).toBe("2027-12-01");
    });

    it("detects shortfall and schedule slippage when contribution is below required rate", () => {
      // Allocated 10,000 / month: 480,000 / 10,000 = 48 months (reaches in 48 months, +24 months delay)
      const allocatedMonthly = 10000;
      const trajectory = calculateLivingGoalTrajectory(sampleGoal, allocatedMonthly, {
        referenceDate,
      });

      expect(trajectory.monthlyShortfall).toBe(10000);
      expect(trajectory.scheduleVarianceMonths).toBe(24); // 24 months delayed
      expect(trajectory.scheduleVarianceDays).toBe(720);
      expect(trajectory.isAchievable).toBe(true);
    });

    it("handles zero allocation deterministically without dividing by zero", () => {
      const trajectory = calculateLivingGoalTrajectory(sampleGoal, 0, {
        referenceDate,
      });

      expect(trajectory.allocatedMonthlyContribution).toBe(0);
      expect(trajectory.requiredMonthlyContribution).toBe(20000);
      expect(trajectory.monthlyShortfall).toBe(20000);
      expect(trajectory.isAchievable).toBe(false);
      expect(trajectory.scheduleVarianceMonths).toBe(999);
    });
  });

  describe("3. Goal Trajectory Sensitivity Engine (Increases, Reductions, Withdrawals)", () => {
    const targetDateObj = parseDate("2028-08-01"); // 24 months from 2026-08-01
    const goal: FinancialGoal = {
      id: "g-biz",
      title: "Launch SaaS Business",
      category: "START_A_BUSINESS",
      priority: "HIGH",
      targetAmount: 240000,
      currentAmount: 48000, // 192,000 remaining
      targetDate: "2028-08-01",
      currency: "USD",
    };

    it("computes contribution boost sensitivity matrices (+10%, +25%, +50%, +100%)", () => {
      const baselineMonthly = 8000; // 192,000 / 8,000 = 24 months
      const sensitivities = computeContributionSensitivity(
        goal,
        baselineMonthly,
        targetDateObj,
        referenceDate,
        [10, 25, 50, 100]
      );

      expect(sensitivities.length).toBe(4);

      // +25% boost: 10,000/mo -> 192,000 / 10,000 = 20 months (4 months saved)
      const boost25 = sensitivities.find((s) => s.percentageChange === 25);
      expect(boost25).toBeDefined();
      expect(boost25?.monthlyAmount).toBe(10000);
      expect(boost25?.additionalMonthly).toBe(2000);
      expect(boost25?.monthsDelta).toBe(-4);
      expect(boost25?.isAchievableBeforeDeadline).toBe(true);

      // +50% boost: 12,000/mo -> 192,000 / 12,000 = 16 months (8 months saved)
      const boost50 = sensitivities.find((s) => s.percentageChange === 50);
      expect(boost50?.monthsDelta).toBe(-8);
    });

    it("computes contribution reduction sensitivity matrices (-10%, -25%, -50%)", () => {
      const baselineMonthly = 8000;
      const reductions = computeContributionSensitivity(
        goal,
        baselineMonthly,
        targetDateObj,
        referenceDate,
        [-25, -50]
      );

      // -50% cut: 4,000/mo -> 192,000 / 4,000 = 48 months (+24 months delay)
      const cut50 = reductions.find((s) => s.percentageChange === -50);
      expect(cut50).toBeDefined();
      expect(cut50?.monthlyAmount).toBe(4000);
      expect(cut50?.monthsDelta).toBe(24);
      expect(cut50?.isAchievableBeforeDeadline).toBe(false);
    });

    it("computes one-time withdrawal impacts with exact recovery calculations", () => {
      const baselineMonthly = 8000;
      const withdrawals = computeWithdrawalSensitivity(
        goal,
        baselineMonthly,
        targetDateObj,
        referenceDate
      );

      expect(withdrawals.length).toBeGreaterThan(0);
      withdrawals.forEach((w) => {
        expect(w.withdrawalAmount).toBeGreaterThan(0);
        expect(w.remainingAmountAfterWithdrawal).toBeGreaterThan(192000);
        expect(w.delayMonths).toBeGreaterThanOrEqual(0);
        expect(w.requiredMonthlyRecovery).toBeGreaterThan(0);
      });
    });
  });

  describe("4. Full Aimly Goal Intelligence Dimensions (Health, Risk, Confidence, Robustness, Delays)", () => {
    const goal: FinancialGoal = {
      id: "g-retire",
      title: "Retirement & Freedom",
      category: "RETIREMENT",
      priority: "HIGH",
      targetAmount: 1000000,
      currentAmount: 200000,
      targetDate: "2031-08-01", // 60 months
      currency: "KES",
      flexibilityOfDeadline: "MODERATE",
      expectedGrowthRate: 0.05,
    };

    it("builds the comprehensive AimlyGoalIntelligenceModel with all 9 intelligence dimensions", () => {
      const model = buildLivingGoalModel(goal, 15000, {
        referenceDate,
        emergencyBufferMonths: 5,
        cashFlowCapacity: 25000,
      });

      expect(model.goalId).toBe("g-retire");
      expect(model.core).toBe(goal);
      expect(model.trajectory).toBeDefined();
      expect(model.health).toBeDefined();
      expect(model.risk).toBeDefined();
      expect(model.confidence).toBeDefined();
      expect(model.robustness).toBeDefined();
      expect(model.delays).toBeDefined();
      expect(model.dependencies).toBeDefined();
      expect(model.impactEvents).toBeDefined();
      expect(model.accelerators).toBeDefined();
      expect(model.threats).toBeDefined();

      // Verify health classification and reasons
      expect(["ON_TRACK", "WATCH", "AT_RISK", "DELAYED", "CRITICAL"]).toContain(
        model.health.classification
      );
      expect(model.health.primaryReason).toBeTruthy();
      expect(model.health.contributingFactors.length).toBeGreaterThan(0);

      // Verify confidence and explicit assumptions
      expect(["HIGH", "MEDIUM", "LOW"]).toContain(model.confidence.level);
      expect(model.confidence.keyAssumptions.length).toBeGreaterThan(0);

      // Verify delays data
      expect(typeof model.delays.scheduleVarianceMonths).toBe("number");
      expect(typeof model.delays.isDelayed).toBe("boolean");
    });
  });

  describe("5. Multi-Goal Priority Waterfall & Conflict Compatibility", () => {
    const goalA: FinancialGoal = {
      id: "g-emergency",
      title: "Emergency Reserve",
      category: "EMERGENCY_FUND",
      priority: "CRITICAL",
      targetAmount: 100000,
      currentAmount: 50000, // 50,000 needed
      targetDate: "2027-02-01", // 6 months (approx 8,333/mo needed)
      currency: "KES",
    };

    const goalB: FinancialGoal = {
      id: "g-car",
      title: "Buy Family Vehicle",
      category: "BUY_A_CAR",
      priority: "MEDIUM",
      targetAmount: 300000,
      currentAmount: 50000, // 250,000 needed
      targetDate: "2028-08-01", // 24 months (approx 10,417/mo needed)
      currency: "KES",
    };

    it("allocates limited free cash flow using priority waterfall", () => {
      // Free cash flow of 12,000/mo: Goal A (CRITICAL) takes ~8,333, leaving ~3,667 for Goal B (MEDIUM)
      const models = evaluateMultipleLivingGoals([goalA, goalB], 12000, {
        referenceDate,
      });

      expect(models.length).toBe(2);

      const emergencyModel = models.find((m) => m.goalId === "g-emergency");
      const carModel = models.find((m) => m.goalId === "g-car");

      expect(emergencyModel).toBeDefined();
      expect(carModel).toBeDefined();

      // Goal A gets full needed allocation first
      expect(emergencyModel?.trajectory.allocatedMonthlyContribution).toBeGreaterThanOrEqual(8000);
      expect(emergencyModel?.health.classification).toBe("ON_TRACK");

      // Goal B gets the remaining cash flow (~3,667), which is less than its required ~10,417/mo
      expect(carModel?.trajectory.allocatedMonthlyContribution).toBeLessThan(10417);
      expect(carModel?.trajectory.monthlyShortfall).toBeGreaterThan(0);
      expect(["AT_RISK", "DELAYED"]).toContain(carModel?.health.classification);
    });
  });

  describe("6. Contribution Frequency Normalization", () => {
    it("normalizes weekly, biweekly, quarterly, and annual contributions accurately", () => {
      expect(normalizeContributionToMonthly(1000, "WEEKLY")).toBe(4333.33);
      expect(normalizeContributionToMonthly(2000, "BIWEEKLY")).toBe(4333.33);
      expect(normalizeContributionToMonthly(15000, "QUARTERLY")).toBe(5000);
      expect(normalizeContributionToMonthly(120000, "YEARLY")).toBe(10000);
      expect(normalizeContributionToMonthly(5000, "MONTHLY")).toBe(5000);
      expect(normalizeContributionToMonthly(10000, "ONE_OFF")).toBe(0);
    });
  });
});
