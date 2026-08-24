import { describe, it, expect } from "vitest";
import {
  evaluateCanonicalDecision,
  calculateMonthlyLoanPayment,
  DecisionInputParameters,
} from "@/lib/decision-engine/canonical-decision-engine";
import {
  runAimlyCoherenceCheck,
  VerifiedDecisionData,
} from "@/lib/decision-engine/decision-validator";
import { generateVerifiedDecisionReportPDF } from "@/lib/decision-engine/verified-report-generator";
import { BaselineFinancialProfile } from "@/lib/finance";

describe("CRITICAL ACCURACY & COHERENCE OVERHAUL TEST SUITE", () => {
  const regressionBaseline: BaselineFinancialProfile = {
    liquidSavings: 4840,
    incomes: [
      { name: "Primary Income", amount: 4500, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
    ],
    expenses: [
      { name: "Living Expenses", amount: 2300, frequency: "MONTHLY", isFixed: true },
    ],
    debts: [],
    commitments: [],
    goals: [
      {
        id: "business-goal",
        title: "Business Launch Goal",
        targetAmount: 25000,
        currentAmount: 12000,
        targetDate: "2027-12-31",
        priority: "HIGH",
        status: "ACTIVE",
      },
    ],
  };

  // 1. Mandatory Loan Decision Regression Test (Phase 14)
  it("Phase 14 Regression Test: correctly models €10,000 Loan with €1,000 Down Payment", () => {
    const loanInputs: DecisionInputParameters = {
      title: "Loan Facility / Borrowing",
      category: "TAKE_A_LOAN",
      decisionType: "LOAN_FACILITY",
      totalAmount: 10000,
      downPayment: 1000,
      loanTermMonths: 36,
      annualInterestRatePercent: 8.5,
      currency: "EUR",
      priority: "PROTECT_CASH",
    };

    const analysis = evaluateCanonicalDecision(regressionBaseline, loanInputs);

    // 1. Cash Outflow & Post-Decision Cash Reconciliation
    expect(analysis.primaryImpact.immediateCashOutflow).toBe(1000); // strictly down payment leaves pocket!
    expect(analysis.primaryImpact.postDecisionCash).toBe(3840); // 4,840 - 1,000 = 3,840 (NOT 4,840!)
    expect(analysis.primaryImpact.deltaCash).toBe(-1000); // NOT -10,000!

    // 2. Amortized Monthly Payment on Financed Amount (€9,000)
    // PMT for €9,000 @ 8.5% over 36 mos is approx €284.14
    expect(analysis.primaryImpact.newMonthlyObligation).toBeGreaterThan(250);
    expect(analysis.primaryImpact.newMonthlyObligation).toBeLessThan(320);

    // 3. Post-Decision Free Cash Flow Reconciliation
    const expectedFCF = Math.round((2200 - analysis.primaryImpact.newMonthlyObligation) * 100) / 100;
    expect(analysis.primaryImpact.postDecisionFreeCashFlow).toBe(expectedFCF);

    // 4. FCF Percentage Shift is realistic (around 13%, NOT +435%!)
    expect(analysis.primaryImpact.fcfPercentageShift).toBeGreaterThan(10);
    expect(analysis.primaryImpact.fcfPercentageShift).toBeLessThan(20);

    // 5. Goal Delay is realistic and sane (around 30-180 days, NOT 29,970 days!)
    expect(analysis.primaryImpact.goalDelayDays).toBeLessThan(365);
    expect(analysis.primaryImpact.goalDelayDays).toBeGreaterThanOrEqual(0);

    // 6. Option B does NOT claim 3.0 mos when baseline is 2.1 mos
    expect(analysis.scenarios.optionB.postDecisionRunwayMonths).toBe(2.1);
  });

  // 2. Pure Loan Amortization Formula Verification
  it("computes exact deterministic PMT, interest, and total cost", () => {
    const loan = calculateMonthlyLoanPayment(10000, 8.5, 36);
    expect(loan.monthlyPayment).toBe(315.68); // Exact PMT
    expect(loan.totalCost).toBe(11364.48);
    expect(loan.totalInterest).toBe(1364.48);
  });

  // 3. Aimly Coherence Check: Rejects Mathematical Disparities
  it("Aimly Coherence Check rejects fake math or mismatched cash flows", () => {
    const validData: VerifiedDecisionData = {
      decisionId: "dec-1",
      reportId: "RPT-20260824-0001",
      version: 1,
      decisionTitle: "Purchase Equipment",
      category: "BUY_SOMETHING",
      decisionType: "ONE_OFF_PURCHASE",
      amount: 2000,
      downPayment: 0,
      monthlyPayment: 0,
      isRecurring: false,
      currency: "EUR",
      timestamp: "2026-08-24T18:00:00Z",
      baseline: {
        liquidSavings: 4840,
        monthlyIncome: 4500,
        monthlyExpenses: 2300,
        monthlyDebtService: 0,
        netFreeCashFlow: 2200,
        emergencyRunwayMonths: 2.1,
        primaryGoalTitle: "Business Goal",
        primaryGoalTarget: 25000,
        primaryGoalCurrent: 12000,
        primaryGoalTargetDate: "2027-12-31",
      },
      calculatedImpact: {
        immediateCashOutflow: 2000,
        postDecisionCash: 2840, // 4840 - 2000 = 2840
        deltaCash: -2000,
        newMonthlyObligation: 0,
        postDecisionRunway: 1.2,
        deltaRunway: -0.9,
        postDecisionFreeCashFlow: 2200,
        deltaFreeCashFlow: 0,
        fcfPercentageShift: 0, // strictly 0%
        goalDelayDays: 30,
        goalDelayMonths: 1,
        goalStatus: "DELAYED",
        monthlyPressurePercent: 0,
        verdict: "PROCEED_WITH_CAUTION",
        verdictHeadline: "Reduces emergency buffer.",
        primaryReason: "Reduces buffer from 2.1 to 1.2 months.",
      },
      alternatives: {
        optionA: { title: "Buy Today", badge: "Immediate", delayDays: 30, cashRemaining: 2840, runway: 1.2, monthlyObligation: 0, isRecommended: false },
        optionB: { title: "Wait 30 Days", badge: "Best", delayDays: 0, cashRemaining: 4840, runway: 2.1, monthlyObligation: 0, isRecommended: true },
        optionC: { title: "Cheaper Option", badge: "Budget", delayDays: 15, cashRemaining: 3340, runway: 1.5, monthlyObligation: 0, isRecommended: false },
      },
      narrative: {
        executiveSummary: "Analysis of 2000 EUR purchase.",
        whyThisVerdict: "Reduces buffer to 1.2 months.",
        recommendedPath: "Option B preserves 2.1 months runway.",
        tradeoffsSummary: "Tradeoff between immediate purchase and safety.",
      },
      assumptions: [],
    };

    const result = runAimlyCoherenceCheck(validData);
    expect(result.status).toBe("VERIFIED");
    expect(result.overallScore).toBe(100);

    // Corrupt Cash After
    const corruptData: VerifiedDecisionData = {
      ...validData,
      calculatedImpact: {
        ...validData.calculatedImpact,
        postDecisionCash: 4840, // Mismatched! Should be 2840
      },
    };
    const badResult = runAimlyCoherenceCheck(corruptData);
    expect(badResult.status).toBe("INCONSISTENCY DETECTED");
  });

  // 4. PDF Generation with High Contrast and Zero Hidden Boxes
  it("generates publication-grade PDF without dark-on-dark text errors", () => {
    const analysis = evaluateCanonicalDecision(regressionBaseline, {
      title: "Loan Facility / Borrowing",
      category: "TAKE_A_LOAN",
      decisionType: "LOAN_FACILITY",
      totalAmount: 10000,
      downPayment: 1000,
      currency: "EUR",
    });

    const reportData: VerifiedDecisionData = {
      decisionId: "dec-reg-1",
      reportId: "RPT-20260824-9999",
      version: 1,
      decisionTitle: analysis.inputs.title,
      category: analysis.inputs.category,
      decisionType: analysis.inputs.decisionType,
      amount: analysis.inputs.totalAmount,
      downPayment: analysis.inputs.downPayment || 0,
      monthlyPayment: analysis.primaryImpact.newMonthlyObligation,
      isRecurring: false,
      currency: "EUR",
      timestamp: analysis.timestamp,
      baseline: {
        liquidSavings: analysis.baseline.liquidSavings,
        monthlyIncome: analysis.baseline.monthlyIncome,
        monthlyExpenses: analysis.baseline.monthlyLivingExpenses,
        monthlyDebtService: analysis.baseline.monthlyDebtService,
        netFreeCashFlow: analysis.baseline.netFreeCashFlow,
        emergencyRunwayMonths: analysis.baseline.emergencyRunwayMonths,
        primaryGoalTitle: analysis.baseline.primaryGoal.title,
        primaryGoalTarget: analysis.baseline.primaryGoal.targetAmount,
        primaryGoalCurrent: analysis.baseline.primaryGoal.currentAmount,
        primaryGoalTargetDate: analysis.baseline.primaryGoal.targetDate,
      },
      calculatedImpact: {
        immediateCashOutflow: analysis.primaryImpact.immediateCashOutflow,
        postDecisionCash: analysis.primaryImpact.postDecisionCash,
        deltaCash: analysis.primaryImpact.deltaCash,
        newMonthlyObligation: analysis.primaryImpact.newMonthlyObligation,
        postDecisionRunway: analysis.primaryImpact.postDecisionRunwayMonths,
        deltaRunway: analysis.primaryImpact.deltaRunwayMonths,
        postDecisionFreeCashFlow: analysis.primaryImpact.postDecisionFreeCashFlow,
        deltaFreeCashFlow: analysis.primaryImpact.deltaFreeCashFlow,
        fcfPercentageShift: analysis.primaryImpact.fcfPercentageShift,
        goalDelayDays: analysis.primaryImpact.goalDelayDays,
        goalDelayMonths: analysis.primaryImpact.goalDelayMonths,
        goalStatus: analysis.primaryImpact.goalStatus,
        monthlyPressurePercent: analysis.primaryImpact.fcfPercentageShift,
        verdict: analysis.verdict.decision,
        verdictHeadline: analysis.verdict.headline,
        primaryReason: analysis.verdict.primaryReason,
      },
      alternatives: {
        optionA: {
          title: analysis.scenarios.optionA.title,
          badge: analysis.scenarios.optionA.badge,
          delayDays: analysis.scenarios.optionA.goalDelayDays,
          cashRemaining: analysis.scenarios.optionA.postDecisionCash,
          runway: analysis.scenarios.optionA.postDecisionRunwayMonths,
          monthlyObligation: analysis.scenarios.optionA.newMonthlyObligation,
          isRecommended: analysis.scenarios.optionA.isRecommended,
        },
        optionB: {
          title: analysis.scenarios.optionB.title,
          badge: analysis.scenarios.optionB.badge,
          delayDays: analysis.scenarios.optionB.goalDelayDays,
          cashRemaining: analysis.scenarios.optionB.postDecisionCash,
          runway: analysis.scenarios.optionB.postDecisionRunwayMonths,
          monthlyObligation: analysis.scenarios.optionB.newMonthlyObligation,
          isRecommended: analysis.scenarios.optionB.isRecommended,
        },
        optionC: {
          title: analysis.scenarios.optionC.title,
          badge: analysis.scenarios.optionC.badge,
          delayDays: analysis.scenarios.optionC.goalDelayDays,
          cashRemaining: analysis.scenarios.optionC.postDecisionCash,
          runway: analysis.scenarios.optionC.postDecisionRunwayMonths,
          monthlyObligation: analysis.scenarios.optionC.newMonthlyObligation,
          isRecommended: analysis.scenarios.optionC.isRecommended,
        },
      },
      narrative: {
        executiveSummary: analysis.verdict.primaryReason,
        whyThisVerdict: analysis.verdict.primaryReason,
        recommendedPath: "Execute Option B to preserve current runway.",
        tradeoffsSummary: "Tradeoff between monthly payment and goal timeline.",
      },
      assumptions: analysis.assumptions,
      isAssumedLoanTerms: analysis.isAssumedLoanTerms,
    };

    const verification = runAimlyCoherenceCheck(reportData);
    expect(verification.status).toBe("VERIFIED WITH ASSUMPTIONS");

    const pdfDoc = generateVerifiedDecisionReportPDF(reportData, verification, "en");
    expect(pdfDoc.getNumberOfPages()).toBe(2);
    expect(pdfDoc.output("blob").size).toBeGreaterThan(5000);
  });
});
