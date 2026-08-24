import { describe, it, expect } from "vitest";
import {
  runAimlyCoherenceCheck,
  VerifiedDecisionData,
} from "@/lib/decision-engine/decision-validator";
import { generateVerifiedDecisionReportPDF } from "@/lib/decision-engine/verified-report-generator";
import {
  saveDecisionReportToVault,
  getReportsForDecision,
} from "@/lib/decision-engine/report-vault";

describe("Verified Financial Decision Report System", () => {
  const mockValidDecisionData: VerifiedDecisionData = {
    decisionId: "dec-test-1",
    reportId: "RPT-20260824-8842",
    version: 1,
    decisionTitle: "Purchase a $8,000 Vehicle",
    category: "BUY_A_CAR",
    decisionType: "ONE_OFF_PURCHASE",
    amount: 8000,
    downPayment: 0,
    monthlyPayment: 0,
    isRecurring: false,
    currency: "USD",
    timestamp: "2026-08-24T18:00:00Z",
    baseline: {
      liquidSavings: 14000,
      monthlyIncome: 6500,
      monthlyExpenses: 2500,
      monthlyDebtService: 500,
      netFreeCashFlow: 3500,
      emergencyRunwayMonths: 4.6,
      primaryGoalTitle: "Buy a Home",
      primaryGoalTarget: 60000,
      primaryGoalCurrent: 24000,
      primaryGoalTargetDate: "2028-06-30",
    },
    recommendation: {
      recommendedScenarioId: "OPTION_B",
      recommendedScenarioTitle: "Option B: Wait 2 Months & Save First",
      actionPlanStep1: "1. Execute OPTION B: Wait 60 days to accumulate funds from cash flow.",
      actionPlanStep2: "2. Maintain monthly goal savings.",
      actionPlanStep3: "3. Re-evaluate if terms change.",
      reasons: ["Preserves 3.6 months runway", "Minimizes borrowing"],
    },
    calculatedImpact: {
      immediateCashOutflow: 8000,
      postDecisionCash: 6000, // 14,000 - 8,000 = 6,000
      deltaCash: -8000,
      newMonthlyObligation: 0,
      postDecisionRunway: 2.0, // 6,000 / (2500+500) = 2.0 mos
      deltaRunway: -2.6,
      postDecisionFreeCashFlow: 3500,
      deltaFreeCashFlow: 0,
      fcfPercentageShift: 0,
      goalDelayDays: 150,
      goalDelayMonths: 5,
      goalStatus: "DELAYED",
      monthlyPressurePercent: 0,
      verdict: "PROCEED_WITH_CAUTION",
      verdictHeadline: "Buying this vehicle today is feasible but shifts your Home Goal by ~5 months.",
      primaryReason: "Reduces liquid buffer below the 3.0-month safety target and absorbs 5 months of goal contributions.",
    },
    alternatives: {
      optionA: {
        code: "OPTION_A",
        title: "Option A: Buy Vehicle Today",
        badge: "Immediate",
        delayDays: 150,
        cashRemaining: 6000,
        runway: 2.0,
        monthlyObligation: 0,
        totalInterest: 0,
        totalCost: 8000,
        isRecommended: false,
      },
      optionB: {
        code: "OPTION_B",
        title: "Option B: Wait 2 Months & Save First",
        badge: "Aimly Best",
        delayDays: 30,
        cashRemaining: 11000,
        runway: 3.6,
        monthlyObligation: 0,
        totalInterest: 0,
        totalCost: 8000,
        isRecommended: true,
      },
      optionC: {
        code: "OPTION_C",
        title: "Option C: Choose $6,000 Used Model",
        badge: "Budget",
        delayDays: 60,
        cashRemaining: 8000,
        runway: 2.6,
        monthlyObligation: 0,
        totalInterest: 0,
        totalCost: 6000,
        isRecommended: false,
      },
    },
    narrative: {
      executiveSummary:
        "Evaluating this $8,000 expenditure reveals that cash availability ($14,000) permits execution, but reduces living buffer to 2.0 months and shifts your Home Goal by 150 days.",
      whyThisVerdict:
        "The decision is executable but triggers a reserve warning by dipping below the 3.0-month target floor.",
      recommendedPath: "1. Execute OPTION B: Wait 60 days to accumulate funds from cash flow.",
      tradeoffsSummary: "Immediate vehicle utility vs 5 months delay on Home Goal arrival timeline.",
    },
    assumptions: [
      "Assumes stable monthly income of $6,500 over the projection horizon.",
      "Assumes fixed living expenses remain consistent at $2,500/month.",
      "Does not account for unplanned emergency liquidity shocks.",
    ],
  };

  // 1. COHERENCE CHECK: Mathematical consistency
  it("Aimly Coherence Check: passes all verification tests on consistent data", () => {
    const verification = runAimlyCoherenceCheck(mockValidDecisionData);
    expect(verification.status).toBe("VERIFIED WITH ASSUMPTIONS");
    expect(verification.overallScore).toBe(100);
    expect(verification.checks.length).toBe(10);
    expect(verification.checks.every((c) => c.passed)).toBe(true);
    expect(verification.inconsistencies.length).toBe(0);
  });

  // 2. COHERENCE CHECK: Catching mathematical disparity
  it("Aimly Coherence Check: detects mathematical disparity if cash after is inconsistent", () => {
    const corruptData: VerifiedDecisionData = {
      ...mockValidDecisionData,
      calculatedImpact: {
        ...mockValidDecisionData.calculatedImpact,
        postDecisionCash: 9999, // Should be 6,000 (14,000 - 8,000)
      },
    };

    const verification = runAimlyCoherenceCheck(corruptData);
    expect(verification.status).toBe("INCONSISTENCY DETECTED");
    const mathCheck = verification.checks.find((c) => c.category === "MATHEMATICAL_CONSISTENCY");
    expect(mathCheck?.passed).toBe(false);
    expect(verification.inconsistencies[0]).toContain("Mathematical disparity");
  });

  // 3. COHERENCE CHECK: Catching verdict inconsistency
  it("Aimly Coherence Check: detects verdict inconsistency if risk rules are violated", () => {
    const corruptVerdictData: VerifiedDecisionData = {
      ...mockValidDecisionData,
      calculatedImpact: {
        ...mockValidDecisionData.calculatedImpact,
        postDecisionRunway: 1.5,
        verdict: "RECOMMENDED", // Contradicts 1.5 mos runway (< 2.0 mos)
      },
    };

    const verification = runAimlyCoherenceCheck(corruptVerdictData);
    expect(verification.status).toBe("INCONSISTENCY DETECTED");
    const verdictCheck = verification.checks.find((c) => c.category === "VERDICT_CONSISTENCY");
    expect(verdictCheck?.passed).toBe(false);
  });

  // 4. PDF GENERATION: Generates audit-grade PDF with all sections
  it("generates a professional multi-page Verified Decision PDF report", () => {
    const verification = runAimlyCoherenceCheck(mockValidDecisionData);
    const pdfDoc = generateVerifiedDecisionReportPDF(mockValidDecisionData, verification, "en");

    expect(pdfDoc).toBeDefined();
    expect(pdfDoc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

    const pdfBlob = pdfDoc.output("blob");
    expect(pdfBlob.size).toBeGreaterThan(5000);
  });

  // 5. PDF GENERATION: Works in French and Swahili
  it("generates Verified Decision PDF reports in French and Swahili seamlessly", () => {
    const verification = runAimlyCoherenceCheck(mockValidDecisionData);
    const pdfFr = generateVerifiedDecisionReportPDF(mockValidDecisionData, verification, "fr");
    const pdfSw = generateVerifiedDecisionReportPDF(mockValidDecisionData, verification, "sw");

    expect(pdfFr.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(pdfSw.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  // 6. REPORT VAULT & VERSIONING: Increments report versions without overwriting
  it("Report Vault: stores versioned reports (v1, v2) without silent overwriting", () => {
    const verification = runAimlyCoherenceCheck(mockValidDecisionData);

    const rpt1 = saveDecisionReportToVault(mockValidDecisionData, verification);
    expect(rpt1.version).toBeGreaterThanOrEqual(1);

    // Modified data (e.g. user changes assumption / down payment)
    const modifiedData: VerifiedDecisionData = {
      ...mockValidDecisionData,
      downPayment: 2000,
    };
    const rpt2 = saveDecisionReportToVault(modifiedData, verification);
    expect(rpt2.version).toBe(rpt1.version + 1);

    const history = getReportsForDecision(mockValidDecisionData.decisionTitle);
    expect(history.length).toBeGreaterThanOrEqual(2);
  });
});
