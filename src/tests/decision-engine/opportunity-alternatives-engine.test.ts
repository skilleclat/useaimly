import { describe, it, expect } from "vitest";
import { evaluateOpportunityAlternatives } from "../../lib/decision-engine/opportunity-alternatives-engine";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 10: Opportunity Cost and Alternatives Engine", () => {
  it("evaluates 6 plausible strategic paths with complete cost and benefit dimensions", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "New Dev Laptop",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 2500;
    decisionObj.context.liquid_savings.value = 9000;
    decisionObj.context.monthly_income.value = 4500;
    decisionObj.context.essential_expenses.value = 2000;

    const report = evaluateOpportunityAlternatives(decisionObj);

    expect(report.evaluatedAlternatives).toHaveLength(6);
    const codes = report.evaluatedAlternatives.map((a) => a.code);
    expect(codes).toContain("PROCEED_NOW");
    expect(codes).toContain("DELAY_AND_ACCUMULATE");
    expect(codes).toContain("MODIFY_DECISION_STRUCTURE");
    expect(codes).toContain("CHOOSE_CHEAPER_OPTION");
    expect(codes).toContain("DEPLOY_TO_STRONGEST_ALTERNATIVE");
    expect(codes).toContain("DO_NOTHING");

    // Check dimensions
    const proceed = report.evaluatedAlternatives.find((a) => a.code === "PROCEED_NOW");
    expect(proceed?.immediateCost).toBe(2500);
    expect(proceed?.expectedBenefitEn).toBeDefined();
    expect(proceed?.downsideRiskEn).toBeDefined();
    expect(proceed?.flexibilityScore).toBeDefined();
    expect(proceed?.opportunityCostAssessmentEn).toBeDefined();

    // Check optimal structure verdict
    expect(report.isCurrentProposalOptimal).toBe(true);
    expect(report.optimalStructureVerdictEn).toContain("structurally optimal");
  });

  it("recommends Delay & Accumulate when liquid reserves are constrained", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 3000;
    decisionObj.context.liquid_savings.value = 3500; // leaves only 500 cash (< 1 month runway)
    decisionObj.context.essential_expenses.value = 2000;

    const report = evaluateOpportunityAlternatives(decisionObj);

    expect(report.isCurrentProposalOptimal).toBe(false);
    expect(report.recommendedAlternativeCode).not.toBe("PROCEED_NOW");
    expect(report.optimalStructureVerdictEn).toContain("NOT the optimal structure");
  });

  it("calculates the cost of inaction for business equipment", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "High Speed Server",
    });
    decisionObj.definition.financial_amount.value = 4000;
    decisionObj.economics.expected_revenue.value = 1000;

    const report = evaluateOpportunityAlternatives(decisionObj);
    const doNothing = report.evaluatedAlternatives.find((a) => a.code === "DO_NOTHING");

    expect(doNothing?.costOfWaitingOrInactionEn).toContain("Inaction cost");
    expect(doNothing?.costOfWaitingOrInactionEn).toContain("lost");
  });
});
