import { describe, it, expect } from "vitest";
import { generateMasterAimlyDecisionReport } from "../../lib/decision-engine/step7-master-decision-report";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 17: Step 7 Master Aimly Decision Report Generator", () => {
  it("generates an elite 12-section decision document with complete analytical grounding", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Apple MacBook Pro M3 Max",
      currency: "USD",
      locale: "en",
    });
    decisionObj.definition.financial_amount.value = 3200;
    decisionObj.context.liquid_savings.value = 16000;
    decisionObj.context.monthly_income.value = 5500;
    decisionObj.context.essential_expenses.value = 2200;
    decisionObj.context.monthly_income.source = "VERIFIED_FACT";
    decisionObj.context.liquid_savings.source = "VERIFIED_FACT";

    const report = generateMasterAimlyDecisionReport(decisionObj);

    // Section 1: Verdict
    expect(report.section1_verdict.verdictCode).toBe("STRONG_GO");
    expect(report.section1_verdict.oneSentenceExplanation).toBeDefined();
    expect(report.section1_verdict.biggestRisk.title).toBeDefined();
    expect(report.section1_verdict.keyCondition.actionableRequirement).toBeDefined();
    expect(report.section1_verdict.recommendedNextAction).toBeDefined();

    // Section 2: The Decision
    expect(report.section2_theDecision.actionTitle).toBe("Apple MacBook Pro M3 Max");
    expect(report.section2_theDecision.financialCommitmentSummary).toContain("3,200");

    // Section 3: What Aimly Knows
    expect(report.section3_whatAimlyKnows.facts.length).toBeGreaterThan(0);
    expect(report.section3_whatAimlyKnows.epistemicConfidenceScore).toBeGreaterThanOrEqual(80);

    // Section 4: Financial Impact
    expect(report.section4_financialImpact.upfrontImpactFormatted).toContain("3,200");
    expect(report.section4_financialImpact.liquidRunwayBeforeVsAfter).toContain("mo");

    // Section 5: Future Timeline
    expect(report.section5_futureTimeline.today).toContain("Day 0");
    expect(report.section5_futureTimeline.next30To90Days).toBeDefined();
    expect(report.section5_futureTimeline.year1).toBeDefined();
    expect(report.section5_futureTimeline.longTerm).toBeDefined();

    // Section 6: Scenarios
    expect(report.section6_scenarios.base).toBeDefined();
    expect(report.section6_scenarios.favorable).toBeDefined();
    expect(report.section6_scenarios.cautious).toBeDefined();
    expect(report.section6_scenarios.adverse).toBeDefined();
    expect(report.section6_scenarios.severeStress).toBeDefined();

    // Section 7: The 3 Numbers That Matter Most
    expect(report.section7_threeNumbersThatMatterMost).toHaveLength(3);

    // Section 8: What Could Change The Answer?
    expect(report.section8_whatCouldChangeTheAnswer.costThresholdFlip).toContain("$");
    expect(report.section8_whatCouldChangeTheAnswer.incomeThresholdFlip).toContain("$");

    // Section 9: Red Flags
    expect(report.section9_redFlags).toBeDefined();

    // Section 10: Pre-Mortem Autopsy
    expect(report.section10_preMortemAutopsy.topFailureModes.length).toBeGreaterThan(0);

    // Section 11: Better Alternatives
    expect(report.section11_betterAlternatives.topAlternatives.length).toBeGreaterThan(0);

    // Section 12: Action Plan
    expect(report.section12_actionPlan.mandatoryPreCommitmentSteps.length).toBeGreaterThan(0);
  });

  it("generates French-localized 12-section master report seamlessly", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Station de Travail",
      currency: "EUR",
      locale: "fr",
    });
    decisionObj.definition.financial_amount.value = 2400;
    decisionObj.context.liquid_savings.value = 12000;
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 1800;
    decisionObj.context.monthly_income.source = "VERIFIED_FACT";
    decisionObj.context.liquid_savings.source = "VERIFIED_FACT";

    const report = generateMasterAimlyDecisionReport(decisionObj);

    expect(report.currency).toBe("EUR");
    expect(report.locale).toBe("fr");
    expect(report.section1_verdict.verdictLabel).toContain("VALIDATION");
    expect(report.section1_verdict.recommendedNextAction).toContain("budget");
  });
});
