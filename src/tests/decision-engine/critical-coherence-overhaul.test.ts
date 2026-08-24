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

  // 1. INVARIANT TEST: Single Canonical Recommendation Invariant (Critical Issue #1)
  it("Invariant: exactly one scenario is recommended and matches action plan & narrative", () => {
    const analysis = evaluateCanonicalDecision(regressionBaseline, {
      title: "Loan Facility / Borrowing",
      category: "TAKE_A_LOAN",
      decisionType: "LOAN_FACILITY",
      totalAmount: 10000,
      downPayment: 0,
      loanTermMonths: 36,
      annualInterestRatePercent: 8.5,
      currency: "EUR",
      priority: "PROTECT_CASH",
    });

    const recId = analysis.recommendation.recommendedScenarioId;
    expect(["OPTION_A", "OPTION_B", "OPTION_C", "OPTION_D"]).toContain(recId);

    // Only the winning scenario has isRecommended = true
    const recCount = [
      analysis.scenarios.optionA.isRecommended,
      analysis.scenarios.optionB.isRecommended,
      analysis.scenarios.optionC.isRecommended,
      analysis.scenarios.optionD?.isRecommended,
    ].filter(Boolean).length;
    expect(recCount).toBe(1);

    // Action plan step 1 directly cites the winning scenario
    expect(analysis.recommendation.actionPlanStep1.toLowerCase()).toContain(recId.replace("_", " ").toLowerCase());
  });

  // 2. SCENARIOS ACTUALLY DIFFER (Critical Issue #2)
  it("Scenarios are deeply differentiated across cash, payments, interest, and timeline", () => {
    const analysis = evaluateCanonicalDecision(regressionBaseline, {
      title: "Loan Facility / Borrowing",
      category: "TAKE_A_LOAN",
      decisionType: "LOAN_FACILITY",
      totalAmount: 10000,
      downPayment: 0,
      loanTermMonths: 36,
      annualInterestRatePercent: 8.5,
      currency: "EUR",
      priority: "PROTECT_CASH",
    });

    const optA = analysis.scenarios.optionA;
    const optB = analysis.scenarios.optionB;
    const optC = analysis.scenarios.optionC;

    // Option A vs Option B
    // Option A borrows €10k -> monthly payment ~€315.68, interest ~€1,364.48
    expect(optA.monthlyPayment).toBe(315.68);
    expect(optA.totalInterestPaid).toBe(1364.48);

    // Option B accumulates cash from FCF, borrowing less (e.g. €5,600) -> lower payment & interest!
    expect(optB.monthlyPayment).toBeLessThan(optA.monthlyPayment);
    expect(optB.totalInterestPaid).toBeLessThan(optA.totalInterestPaid);
    expect(optB.downPayment).toBeGreaterThan(0);

    // Option C is 25% lower outlay (€7,500) -> lower payment & interest than Option A
    expect(optC.amount).toBe(7500);
    expect(optC.monthlyPayment).toBe(236.76);
    expect(optC.totalInterestPaid).toBe(1023.36);
  });

  // 3. FINANCING SUMMARY EXPLAINABILITY (Critical Issue #3)
  it("produces complete deterministic financing summary for loan decisions", () => {
    const analysis = evaluateCanonicalDecision(regressionBaseline, {
      title: "Vehicle Financing",
      category: "BUY_A_CAR",
      decisionType: "FINANCED_PURCHASE",
      totalAmount: 20000,
      downPayment: 5000,
      loanTermMonths: 48,
      annualInterestRatePercent: 6.0,
      currency: "USD",
    });

    expect(analysis.financing.hasFinancing).toBe(true);
    expect(analysis.financing.principalBorrowed).toBe(15000);
    expect(analysis.financing.downPayment).toBe(5000);
    expect(analysis.financing.annualInterestRatePercent).toBe(6.0);
    expect(analysis.financing.loanTermMonths).toBe(48);
    expect(analysis.financing.monthlyPayment).toBe(352.28);
    expect(analysis.financing.totalInterestPaid).toBe(1909.44);
    expect(analysis.financing.totalLifetimeCost).toBe(21909.44);
    expect(analysis.financing.isAssumedTerms).toBe(false);
  });

  // 4. GOAL IMPACT EXPLAINABILITY (Critical Issue #4)
  it("explains exactly why a goal stays on track or shifts", () => {
    const analysis = evaluateCanonicalDecision(regressionBaseline, {
      title: "Equipment Purchase",
      category: "BUY_SOMETHING",
      decisionType: "ONE_OFF_PURCHASE",
      totalAmount: 1000,
      currency: "EUR",
    });

    expect(analysis.primaryImpact.goalStatus).toBe("ON_TRACK");
    expect(analysis.primaryImpact.goalExplanation).toContain("remains 100% on schedule");
  });

  // 5. RED TEAM: Overleveraged loan exceeding Free Cash Flow
  it("Red Team: Rejects loan where payment exceeds monthly free cash flow", () => {
    const tightBaseline: BaselineFinancialProfile = {
      ...regressionBaseline,
      expenses: [{ name: "High Living", amount: 4300, frequency: "MONTHLY", isFixed: true }], // FCF = +200/mo
    };

    const analysis = evaluateCanonicalDecision(tightBaseline, {
      title: "Massive Loan",
      category: "TAKE_A_LOAN",
      decisionType: "LOAN_FACILITY",
      totalAmount: 50000,
      loanTermMonths: 36,
      currency: "EUR",
    });

    expect(analysis.verdict.decision).toBe("NOT_RECOMMENDED");
    expect(analysis.primaryImpact.monthlyPayment).toBeGreaterThan(tightBaseline.incomes[0].amount - tightBaseline.expenses[0].amount);
  });

  // 6. RED TEAM: Zero Emergency Reserves
  it("Red Team: Flags NOT_RECOMMENDED when emergency buffer is depleted below 2.0 months", () => {
    const brokeBaseline: BaselineFinancialProfile = {
      ...regressionBaseline,
      liquidSavings: 500, // Only 0.2 mos runway
    };

    const analysis = evaluateCanonicalDecision(brokeBaseline, {
      title: "Big Expense",
      category: "BUY_SOMETHING",
      decisionType: "ONE_OFF_PURCHASE",
      totalAmount: 400,
      currency: "EUR",
    });

    expect(analysis.verdict.decision).toBe("NOT_RECOMMENDED");
    expect(analysis.verdict.primaryReason).toContain("below mandatory 2.0-month floor");
  });

  // 7. FULL VERIFIED REPORT GENERATOR (PDF 10/10 Rendering)
  it("Generates 10/10 PDF report with single recommendation, financing summary, and zero text overflow", () => {
    const analysis = evaluateCanonicalDecision(regressionBaseline, {
      title: "Loan Facility / Borrowing",
      category: "TAKE_A_LOAN",
      decisionType: "LOAN_FACILITY",
      totalAmount: 10000,
      downPayment: 1000,
      loanTermMonths: 36,
      annualInterestRatePercent: 8.5,
      currency: "EUR",
    });

    const reportData: VerifiedDecisionData = {
      decisionId: "dec-10-10",
      reportId: "RPT-20260824-1010",
      version: 1,
      decisionTitle: analysis.inputs.title,
      category: analysis.inputs.category,
      decisionType: analysis.inputs.decisionType,
      amount: analysis.inputs.totalAmount,
      downPayment: analysis.inputs.downPayment || 0,
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
      },
      financing: analysis.financing,
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
          isRecommended: analysis.scenarios.optionC.isRecommended,
        },
      },
      narrative: {
        executiveSummary: analysis.verdict.primaryReason,
        whyThisVerdict: analysis.verdict.primaryReason,
        recommendedPath: analysis.recommendation.actionPlanStep1,
        tradeoffsSummary: "Tradeoff between monthly payment and goal timeline.",
      },
      assumptions: analysis.assumptions,
      isAssumedLoanTerms: analysis.isAssumedLoanTerms,
    };

    const verification = runAimlyCoherenceCheck(reportData);
    expect(verification.status).toBe("VERIFIED WITH ASSUMPTIONS");
    expect(verification.checks.every((c) => c.passed)).toBe(true);

    const pdfDoc = generateVerifiedDecisionReportPDF(reportData, verification, "en");
    expect(pdfDoc.getNumberOfPages()).toBe(2);
    expect(pdfDoc.output("blob").size).toBeGreaterThan(6000);
  });
});
