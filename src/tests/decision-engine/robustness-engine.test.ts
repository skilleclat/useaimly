import { describe, it, expect } from "vitest";
import { evaluateDecisionRobustness } from "../../lib/decision-engine/robustness-engine";
import { runStep5MasterAnalysis } from "../../lib/decision-engine/step5-analysis-orchestrator";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 16: Decision Robustness Engine", () => {
  it("classifies well-buffered capital allocations as ROBUST across broad variations", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Ergonomic Monitor & Stand",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 1200;
    decisionObj.context.liquid_savings.value = 15000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2000;

    const analysis = runStep5MasterAnalysis(decisionObj);
    const robustness = evaluateDecisionRobustness(decisionObj, analysis);

    expect(robustness.classification).toBe("ROBUST");
    expect(robustness.robustnessScore).toBeGreaterThanOrEqual(80);
    expect(robustness.corePillars.scenarioPerformance.severeStressSurvival).toBe(true);
    expect(robustness.corePillars.downsideExposure.worstPlausibleLoss).toBeDefined();
    expect(robustness.stressSurvivalMarginEn).toContain("tolerance");
  });

  it("classifies high-exposure or thin-reserve decisions as FRAGILE", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 5000;
    decisionObj.context.liquid_savings.value = 6000; // leaves 1000 cash (< 0.5 mo runway)
    decisionObj.context.monthly_income.value = 3500;
    decisionObj.context.essential_expenses.value = 2500;

    const analysis = runStep5MasterAnalysis(decisionObj);
    const robustness = evaluateDecisionRobustness(decisionObj, analysis);

    expect(robustness.classification).toBe("FRAGILE");
    expect(robustness.robustnessScore).toBeLessThan(50);
    expect(robustness.resilienceNarrativeEn).toContain("vulnerability");
  });

  it("classifies bounded-downside revenue assets as ASYMMETRIC_UPSIDE", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "High Precision 3D Printer for Client Prototyping",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 3000;
    decisionObj.economics.expected_revenue.value = 800; // $9,600/yr on $3,000 cost (> 300% return)
    decisionObj.context.liquid_savings.value = 18000; // 15k cash remaining (> 6 mo runway)
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2200;

    const analysis = runStep5MasterAnalysis(decisionObj);
    const robustness = evaluateDecisionRobustness(decisionObj, analysis);

    expect(robustness.classification).toBe("ASYMMETRIC_UPSIDE");
    expect(robustness.isAsymmetricOpportunity).toBe(true);
    expect(robustness.asymmetryRationaleEn).toContain("Asymmetric Upside");
  });
});
