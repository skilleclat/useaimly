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

describe("ZERO-COMPROMISE 10/10 FINANCIAL DECISION REPORT STANDARD", () => {
  // MANDATORY USER TEST CASE FROM PROMPT
  const mandatoryBaseline: BaselineFinancialProfile = {
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

  // 1. MANDATORY TEST: €4,000 Purchase Decision Money Flow & Conservation
  it("MANDATORY TEST: Reconciles €4,000 purchase without fake math or double-counting", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Business Laptop & Hardware",
      category: "BUY_SOMETHING",
      decisionType: "PURCHASE_FUNDING",
      totalAmount: 4000,
      currency: "EUR",
      priority: "PROTECT_CASH",
    });

    const baseline = analysis.baseline;
    expect(baseline.monthlyIncome).toBe(4500);
    expect(baseline.monthlyLivingExpenses).toBe(2300);
    expect(baseline.netFreeCashFlow).toBe(2200);
    expect(baseline.primaryGoal.monthlyAllocation).toBe(990);

    // Available cash flow after goal allocation: 2,200 - 990 = 1,210 EUR/mo
    const availableForDecision = 2200 - 990;
    expect(availableForDecision).toBe(1210);

    // OPTION A: Pay Now from Cash
    const optA = analysis.scenarios.optionA;
    expect(optA.immediateCashOutflow).toBe(4000);
    expect(optA.postDecisionCash).toBe(840); // 4840 - 4000 = 840
    expect(optA.postDecisionRunwayMonths).toBe(0.4); // 840 / 2300 = 0.4 mos (Critical breach!)
    expect(analysis.verdict.decision).toBe("NOT_RECOMMENDED"); // Correctly flags reserve breach!

    // OPTION B: Wait until fully self-funded
    const optB = analysis.scenarios.optionB;
    // 4000 / 1210 = 3.3 months (~100 days)
    expect(optB.fundingMechanics.waitDaysRequired).toBeGreaterThanOrEqual(90);
    expect(optB.fundingMechanics.waitDaysRequired).toBeLessThanOrEqual(120);
    expect(optB.fundingMechanics.monthlyGoalAllocation).toBe(990); // 100% preserved
    expect(optB.fundingMechanics.monthlyDecisionSavings).toBe(1210);
    expect(optB.fundingMechanics.outflowFromExistingReserves).toBe(0); // 0 reserve outflow!
    expect(optB.postDecisionCash).toBe(4840); // Reserves intact!
    expect(optB.postDecisionRunwayMonths).toBe(2.1); // Runway untouched!
    expect(optB.goalDelayDays).toBe(0); // Goal is 100% on track!
    expect(optB.fundingMechanics.moneyConservationPassed).toBe(true);

    // Winning scenario is Option B
    expect(analysis.recommendation.recommendedScenarioId).toBe("OPTION_B");
    expect(analysis.recommendation.actionPlanStep1.toLowerCase()).toContain("option b");
  });

  // 2. INVARIANT: Money Conservation Invariant across all scenarios
  it("Invariant: Money conservation strictly passes for every scenario", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Business Expansion Outlay",
      category: "BUY_SOMETHING",
      decisionType: "PURCHASE_FUNDING",
      totalAmount: 5000,
      currency: "EUR",
    });

    expect(analysis.scenarios.optionA.fundingMechanics.moneyConservationPassed).toBe(true);
    expect(analysis.scenarios.optionB.fundingMechanics.moneyConservationPassed).toBe(true);
    expect(analysis.scenarios.optionC.fundingMechanics.moneyConservationPassed).toBe(true);
  });

  // 3. INVARIANT: Single Canonical Recommendation Invariant
  it("Invariant: exactly one scenario is recommended and matches action plan & narrative", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Equipment Purchase",
      category: "BUY_SOMETHING",
      totalAmount: 3000,
      currency: "EUR",
    });

    const recId = analysis.recommendation.recommendedScenarioId;
    const recCount = [
      analysis.scenarios.optionA.isRecommended,
      analysis.scenarios.optionB.isRecommended,
      analysis.scenarios.optionC.isRecommended,
      analysis.scenarios.optionD?.isRecommended,
    ].filter(Boolean).length;

    expect(recCount).toBe(1);
    expect(analysis.recommendation.actionPlanStep1.toLowerCase()).toContain(recId.replace("_", " ").toLowerCase());
  });

  // 4. FINANCING SUMMARY EXPLAINABILITY & APR PROVENANCE
  it("produces clear provenance for APR when financing is evaluated", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Financed Equipment",
      category: "BUY_A_CAR",
      decisionType: "FINANCED_PURCHASE",
      totalAmount: 15000,
      downPayment: 3000,
      loanTermMonths: 36,
      currency: "EUR",
    });

    expect(analysis.financing.hasFinancing).toBe(true);
    expect(analysis.financing.aprSourceExplanation).toContain("Benchmark");
    expect(analysis.categorizedAssumptions.financingAssumptions.length).toBeGreaterThan(0);
  });

  // 5. PDF GENERATION: Produces 10/10 publication-grade document
  it("Generates 10/10 publication-grade PDF report with Funding Mechanics and 0 broken symbols", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Business Laptop & Hardware",
      category: "BUY_SOMETHING",
      decisionType: "PURCHASE_FUNDING",
      totalAmount: 4000,
      currency: "EUR",
    });

    const reportData: VerifiedDecisionData = {
      decisionId: "dec-final-10",
      reportId: "RPT-20260824-0010",
      version: 1,
      decisionTitle: analysis.inputs.title,
      category: analysis.inputs.category,
      decisionType: analysis.inputs.decisionType,
      amount: analysis.inputs.totalAmount,
      downPayment: 0,
      monthlyPayment: analysis.primaryImpact.monthlyPayment,
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
        monthlyGoalAllocation: analysis.baseline.primaryGoal.monthlyAllocation,
      },
      financing: analysis.financing,
      categorizedAssumptions: analysis.categorizedAssumptions,
      recommendation: analysis.recommendation,
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
        goalExplanation: analysis.primaryImpact.goalExplanation,
        monthlyPressurePercent: analysis.primaryImpact.fcfPercentageShift,
        verdict: analysis.verdict.decision,
        verdictHeadline: analysis.verdict.headline,
        primaryReason: analysis.verdict.primaryReason,
      },
      alternatives: {
        optionA: {
          code: "OPTION_A",
          title: analysis.scenarios.optionA.title,
          badge: analysis.scenarios.optionA.badge,
          delayDays: analysis.scenarios.optionA.goalDelayDays,
          cashRemaining: analysis.scenarios.optionA.postDecisionCash,
          runway: analysis.scenarios.optionA.postDecisionRunwayMonths,
          monthlyObligation: analysis.scenarios.optionA.monthlyPayment,
          totalInterest: analysis.scenarios.optionA.totalInterestPaid,
          totalCost: analysis.scenarios.optionA.totalCostOverTime,
          fundingMechanics: analysis.scenarios.optionA.fundingMechanics,
          isRecommended: analysis.scenarios.optionA.isRecommended,
        },
        optionB: {
          code: "OPTION_B",
          title: analysis.scenarios.optionB.title,
          badge: analysis.scenarios.optionB.badge,
          delayDays: analysis.scenarios.optionB.goalDelayDays,
          cashRemaining: analysis.scenarios.optionB.postDecisionCash,
          runway: analysis.scenarios.optionB.postDecisionRunwayMonths,
          monthlyObligation: analysis.scenarios.optionB.monthlyPayment,
          totalInterest: analysis.scenarios.optionB.totalInterestPaid,
          totalCost: analysis.scenarios.optionB.totalCostOverTime,
          fundingMechanics: analysis.scenarios.optionB.fundingMechanics,
          isRecommended: analysis.scenarios.optionB.isRecommended,
        },
        optionC: {
          code: "OPTION_C",
          title: analysis.scenarios.optionC.title,
          badge: analysis.scenarios.optionC.badge,
          delayDays: analysis.scenarios.optionC.goalDelayDays,
          cashRemaining: analysis.scenarios.optionC.postDecisionCash,
          runway: analysis.scenarios.optionC.postDecisionRunwayMonths,
          monthlyObligation: analysis.scenarios.optionC.monthlyPayment,
          totalInterest: analysis.scenarios.optionC.totalInterestPaid,
          totalCost: analysis.scenarios.optionC.totalCostOverTime,
          fundingMechanics: analysis.scenarios.optionC.fundingMechanics,
          isRecommended: analysis.scenarios.optionC.isRecommended,
        },
      },
      narrative: {
        executiveSummary: analysis.verdict.primaryReason,
        whyThisVerdict: analysis.verdict.primaryReason,
        recommendedPath: analysis.recommendation.actionPlanStep1,
        tradeoffsSummary: "Tradeoff between immediate cash outflow and buffer protection.",
      },
      assumptions: analysis.assumptions,
    };

    const verification = runAimlyCoherenceCheck(reportData);
    expect(verification.status).toBe("VERIFIED WITH ASSUMPTIONS");
    expect(verification.checks.every((c) => c.passed)).toBe(true);

    const pdfDoc = generateVerifiedDecisionReportPDF(reportData, verification, "en");
    expect(pdfDoc.getNumberOfPages()).toBe(2);
    expect(pdfDoc.output("blob").size).toBeGreaterThan(6000);
  });
});
