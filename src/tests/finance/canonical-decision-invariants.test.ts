import { describe, it, expect } from "vitest";
import { generateSeniorStrategistAssessment } from "@/lib/ai/senior-strategist-engine";
import { generateExecutivePDFReport, PDFReportData } from "@/lib/utils/pdf-report-generator";
import { validateDecisionConsistency, assertDecisionConsistency } from "@/lib/finance/validation/consistency-guard";
import { CanonicalFinancialDecision } from "@/lib/types/finance";

describe("Canonical Decision Engine & Invariants Test Suite", () => {
  // =========================================================================
  // SCENARIO 1 — GOAL ALREADY ACHIEVED (Target: 230,000, Saved: 230,000)
  // =========================================================================
  it("Scenario 1: Goal Already Achieved enforces remGap=0, goalStatus=ACHIEVED, no shortfall narrative", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "KES",
      monthlyInflow: 180000,
      monthlyOutflow: 120000,
      monthlyFreeCashFlow: 60000,
      totalLiquidSavings: 250000,
      assignedGoalCapital: 230000,
      targetAmount: 230000,
      targetDate: "2027-12-31",
      destinationTitle: "Education & Skills",
      projectedDate: "2026-08-24",
      delayInDays: 0,
      requiredMonthlySavings: 0,
    });

    expect(assessment.archetype).toBe("GOAL_ACHIEVED");
    expect(assessment.executiveDecision).toBe("GO");
    expect(assessment.headlineVerdict).toContain("Destination");
    expect(assessment.headlineVerdict).not.toContain("Pace Shortfall");

    const fullText = `${assessment.headlineVerdict} ${assessment.whatYouCanDo} ${assessment.whatItChanges} ${assessment.toStayOnTrack} ${assessment.strategicRead} ${assessment.masterStrategyParagraph}`.toLowerCase();
    expect(fullText).not.toContain("pace shortfall");
    expect(fullText).not.toContain("catch-up plan");
    expect(fullText).not.toContain("trajectory acceleration to bridge");
  });

  // =========================================================================
  // SCENARIO 2 — GOAL EXCEEDED (Target: 230, Saved: 120,000)
  // =========================================================================
  it("Scenario 2: Goal Exceeded handles target < saved gracefully with zero gap and no false savings demand", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "KES",
      monthlyInflow: 180000,
      monthlyOutflow: 120750,
      monthlyFreeCashFlow: 59250,
      totalLiquidSavings: 205000,
      assignedGoalCapital: 120000,
      targetAmount: 230,
      targetDate: "2028-08-24",
      destinationTitle: "Education & Skills",
      projectedDate: "2026-08-24",
      delayInDays: 0,
      requiredMonthlySavings: 0,
    });

    expect(assessment.archetype).toBe("GOAL_ACHIEVED");
    expect(assessment.executiveDecision).toBe("GO");
    expect(assessment.headlineVerdict).not.toContain("Pace Shortfall");

    const fullText = `${assessment.headlineVerdict} ${assessment.masterStrategyParagraph}`.toLowerCase();
    expect(fullText).not.toContain("requires kes 0/mo—leaving a current pacing variance gap");
    expect(fullText).not.toContain("initiate trajectory acceleration");
  });

  // =========================================================================
  // SCENARIO 3 — ON TRACK (projectedCompletionDate <= targetDate)
  // =========================================================================
  it("Scenario 3: On Track timeline enforces zero delay and zero shortfall warnings", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "KES",
      monthlyInflow: 180000,
      monthlyOutflow: 100000,
      monthlyFreeCashFlow: 80000,
      totalLiquidSavings: 300000,
      assignedGoalCapital: 50000,
      targetAmount: 200000,
      targetDate: "2027-12-31",
      destinationTitle: "Business Reserve",
      projectedDate: "2026-12-31",
      delayInDays: 0,
      requiredMonthlySavings: 10000,
    });

    expect(assessment.executiveDecision).toBe("GO");
    expect(assessment.headlineVerdict).toContain("On Track");
    expect(assessment.headlineVerdict).not.toContain("Pace Shortfall");

    const fullText = `${assessment.headlineVerdict} ${assessment.masterStrategyParagraph}`.toLowerCase();
    expect(fullText).not.toContain("pace shortfall");
    expect(fullText).not.toContain("actionable velocity gap");
  });

  // =========================================================================
  // SCENARIO 4 — OFF TRACK (projectedCompletionDate > targetDate)
  // =========================================================================
  it("Scenario 4: Off Track timeline produces explicit ADJUST decision and concrete action plan", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "KES",
      monthlyInflow: 180000,
      monthlyOutflow: 160000,
      monthlyFreeCashFlow: 20000,
      totalLiquidSavings: 100000,
      assignedGoalCapital: 10000,
      targetAmount: 500000,
      targetDate: "2027-01-01",
      destinationTitle: "Home Deposit",
      projectedDate: "2029-01-01",
      delayInDays: 730,
      requiredMonthlySavings: 40000,
    });

    expect(assessment.executiveDecision).toBe("ADJUST");
    expect(assessment.headlineVerdict).toContain("Pace Shortfall");
    expect(assessment.toStayOnTrack).toContain("Increase monthly goal allocation by +KES");
    expect(assessment.toStayOnTrack).not.toBe("Proceed with current goal allocation schedule.");
  });

  // =========================================================================
  // SCENARIO 5 — DATE CONSISTENCY
  // =========================================================================
  it("Scenario 5: Dates have explicit canonical meanings and do not mix up targetDate vs projectedCompletionDate", () => {
    const assessment = generateSeniorStrategistAssessment({
      currency: "KES",
      monthlyInflow: 180000,
      monthlyOutflow: 120000,
      monthlyFreeCashFlow: 60000,
      totalLiquidSavings: 200000,
      assignedGoalCapital: 50000,
      targetAmount: 200000,
      targetDate: "2027-12-31",
      destinationTitle: "Skill Fund",
      projectedDate: "2026-08-30",
      delayInDays: 0,
      requiredMonthlySavings: 10000,
    });

    // Master strategy text must refer to projected completion date when describing expected arrival
    expect(assessment.masterStrategyParagraph).toContain("Aug 2026");
    expect(assessment.masterStrategyParagraph).not.toContain("by Dec 2027 requires KES 0/mo");
  });

  // =========================================================================
  // SCENARIO 6 — RUNTIME INVARIANT VALIDATOR & PDF DATA INTEGRITY
  // =========================================================================
  it("Scenario 6: Runtime consistency guard validates canonical decision invariants", () => {
    const validCanonicalDecision: CanonicalFinancialDecision = {
      analysisDate: "2026-08-24",
      currency: "KES",
      monthlyIncome: 180000,
      mandatoryOutflows: 120000,
      freeCashFlow: 60000,
      liquidReserves: 250000,
      reserveMonths: 2.1,
      reserveTargetMonths: 3.0,
      reserveStatus: "SATISFIED",
      destinationTitle: "Education & Skills",
      targetAmount: 230000,
      confirmedSaved: 230000,
      remainingGap: 0,
      currentMonthlyAllocation: 60000,
      requiredMonthlyAllocation: 0,
      targetDate: "2027-12-31",
      projectedCompletionDate: "2026-08-24",
      trajectoryDelayMonths: 0,
      goalStatus: "ACHIEVED",
      decision: "GO",
      confidence: "HIGH",
      confidenceReasons: ["All inputs verified."],
      shortfallAmount: 0,
      shortfallReason: null,
      recommendedActionType: "REALLOCATE",
      recommendedAction: "Goal fully achieved. Reallocate surplus cash flow to liquid reserves.",
      headlineVerdict: "Executive Decision: GO — Destination Fully Achieved",
      strategicRead: "Target achieved with zero remaining gap.",
      masterStrategyParagraph: "Anchor destination is fully funded with confirmed saved capital.",
      assumptions: [],
      missingVariables: [],
      warnings: [],
    };

    const validation = validateDecisionConsistency(validCanonicalDecision);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(() => assertDecisionConsistency(validCanonicalDecision)).not.toThrow();

    // Verify PDF Report generation from valid data
    const pdfData: PDFReportData = {
      currency: validCanonicalDecision.currency,
      destinationTitle: validCanonicalDecision.destinationTitle,
      targetAmount: validCanonicalDecision.targetAmount,
      currentAmount: validCanonicalDecision.confirmedSaved,
      targetDate: validCanonicalDecision.targetDate,
      projectedDate: validCanonicalDecision.projectedCompletionDate,
      delayInDays: 0,
      monthlyInflow: validCanonicalDecision.monthlyIncome,
      monthlyOutflow: validCanonicalDecision.mandatoryOutflows,
      availableForGoals: validCanonicalDecision.freeCashFlow,
      liquidSavings: validCanonicalDecision.liquidReserves,
      status: "SAFE",
      headlineVerdict: validCanonicalDecision.headlineVerdict,
      whatYouCanDo: validCanonicalDecision.recommendedAction,
      whatItChanges: "No further monthly allocation required.",
      toStayOnTrack: "Reallocate surplus cash flow.",
      strategicRead: validCanonicalDecision.strategicRead,
      masterStrategyParagraph: validCanonicalDecision.masterStrategyParagraph,
    };

    const doc = generateExecutivePDFReport(pdfData);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBe(2);
  });
});
