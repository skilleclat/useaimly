import { describe, it, expect } from "vitest";
import { evaluatePreferencesAndTradeOffs } from "../../lib/decision-engine/preference-tradeoff-engine";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 6: Step 4 Preferences & Trade-Offs Engine", () => {
  it("detects conflict between Lowest Monthly Payment and Lowest Total Cost", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.priorities.lowest_monthly_payment = 0.9;
    decisionObj.priorities.lowest_total_cost = 0.85;

    const evalResult = evaluatePreferencesAndTradeOffs(decisionObj);
    expect(evalResult.detectedConflicts.length).toBeGreaterThan(0);

    const costConflict = evalResult.detectedConflicts.find(
      (c) => c.id === "conflict_monthly_vs_total_cost"
    );
    expect(costConflict).toBeDefined();
    expect(costConflict?.realWorldTradeOffEn).toContain("cannot simultaneously minimize monthly cash outflow");
  });

  it("detects conflict between Maximum Growth and Liquidity Preservation", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.priorities.growth = 0.8;
    decisionObj.priorities.liquidity_preservation = 0.8;

    const evalResult = evaluatePreferencesAndTradeOffs(decisionObj);
    const growthConflict = evalResult.detectedConflicts.find(
      (c) => c.id === "conflict_growth_vs_liquidity"
    );
    expect(growthConflict).toBeDefined();
  });

  it("activates SAFETY OVERRIDE when user preference violates Cash Solvency Constraint", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 10000;
    decisionObj.context.liquid_savings.value = 2000; // outlay (10k) > cash (2k)
    decisionObj.priorities.speed = 1.0; // user wants to execute immediately

    const evalResult = evaluatePreferencesAndTradeOffs(decisionObj);
    expect(evalResult.constraintsEvaluation.allPassed).toBe(false);
    expect(evalResult.constraintsEvaluation.safetyOverrideTriggered).toBe(true);
    expect(evalResult.constraintsEvaluation.safetyOverrideNoticeEn).toContain("SAFETY OVERRIDE ACTIVATED");

    // Option A (Cash) should receive severe constraint penalty
    const optionA = evalResult.scenarioWeightScores.find((s) => s.scenarioCode === "OPTION_A");
    expect(optionA?.isViable).toBe(false);
    expect(optionA?.constraintPenalty).toBeGreaterThan(0);
  });

  it("passes all constraints when financial reserves are healthy", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 2000;
    decisionObj.context.liquid_savings.value = 8000;
    decisionObj.context.essential_expenses.value = 1500; // post runway is 6000 / 1500 = 4.0 mo (> 1.0 mo)

    const evalResult = evaluatePreferencesAndTradeOffs(decisionObj);
    expect(evalResult.constraintsEvaluation.allPassed).toBe(true);
    expect(evalResult.constraintsEvaluation.safetyOverrideTriggered).toBe(false);
  });
});
