import { describe, it, expect } from "vitest";
import { synthesizeDecisionVerdict } from "../../lib/decision-engine/decision-verdict-system";
import { runStep5MasterAnalysis } from "../../lib/decision-engine/step5-analysis-orchestrator";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 14: Canonical Decision Verdict System", () => {
  it("synthesizes STRONG_GO with all 4 required pillars when finances are resilient", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "New Laptop",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 2000;
    decisionObj.context.liquid_savings.value = 15000; // leaves 13k (~6.5 mo runway)
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2000;
    decisionObj.context.monthly_income.source = "VERIFIED_FACT";
    decisionObj.context.liquid_savings.source = "VERIFIED_FACT";

    const masterAnalysis = runStep5MasterAnalysis(decisionObj);
    const verdict = synthesizeDecisionVerdict(decisionObj, masterAnalysis);

    expect(verdict.verdictCode).toBe("STRONG_GO");
    expect(verdict.why.primaryReasonsEn.length).toBeGreaterThan(0);
    expect(verdict.biggestRisk.titleEn).toBeDefined();
    expect(verdict.keyCondition.actionableRequirementEn).toBeDefined();
    expect(verdict.whatWouldChangeTheAnswer.costThresholdFlipEn).toContain("$");
    expect(verdict.whatWouldChangeTheAnswer.incomeThresholdFlipEn).toContain("$");
    expect(verdict.isEvidenceSufficient).toBe(true);
  });

  it("synthesizes NO_GO when capital commitment completely depletes emergency buffer", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 8000;
    decisionObj.context.liquid_savings.value = 8500; // leaves only $500 (< 0.3 mo runway)
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 2000;

    const masterAnalysis = runStep5MasterAnalysis(decisionObj);
    const verdict = synthesizeDecisionVerdict(decisionObj, masterAnalysis);

    expect(verdict.verdictCode).toBe("NO_GO");
    expect(verdict.biggestRisk.severity).toBe("CRITICAL");
    expect(verdict.keyCondition.titleEn).toContain("Capital");
  });

  it("synthesizes INSUFFICIENT_EVIDENCE when essential baseline data is missing", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      action: "Real Estate Down Payment",
    });
    decisionObj.definition.financial_amount.value = 50000;
    decisionObj.context.monthly_income.source = "UNKNOWN";
    decisionObj.context.liquid_savings.source = "UNKNOWN";

    const masterAnalysis = runStep5MasterAnalysis(decisionObj);
    const verdict = synthesizeDecisionVerdict(decisionObj, masterAnalysis);

    expect(verdict.verdictCode).toBe("INSUFFICIENT_EVIDENCE");
    expect(verdict.isEvidenceSufficient).toBe(false);
    expect(verdict.why.primaryReasonsEn[0]).toContain("not been declared");
  });

  it("synthesizes MODIFY when high-interest debt terms are detected", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Used car finance",
    });
    decisionObj.definition.financial_amount.value = 10000;
    decisionObj.economics.down_payment.value = 2000;
    decisionObj.economics.interest_rate.value = 15.5; // High APR
    decisionObj.context.liquid_savings.value = 8000;
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 2000;

    const masterAnalysis = runStep5MasterAnalysis(decisionObj);
    const verdict = synthesizeDecisionVerdict(decisionObj, masterAnalysis);

    expect(verdict.verdictCode).toBe("MODIFY");
    expect(verdict.verdictLabelEn).toContain("MODIFY");
    expect(verdict.keyCondition.actionableRequirementEn).toContain("Refinance");
  });
});
