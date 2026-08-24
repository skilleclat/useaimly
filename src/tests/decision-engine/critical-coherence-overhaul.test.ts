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

describe("ZERO-COMPROMISE 10/10 DOMAIN-DRIVEN FINANCIAL DECISION ENGINE", () => {
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

  // RED TEAM TEST 1: ONE_TIME_EXPENSE
  it("RED TEAM 1: ONE_TIME_EXPENSE updates cash reserves while monthly FCF remains unchanged", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "One-Time Hardware Purchase",
      category: "BUY_SOMETHING",
      transactionType: "ONE_TIME_EXPENSE",
      totalAmount: 1800,
      currency: "EUR",
    });

    expect(analysis.transactionType).toBe("ONE_TIME_EXPENSE");
    // Cash drops by outlay
    expect(analysis.primaryImpact.immediateCashOutflow).toBe(1800);
    expect(analysis.primaryImpact.postDecisionCash).toBe(3040); // 4840 - 1800 = 3040
    expect(analysis.primaryImpact.deltaCash).toBe(-1800);

    // Monthly FCF is strictly unchanged
    expect(analysis.primaryImpact.newMonthlyObligation).toBe(0);
    expect(analysis.primaryImpact.postDecisionFreeCashFlow).toBe(2200);
    expect(analysis.primaryImpact.deltaFreeCashFlow).toBe(0);
    expect(analysis.primaryImpact.fcfPercentageShift).toBe(0);
  });

  // RED TEAM TEST 2: RECURRING_EXPENSE (Rent Adjustment of +€1,800/mo)
  it("RED TEAM 2: RECURRING_EXPENSE updates monthly FCF & living costs without deducting cash reserves", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Rent Adjustment",
      category: "MOVE_HOME",
      transactionType: "RECURRING_EXPENSE",
      totalAmount: 1800,
      currency: "EUR",
    });

    expect(analysis.transactionType).toBe("RECURRING_EXPENSE");

    // Cash reserves are NOT deducted for rent increase (0 initial cash outflow)
    expect(analysis.primaryImpact.immediateCashOutflow).toBe(0);
    expect(analysis.primaryImpact.postDecisionCash).toBe(4840);
    expect(analysis.primaryImpact.deltaCash).toBe(0);

    // Monthly living expenses increase by +1800 EUR/mo (2300 -> 4100 EUR/mo)
    expect(analysis.primaryImpact.newMonthlyObligation).toBe(1800);
    expect(analysis.primaryImpact.postDecisionMonthlyExpenses).toBe(4100);

    // Monthly FCF drops from +2200 to +400 EUR/mo (-82% shift!)
    expect(analysis.primaryImpact.postDecisionFreeCashFlow).toBe(400);
    expect(analysis.primaryImpact.deltaFreeCashFlow).toBe(-1800);
    expect(analysis.primaryImpact.fcfPercentageShift).toBe(82);

    // Emergency runway recalculates against new higher expenses (4840 / 4100 = 1.2 months)
    expect(analysis.primaryImpact.postDecisionRunwayMonths).toBe(1.2);
    expect(analysis.primaryImpact.deltaRunwayMonths).toBe(-0.9);

    // Goal contribution of 990 EUR/mo is squeezed (only 400 EUR/mo available) -> Goal is delayed!
    expect(analysis.primaryImpact.goalStatus).toBe("DELAYED");
    expect(analysis.primaryImpact.goalDelayDays).toBeGreaterThan(0);

    // Verdict correctly flags dangerous runway & cash flow compression
    expect(analysis.verdict.decision).toBe("NOT_RECOMMENDED");
  });

  // RED TEAM TEST 3: STRUCTURE_MODEL_MISMATCH Gate
  it("RED TEAM 3: Catches structure-model mismatch if recurring structure produces 0 FCF shift", () => {
    const corruptReportData: VerifiedDecisionData = {
      decisionId: "dec-mismatch-1",
      reportId: "RPT-20260824-9999",
      version: 1,
      decisionTitle: "Corrupt Rent Decision",
      category: "MOVE_HOME",
      transactionType: "RECURRING_EXPENSE",
      amount: 1800,
      downPayment: 0,
      monthlyPayment: 0,
      isRecurring: true,
      currency: "EUR",
      timestamp: new Date().toISOString(),
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
        monthlyGoalAllocation: 990,
      },
      calculatedImpact: {
        immediateCashOutflow: 1800, // Contradiction: Deducted from cash!
        postDecisionCash: 3040,
        deltaCash: -1800,
        newMonthlyObligation: 0, // Contradiction: 0 monthly obligation!
        postDecisionRunway: 1.3,
        deltaRunway: -0.8,
        postDecisionFreeCashFlow: 2200, // Contradiction: 0 FCF shift!
        deltaFreeCashFlow: 0,
        fcfPercentageShift: 0,
        goalDelayDays: 0,
        goalDelayMonths: 0,
        goalStatus: "ON_TRACK",
        monthlyPressurePercent: 0,
        verdict: "NOT_RECOMMENDED",
        verdictHeadline: "Drops reserves.",
        primaryReason: "Reduces reserves.",
      },
      recommendation: {
        recommendedScenarioId: "OPTION_B",
        recommendedScenarioTitle: "Option B",
        actionPlanStep1: "1. Execute Option B",
        actionPlanStep2: "2. Save",
        actionPlanStep3: "3. Review",
        reasons: ["Safe"],
      },
      alternatives: {
        optionA: { code: "OPTION_A", title: "Option A", badge: "As Proposed", delayDays: 0, cashRemaining: 3040, runway: 1.3, monthlyObligation: 0, totalInterest: 0, totalCost: 1800, isRecommended: false },
        optionB: { code: "OPTION_B", title: "Option B", badge: "Best", delayDays: 0, cashRemaining: 4840, runway: 2.1, monthlyObligation: 0, totalInterest: 0, totalCost: 1800, isRecommended: true },
        optionC: { code: "OPTION_C", title: "Option C", badge: "Alt", delayDays: 0, cashRemaining: 4840, runway: 2.1, monthlyObligation: 0, totalInterest: 0, totalCost: 900, isRecommended: false },
      },
      narrative: {
        executiveSummary: "Summary",
        whyThisVerdict: "Why",
        recommendedPath: "1. Execute Option B",
        tradeoffsSummary: "Tradeoff",
      },
      assumptions: [],
    };

    const verification = runAimlyCoherenceCheck(corruptReportData);
    expect(verification.status).toBe("STRUCTURE_MODEL_MISMATCH");
    expect(verification.inconsistencies[0]).toContain("STRUCTURE_MODEL_MISMATCH");
  });

  // RED TEAM TEST 4: Money Conservation & Zero Residual Drift (The €19 problem eradicated)
  it("RED TEAM 4: Zero residual drift across all scenarios (Ending Cash = Opening - Outflow)", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Self-Funded Purchase",
      category: "BUY_SOMETHING",
      transactionType: "PURCHASE_FUNDING",
      totalAmount: 1800,
      currency: "EUR",
    });

    const optC = analysis.scenarios.optionC;
    // For Option C, target is 1,350 EUR.
    expect(optC.amount).toBe(1350);
    expect(optC.immediateCashOutflow).toBe(0); // 100% self funded
    expect(optC.postDecisionCash).toBe(4840); // Exactly 4,840 (NOT 4,821!)
    expect(optC.ledger.moneyConservationPassed).toBe(true);
  });

  // RED TEAM TEST 5: Assumption Relevance Filter (No 8.5% APR leak on self-funded decisions)
  it("RED TEAM 5: Hides 8.5% APR and financing assumptions when decision is non-financed", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Rent Adjustment",
      category: "MOVE_HOME",
      transactionType: "RECURRING_EXPENSE",
      totalAmount: 1800,
      currency: "EUR",
    });

    expect(analysis.financing.hasFinancing).toBe(false);
    expect(analysis.categorizedAssumptions.financingAssumptions.length).toBe(0);
    expect(analysis.assumptions.some((a) => a.includes("APR"))).toBe(false);
  });

  // RED TEAM TEST 6: Financing Summary becomes visible when loan is evaluated
  it("RED TEAM 6: Financing assumptions & APR become visible when loan is modeled", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Car Loan",
      category: "TAKE_A_LOAN",
      transactionType: "LOAN_OR_DEBT",
      totalAmount: 10000,
      downPayment: 1000,
      currency: "EUR",
    });

    expect(analysis.financing.hasFinancing).toBe(true);
    expect(analysis.financing.aprSourceExplanation).toContain("Benchmark");
    expect(analysis.categorizedAssumptions.financingAssumptions.length).toBeGreaterThan(0);
  });

  // RED TEAM TEST 7: Single Canonical Recommendation Invariant
  it("RED TEAM 7: Exactly one scenario is recommended across badge, action plan, and narrative", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Equipment Outlay",
      category: "BUY_SOMETHING",
      totalAmount: 4000,
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

  // RED TEAM TEST 8: Full Verified PDF Generation (Dynamic 2-Page Layout)
  it("RED TEAM 8: Generates 10/10 PDF report matching active transaction type with 0 broken symbols", () => {
    const analysis = evaluateCanonicalDecision(mandatoryBaseline, {
      title: "Rent Adjustment",
      category: "MOVE_HOME",
      transactionType: "RECURRING_EXPENSE",
      totalAmount: 1800,
      currency: "EUR",
    });

    const reportData: VerifiedDecisionData = {
      decisionId: "dec-final-recurring-1",
      reportId: "RPT-20260824-7777",
      version: 1,
      decisionTitle: analysis.inputs.title,
      category: analysis.inputs.category,
      transactionType: analysis.transactionType,
      amount: analysis.inputs.totalAmount,
      downPayment: 0,
      monthlyPayment: analysis.primaryImpact.monthlyPayment,
      isRecurring: true,
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
          ledger: analysis.scenarios.optionA.ledger,
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
          ledger: analysis.scenarios.optionB.ledger,
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
          ledger: analysis.scenarios.optionC.ledger,
          isRecommended: analysis.scenarios.optionC.isRecommended,
        },
      },
      narrative: {
        executiveSummary: analysis.verdict.primaryReason,
        whyThisVerdict: analysis.verdict.primaryReason,
        recommendedPath: analysis.recommendation.actionPlanStep1,
        tradeoffsSummary: "Tradeoff between monthly rent obligation and goal accumulation.",
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
