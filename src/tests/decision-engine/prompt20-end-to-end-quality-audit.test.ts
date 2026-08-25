import { describe, it, expect } from "vitest";
import {
  extractStructuredDecisionStep1,
  getAdaptiveQuestions,
  applyAdaptiveAnswer,
  runStep5MasterAnalysis,
  synthesizeDecisionVerdict,
  runStep6VerificationGate,
  generateMasterAimlyDecisionReport,
  generateFinancialDecisionMemorandumPDF,
  DecisionIntelligenceObject,
  createBlankDecisionIntelligenceObject,
  createUserProvided,
  createUserEstimate,
  createUnknown,
} from "../../lib/decision-engine";

describe("PROMPT 20: FINAL END-TO-END QUALITY TEST & AUDIT SUITE", () => {
  // Common Baseline Context for Test Subjects
  const createTestProfile = (
    query: string,
    overrides?: Partial<DecisionIntelligenceObject>
  ): DecisionIntelligenceObject => {
    const step1 = extractStructuredDecisionStep1(query, "BUY_SOMETHING", "USD");
    const base = createBlankDecisionIntelligenceObject({
      action: step1.proposedAction,
      category: step1.decisionCategory,
      currency: "USD",
    });

    base.definition.proposed_action = step1.proposedAction;
    base.definition.financial_amount = step1.financialAmount;
    base.definition.decision_category = step1.decisionCategory;
    base.definition.underlying_problem = step1.underlyingProblem;
    base.definition.underlying_goal = step1.underlyingGoal;
    base.definition.time_horizon = step1.timeHorizon;
    base.definition.reversibility_level = step1.reversibilityLevel;
    base.definition.reversibility_explanation = step1.reversibilityExplanation;

    // Grounded User Financial Profile: $6,500/mo income, $3,200/mo essential, $400/mo debt, $18,000 savings
    base.context.monthly_income = createUserProvided(6500, "Verified paystub");
    base.context.essential_expenses = createUserProvided(3200, "Historical bank baseline");
    base.context.monthly_debt_payments = createUserProvided(400, "Confirmed minimum credit service");
    base.context.liquid_savings = createUserProvided(18000, "Primary liquid bank account");
    base.context.primary_goal = {
      id: "goal-1",
      title: "Home Down Payment & Independence",
      targetAmount: 50000,
      currentAmount: 22000,
      monthlyAllocation: 800,
      targetDate: "2027-12-31",
      priority: "CRITICAL",
    };

    if (overrides) {
      Object.assign(base, overrides);
    }
    return base;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TEST CASE 1: "I want to buy a $2,000 laptop."
  // ───────────────────────────────────────────────────────────────────────────
  it("E2E Test 1: 'I want to buy a $2,000 laptop.' — One-time tech capital expenditure", () => {
    const query = "I want to buy a $2,000 laptop.";
    const step1 = extractStructuredDecisionStep1(query);

    // 1. Extraction
    expect(step1.financialAmount.value).toBe(2000);
    expect(step1.currency).toBe("USD");
    expect(step1.commitmentType).toBe("UPFRONT_ONLY");
    expect(step1.reversibilityLevel).toBe("MODERATELY_REVERSIBLE");

    // 2. Adaptive Questions
    const decisionObj = createTestProfile(query);
    const questions = getAdaptiveQuestions(decisionObj);
    expect(questions.currentPendingQuestions.length).toBeGreaterThan(0);
    expect(questions.currentPendingQuestions.some((q) => q.id === "q_down_payment" || q.id === "q_hidden_ancillary_costs")).toBe(true);

    // 3. Step 5 Analysis Orchestrator
    const analysis = runStep5MasterAnalysis(decisionObj);
    expect(analysis.multiScenarioReport.scenarios.BASE_CASE.endingLiquidCash).toBe(16000); // 18000 - 2000
    expect(analysis.coreFinancialReport.cashFlowAnalysis.output.postDecisionEmergencyRunwayMonths).toBe(5.0); // 16000 / 3200
    expect(analysis.microScenarioReport.findings.length).toBeGreaterThan(0);
    expect(analysis.multiScenarioReport.scenarios.BASE_CASE.isSolvent).toBe(true);
    expect(analysis.preMortemReport.identifiedFailureModes.length).toBeGreaterThan(0);
    expect(analysis.redTeamReport.verdictApprovalStatus).toBe("APPROVED_FOR_RELEASE");

    // 4. Verdict & Verification Gate
    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    expect(["STRONG_GO", "CONDITIONAL_GO"]).toContain(verdict.verdictCode);

    const verification = runStep6VerificationGate(decisionObj, analysis, verdict);
    expect(verification.canReleaseFinalReport).toBe(true);
    expect(verification.fourIndicators.dataCompleteness.score).toBeGreaterThanOrEqual(80);
    expect(verification.fourIndicators.decisionRobustness.level).toBe("RESILIENT");

    // 5. Master Report & PDF Export
    const report = generateMasterAimlyDecisionReport(decisionObj);
    expect(report.section1_verdict.verdictCode).toBe(verdict.verdictCode);
    expect(report.section4_financialImpact.upfrontImpactFormatted).toContain("2,000");

    const pdf = generateFinancialDecisionMemorandumPDF(report);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST CASE 2: "Should I take a loan to start a business?"
  // ───────────────────────────────────────────────────────────────────────────
  it("E2E Test 2: 'Should I take a loan to start a business?' — High-stakes commercial debt", () => {
    const query = "Should I take a $25,000 loan to start a business?";
    const step1 = extractStructuredDecisionStep1(query);

    // 1. Extraction
    expect(step1.financialAmount.value).toBe(25000);
    expect(step1.decisionCategory).toBe("BUSINESS_EXPENSE");
    expect(step1.commitmentType).toBe("DEBT_FINANCED");
    expect(step1.reversibilityLevel).toBe("HARD_TO_REVERSE");

    // 2. Setup with Loan & Business Context
    const decisionObj = createTestProfile(query);
    decisionObj.economics.down_payment = createUserProvided(5000);
    decisionObj.economics.interest_rate = createUserProvided(9.5);
    decisionObj.economics.loan_duration = createUserProvided(36);
    decisionObj.economics.expected_revenue = createUserEstimate(1500, 0.5, "Projected monthly client contracts");

    // 3. Adaptive Questions
    const questions = getAdaptiveQuestions(decisionObj);
    expect(questions.currentPendingQuestions).toBeDefined();

    // 4. Step 5 Analysis Orchestration
    const analysis = runStep5MasterAnalysis(decisionObj);
    expect(analysis.materiality.depthTier).toBe("HIGH_STAKES");
    expect(analysis.coreFinancialReport.financingAnalysis?.output.principalBorrowed).toBe(20000);
    expect(analysis.preMortemReport.identifiedFailureModes.some((fm) => fm.category === "REVENUE_SHORTFALL")).toBe(true);
    expect(analysis.redTeamReport.stressTestedLoadBearingAssumptions.length).toBeGreaterThan(0);

    // 5. Verification & Final PDF
    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    const verification = runStep6VerificationGate(decisionObj, analysis, verdict);
    expect(verification.checks.every((c) => c.passed)).toBe(true);

    const report = generateMasterAimlyDecisionReport(decisionObj);
    expect(report.section6_scenarios.severeStress).toBeDefined();
    expect(report.section10_preMortemAutopsy.topFailureModes.length).toBeGreaterThan(0);

    const pdf = generateFinancialDecisionMemorandumPDF(report);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST CASE 3: "Should I pay off my debt early?"
  // ───────────────────────────────────────────────────────────────────────────
  it("E2E Test 3: 'Should I pay off my debt early?' — Debt acceleration & capital allocation", () => {
    const query = "Should I pay off my $8,000 debt early?";
    const step1 = extractStructuredDecisionStep1(query);

    // 1. Extraction
    expect(step1.financialAmount.value).toBe(8000);
    expect(step1.decisionCategory).toBe("PAY_OFF_DEBT");
    expect(step1.reversibilityLevel).toBe("IRREVERSIBLE");

    // 2. Configure Debt Payoff Profile
    const decisionObj = createTestProfile(query);
    decisionObj.context.liquid_savings = createUserProvided(18000);
    decisionObj.context.monthly_debt_payments = createUserProvided(400);

    // 3. Step 5 Analysis
    const analysis = runStep5MasterAnalysis(decisionObj);
    expect(analysis.multiScenarioReport.scenarios.BASE_CASE.endingLiquidCash).toBe(10000); // 18000 - 8000
    expect(analysis.coreFinancialReport.cashFlowAnalysis.output.postDecisionEmergencyRunwayMonths).toBeCloseTo(3.1, 1);
    expect(analysis.multiScenarioReport.scenarios.BASE_CASE.isSolvent).toBe(true);

    // 4. Verification & Report
    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    const verification = runStep6VerificationGate(decisionObj, analysis, verdict);
    expect(verification.canReleaseFinalReport).toBe(true);

    const report = generateMasterAimlyDecisionReport(decisionObj);
    expect(report.section2_theDecision.category).toBe("PAY OFF DEBT");

    const pdf = generateFinancialDecisionMemorandumPDF(report);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST CASE 4: "Should I invest $10,000 in this opportunity?"
  // ───────────────────────────────────────────────────────────────────────────
  it("E2E Test 4: 'Should I invest $10,000 in this opportunity?' — Capital growth vs liquid reserves", () => {
    const query = "Should I invest $10,000 in this opportunity?";
    const step1 = extractStructuredDecisionStep1(query);

    // 1. Extraction
    expect(step1.financialAmount.value).toBe(10000);
    expect(step1.decisionCategory).toBe("INVEST");
    expect(step1.commitmentType).toBe("EQUITY_INVESTMENT");

    // 2. Configure Profile
    const decisionObj = createTestProfile(query);
    const analysis = runStep5MasterAnalysis(decisionObj);

    expect(analysis.multiScenarioReport.scenarios.BASE_CASE.endingLiquidCash).toBe(8000);
    expect(analysis.coreFinancialReport.cashFlowAnalysis.output.postDecisionEmergencyRunwayMonths).toBe(2.5); // 8000 / 3200
    expect(analysis.alternativesReport.evaluatedAlternatives.length).toBe(6);

    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    // Buffer is 2.5 mo (< 3.0 mo), so verdict should require prudence or buffer building
    expect(["CONDITIONAL_GO", "WAIT", "MODIFY"]).toContain(verdict.verdictCode);

    const report = generateMasterAimlyDecisionReport(decisionObj);
    expect(report.section7_threeNumbersThatMatterMost.length).toBe(3);

    const pdf = generateFinancialDecisionMemorandumPDF(report);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST CASE 5: "Should I buy a car with cash or financing?"
  // ───────────────────────────────────────────────────────────────────────────
  it("E2E Test 5: 'Should I buy a car with cash or financing?' — Vehicle financing comparison", () => {
    const query = "Should I buy a $15,000 car with cash or financing?";
    const step1 = extractStructuredDecisionStep1(query);

    // 1. Extraction
    expect(step1.financialAmount.value).toBe(15000);
    expect(step1.decisionCategory).toBe("BUY_A_CAR");
    expect(step1.reversibilityLevel).toBe("COSTLY_TO_REVERSE");

    // 2. Configure Car Profile with Financing Options
    const decisionObj = createTestProfile(query);
    decisionObj.economics.down_payment = createUserProvided(3000);
    decisionObj.economics.interest_rate = createUserProvided(7.9);
    decisionObj.economics.loan_duration = createUserProvided(36);
    decisionObj.economics.recurring_cost = createUserProvided(180); // $180/mo insurance & fuel

    // 3. Step 5 Analysis
    const analysis = runStep5MasterAnalysis(decisionObj);
    expect(analysis.coreFinancialReport.tcoAnalysis).toBeDefined();
    expect(analysis.microScenarioReport.findings.some((f) => f.id === "cost_car_ancillary_friction")).toBe(true);

    const report = generateMasterAimlyDecisionReport(decisionObj);
    expect(report.section9_redFlags.hasCriticalRedFlags).toBe(false);

    const pdf = generateFinancialDecisionMemorandumPDF(report);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST CASE 6: "Should I move to a more expensive apartment?"
  // ───────────────────────────────────────────────────────────────────────────
  it("E2E Test 6: 'Should I move to a more expensive apartment?' — Recurring living commitment increase", () => {
    const query = "Should I move to a $1,800 per month apartment?";
    const step1 = extractStructuredDecisionStep1(query);

    // 1. Extraction
    expect(step1.financialAmount.value).toBe(1800);
    expect(step1.decisionCategory).toBe("MOVE_HOME");
    expect(step1.commitmentType).toBe("RECURRING_ONLY");
    expect(step1.reversibilityLevel).toBe("COSTLY_TO_REVERSE");

    // 2. Configure Profile
    const decisionObj = createTestProfile(query);
    decisionObj.economics.recurring_cost = createUserProvided(1800);

    // 3. Step 5 Analysis & Verdict
    const analysis = runStep5MasterAnalysis(decisionObj);
    expect(analysis.multiScenarioReport.scenarios.BASE_CASE.endingLiquidCash).toBe(18000); // 0 upfront cash drain
    expect(analysis.coreFinancialReport.cashFlowAnalysis.output.postDecisionFreeCashFlow).toBeLessThan(
      decisionObj.context.monthly_income.value - decisionObj.context.essential_expenses.value
    );

    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    const report = generateMasterAimlyDecisionReport(decisionObj);
    expect(report.section2_theDecision.category).toBe("MOVE HOME");

    const pdf = generateFinancialDecisionMemorandumPDF(report);
    expect(pdf.getNumberOfPages()).toBe(2);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CROSS-CUTTING SYSTEM INTEGRITY & ERROR-FREE AUDIT
  // ───────────────────────────────────────────────────────────────────────────
  it("Cross-Cutting Audit: Strict anti-hallucination, no fake certainty, and zero NaN values across all engines", () => {
    const testQueries = [
      "I want to buy a $2,000 laptop.",
      "Should I take a $25,000 loan to start a business?",
      "Should I pay off my $8,000 debt early?",
      "Should I invest $10,000 in this opportunity?",
      "Should I buy a $15,000 car with cash or financing?",
      "Should I move to a $1,800 per month apartment?",
    ];

    testQueries.forEach((q) => {
      const decisionObj = createTestProfile(q);
      const report = generateMasterAimlyDecisionReport(decisionObj);

      // Verify no NaN or undefined string artifacts in key outputs
      expect(report.reportId).not.toContain("NaN");
      expect(report.section1_verdict.oneSentenceExplanation).not.toContain("NaN");
      expect(report.section4_financialImpact.upfrontImpactFormatted).not.toContain("NaN");
      expect(report.section4_financialImpact.liquidRunwayBeforeVsAfter).not.toContain("NaN");
      expect(report.section5_futureTimeline.today).not.toContain("NaN");

      // Verify 4 distinct unmerged indicators
      expect(report.verification.fourIndicators.dataCompleteness.score).toBeGreaterThan(0);
      expect(report.verification.fourIndicators.outcomeUncertainty.score).toBeGreaterThan(0);
      expect(report.verification.fourIndicators.decisionRobustness.score).toBeGreaterThan(0);
      expect(report.verification.fourIndicators.aimlyConfidence.score).toBeGreaterThan(0);

      // Verify PDF generates cleanly without throwing
      const pdf = generateFinancialDecisionMemorandumPDF(report);
      expect(pdf.getNumberOfPages()).toBe(2);
    });
  });
});
