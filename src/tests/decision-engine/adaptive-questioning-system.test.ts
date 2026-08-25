import { describe, it, expect } from "vitest";
import {
  getAdaptiveQuestions,
  applyAdaptiveAnswer,
} from "../../lib/decision-engine/adaptive-questioning-system";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 3: Step 2 Details — Adaptive Questioning System", () => {
  it("prioritizes high-sensitivity questions based on Materiality × Uncertainty × Sensitivity", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_A_CAR",
      action: "Buy pre-owned car",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 15000;

    const state = getAdaptiveQuestions(decisionObj, {}, [], 3);
    expect(state.currentPendingQuestions.length).toBeGreaterThan(0);
    expect(state.currentPendingQuestions.length).toBeLessThanOrEqual(3);

    // Top questions for vehicle purchase should include down payment or recurring upkeep
    const topIds = state.currentPendingQuestions.map((q) => q.id);
    expect(topIds).toContain("q_down_payment");
    expect(state.remainingUncertaintyScore).toBeGreaterThan(0);
  });

  it("updates the decision object with USER_PROVIDED values on answer", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();

    const updated = applyAdaptiveAnswer(decisionObj, "q_down_payment", {
      value: 1500,
      isEstimate: false,
    });

    expect(updated.economics.down_payment.value).toBe(1500);
    expect(updated.economics.down_payment.classification).toBe("USER_PROVIDED");
    expect(updated.economics.down_payment.isUnknown).toBe(false);
  });

  it("marks variables as UNKNOWN without failing or blocking when user selects I don't know", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();

    const updated = applyAdaptiveAnswer(decisionObj, "q_interest_rate", {
      value: 0,
      isUnknown: true,
    });

    expect(updated.economics.interest_rate.classification).toBe("UNKNOWN");
    expect(updated.economics.interest_rate.isUnknown).toBe(true);
    expect(updated.confidence.audit.unknownCount).toBeGreaterThan(0);
  });

  it("dynamically removes answered or skipped questions from pending queue", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
    });

    const state1 = getAdaptiveQuestions(decisionObj, {}, [], 3);
    const firstQuestionId = state1.currentPendingQuestions[0].id;

    // Answer first question
    const answered = {
      [firstQuestionId]: {
        questionId: firstQuestionId,
        value: 1000,
        isUnknown: false,
        isEstimate: false,
        answeredAt: new Date().toISOString(),
      },
    };

    const state2 = getAdaptiveQuestions(decisionObj, answered, ["q_hidden_ancillary_costs"], 3);
    const newTopIds = state2.currentPendingQuestions.map((q) => q.id);

    expect(newTopIds).not.toContain(firstQuestionId);
    expect(newTopIds).not.toContain("q_hidden_ancillary_costs");
    expect(state2.isSufficientForResponsibleAnalysis).toBe(true);
  });
});
