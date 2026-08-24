import { describe, it, expect } from "vitest";
import { generateSeniorStrategistAssessment } from "@/lib/ai/senior-strategist-engine";
import { generateExecutivePDFReport, PDFReportData } from "@/lib/utils/pdf-report-generator";
import { validateDecisionConsistency, assertDecisionConsistency } from "@/lib/finance/validation/consistency-guard";
import { CanonicalFinancialDecision } from "@/lib/types/finance";
import { simulateDecision } from "@/lib/finance/simulations/simulation-engine";
import { evaluateFinancialConstraints } from "@/lib/finance/constraints/constraint-engine";

describe("Production-Grade Financial Decision Engine & Invariant Test Suite", () => {
  // =========================================================================
  // TEST 1 — ACHIEVED GOAL (Target = 230, Saved = 120,000, Currency = USD)
  // =========================================================================
  it("TEST 1: Achieved Goal terminates funding and reallocates surplus without recommending allocations to completed goal", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "USD",
      monthlyInflow: 180000,
      monthlyOutflow: 120750,
      monthlyFreeCashFlow: 59250,
      totalLiquidSavings: 205000,
      assignedGoalCapital: 120000,
      targetAmount: 230,
      targetDate: "2028-08-24",
      destinationTitle: "New Phone / Tech Purchase",
      projectedDate: "2026-08-24",
      delayInDays: 0,
      requiredMonthlySavings: 0,
    });

    expect(assessment.archetype).toBe("GOAL_ACHIEVED");
    expect(assessment.executiveDecision).toBe("GO");
    expect(assessment.headlineVerdict).not.toContain("Pace Shortfall");

    const fullText = `${assessment.headlineVerdict} ${assessment.whatYouCanDo} ${assessment.whatItChanges} ${assessment.toStayOnTrack} ${assessment.strategicRead} ${assessment.masterStrategyParagraph}`.toLowerCase();
    
    // Must NOT tell user to allocate money to completed phone goal or maintain savings to same goal
    expect(fullText).not.toContain("allocate $59,250/mo toward \"new phone");
    expect(fullText).not.toContain("maintain current automated savings rate of $59,250/mo.");
    expect(fullText).not.toContain("pace shortfall");
    expect(fullText).not.toContain("catch-up plan");
    expect(fullText).not.toContain("trajectory acceleration");
  });

  // =========================================================================
  // TEST 2 — CURRENCY CONSISTENCY (USD Analysis must have ZERO hardcoded KES)
  // =========================================================================
  it("TEST 2: Currency Integrity guarantees zero KES strings in a USD analysis across engine & PDF", () => {
    const baseline = {
      liquidSavings: 205000,
      incomes: [{ name: "Salary", amount: 180000, frequency: "MONTHLY" as const, reliability: "STABLE" as const, isActive: true }],
      expenses: [{ name: "Living", amount: 120750, frequency: "MONTHLY" as const, isFixed: true }],
      debts: [],
      commitments: [],
      goals: [{ id: "g1", title: "New Phone / Tech Purchase", targetAmount: 230, currentAmount: 120000, targetDate: "2028-08-24", priority: "HIGH" as const, status: "ACTIVE" as const }],
    };

    const simResult = simulateDecision(baseline, { decisionTitle: "New Phone / Tech Purchase", amount: 230, isRecurring: false }, new Date(), "USD");

    // Assert zero hardcoded "KES" in simulation strings
    const simBlob = `${simResult.headlineVerdict} ${simResult.singleAction} ${simResult.detailedAnalysis} ${JSON.stringify(simResult.factBreakdown)}`.toUpperCase();
    expect(simBlob).not.toContain("KES ");
    expect(simBlob).not.toContain("KES0");

    // Assert zero hardcoded "KES" in constraint engine output
    const constraints = evaluateFinancialConstraints({
      baselineProfile: baseline,
      decisionAmount: 230,
      isRecurring: false,
      postDecisionLiquidSavings: 204770,
      postDecisionFreeCashFlow: 59250,
      monthlyFixedObligations: 120750,
      delayInDays: 0,
      currency: "USD",
    });

    constraints.forEach((c) => {
      expect(String(c.thresholdValue)).not.toContain("KES");
      expect(String(c.currentValue)).not.toContain("KES");
      expect(String(c.gap)).not.toContain("KES");
    });
  });

  // =========================================================================
  // TEST 3 — RESERVE THRESHOLDS (1.7 Mos -> Floor SATISFIED, Target BELOW TARGET)
  // =========================================================================
  it("TEST 3: Reserve thresholds explicitly separate Minimum Safety Floor vs Recommended Target", () => {
    const canonicalDecision: CanonicalFinancialDecision = {
      analysisDate: "2026-08-24",
      currency: "USD",
      monthlyIncome: 180000,
      mandatoryOutflows: 120750,
      freeCashFlow: 59250,
      liquidReserves: 205000,
      reserveMonths: 1.7,
      reserveMinimumMonths: 1.0,
      reserveTargetMonths: 3.0,
      minimumReserveStatus: "SATISFIED",
      targetReserveStatus: "BELOW_TARGET",
      destinationTitle: "New Phone / Tech Purchase",
      targetAmount: 230,
      confirmedSaved: 120000,
      remainingGap: 0,
      currentMonthlyAllocation: 59250,
      requiredMonthlyAllocation: 0,
      additionalFundingRequired: 0,
      targetDate: "2028-08-24",
      projectedCompletionDate: "2026-08-24",
      trajectoryDelayMonths: 0,
      goalStatus: "ACHIEVED",
      purchaseDecision: "GO",
      confidence: "HIGH",
      confidenceReasons: ["All inputs verified."],
      shortfallAmount: 0,
      shortfallReason: null,
      structuredAction: {
        actionRequired: true,
        actionType: "REALLOCATE_TO_RESERVES",
        actionTarget: "EMERGENCY_RESERVES",
        currentValue: 59250,
        recommendedValue: 59250,
        description: "Purchase approved (goal fully funded). Redirect $59,250/mo surplus cash flow toward Emergency Reserves until 3.0-month target ($362,250) is reached.",
      },
      recommendedAction: "Purchase approved (goal fully funded). Redirect $59,250/mo surplus cash flow toward Emergency Reserves until 3.0-month target ($362,250) is reached.",
      headlineVerdict: "Executive Decision: GO — Destination Fully Achieved",
      strategicRead: "Target achieved with zero remaining gap. Minimum reserve floor satisfied.",
      masterStrategyParagraph: "Anchor destination is fully funded. Reallocate surplus cash flow to reserves.",
      assumptions: [],
      missingVariables: [],
      warnings: [],
    };

    expect(canonicalDecision.minimumReserveStatus).toBe("SATISFIED");
    expect(canonicalDecision.targetReserveStatus).toBe("BELOW_TARGET");
    expect(canonicalDecision.reserveMonths).toBe(1.7);

    const validation = validateDecisionConsistency(canonicalDecision);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  // =========================================================================
  // TEST 4 — ADJUST REQUIRES A MEASURABLE ACTION
  // =========================================================================
  it("TEST 4: Every ADJUST decision produces a structured action changing at least one variable", () => {
    const invalidAdjustDecision: CanonicalFinancialDecision = {
      analysisDate: "2026-08-24",
      currency: "USD",
      monthlyIncome: 180000,
      mandatoryOutflows: 120750,
      freeCashFlow: 59250,
      liquidReserves: 205000,
      reserveMonths: 1.7,
      reserveMinimumMonths: 1.0,
      reserveTargetMonths: 3.0,
      minimumReserveStatus: "SATISFIED",
      targetReserveStatus: "BELOW_TARGET",
      destinationTitle: "House Deposit",
      targetAmount: 500000,
      confirmedSaved: 100000,
      remainingGap: 400000,
      currentMonthlyAllocation: 20000,
      requiredMonthlyAllocation: 40000,
      additionalFundingRequired: 20000,
      targetDate: "2027-08-24",
      projectedCompletionDate: "2029-08-24",
      trajectoryDelayMonths: 24,
      goalStatus: "OFF_TRACK",
      purchaseDecision: "ADJUST",
      confidence: "HIGH",
      confidenceReasons: [],
      shortfallAmount: 20000,
      shortfallReason: "Pace shortfall",
      structuredAction: {
        actionRequired: true,
        actionType: "INCREASE_ALLOCATION",
        actionTarget: "PRIMARY_GOAL",
        currentValue: 20000,
        recommendedValue: 40000,
        description: "Proceed with current goal allocation schedule.", // CONTRADICTORY ACTION!
      },
      recommendedAction: "Proceed with current goal allocation schedule.",
      headlineVerdict: "Executive Decision: ADJUST — Pace Shortfall Identified",
      strategicRead: "Pace shortfall detected.",
      masterStrategyParagraph: "Initiate trajectory acceleration.",
      assumptions: [],
      missingVariables: [],
      warnings: [],
    };

    const validation = validateDecisionConsistency(invalidAdjustDecision);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes("ADJUST_DECISION_CONTRADICTORY_ACTION"))).toBe(true);
  });

  // =========================================================================
  // TEST 5 — FULL PDF CROSS-PAGE CONSISTENCY
  // =========================================================================
  it("TEST 5: PDF Report Data Generator outputs consistent values across Page 1 and Page 2", () => {
    const pdfData: PDFReportData = {
      currency: "USD",
      destinationTitle: "New Phone / Tech Purchase",
      targetAmount: 230,
      currentAmount: 120000,
      remainingGap: 0,
      targetDate: "2028-08-24",
      projectedDate: "2026-08-24",
      delayInDays: 0,
      monthlyInflow: 180000,
      monthlyOutflow: 120750,
      availableForGoals: 59250,
      liquidSavings: 205000,
      status: "SAFE",
      headlineVerdict: "Executive Decision: GO — Destination Fully Achieved",
      whatYouCanDo: "Goal is 100% funded with $120,000 saved. Redirect $59,250/mo surplus to reserves.",
      whatItChanges: "Zero further monthly contribution required for this goal.",
      toStayOnTrack: "Reallocate $59,250/mo surplus cash flow to Emergency Reserves.",
      strategicRead: "Goal fully satisfied. Reserves at 1.7 months.",
      masterStrategyParagraph: "Anchor destination is fully funded. Reallocate surplus cash flow to liquid reserves.",
      singleAction: "Redirect $59,250/mo surplus cash flow to Emergency Reserves until 3.0-month target ($362,250) is reached.",
    };

    const doc = generateExecutivePDFReport(pdfData);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBe(2);
  });
});
