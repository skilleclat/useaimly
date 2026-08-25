import { describe, it, expect } from "vitest";
import { evaluateFinancialContext } from "../../lib/decision-engine/financial-context-engine";
import {
  createBlankDecisionIntelligenceObject,
  createUserEstimate,
  createUnknown,
} from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 5: Step 3 Financial Context Engine", () => {
  it("yields RESILIENT profile for a $2,000 purchase with ample $10k reserves", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 2000;
    decisionObj.context.liquid_savings.value = 10000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2000;

    const evaluation = evaluateFinancialContext(decisionObj);
    expect(evaluation.confidence.level).toBe("HIGH");
    expect(evaluation.metrics.savingsExposurePercent).toBe(20);
    expect(evaluation.metrics.savingsExposureRating).toBe("MODERATE");
    expect(evaluation.metrics.postDecisionRunwayMonths).toBe(4);
    expect(evaluation.metrics.canAbsorbShock3000).toBe(true);
    expect(evaluation.metrics.contextRiskProfile).toBe("RESILIENT");
  });

  it("yields DANGEROUS profile for the EXACT SAME $2,000 purchase with only $1,500 reserves", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 2000;
    decisionObj.context.liquid_savings.value = 1500;
    decisionObj.context.monthly_income.value = 2500;
    decisionObj.context.essential_expenses.value = 2000;

    const evaluation = evaluateFinancialContext(decisionObj);
    expect(evaluation.metrics.savingsExposureRating).toBe("INSOLVENT");
    expect(evaluation.metrics.postDecisionRunwayMonths).toBe(0);
    expect(evaluation.metrics.emergencyCapacityStatus).toBe("COMPROMISED");
    expect(evaluation.metrics.contextRiskProfile).toBe("DANGEROUS");
    expect(evaluation.metrics.contextualVerdictAdviceEn).toContain("survival thresholds");
  });

  it("calculates multi-dimensional Context Confidence (HIGH, MEDIUM, LOW)", () => {
    // High confidence
    const highObj = createBlankDecisionIntelligenceObject();
    const highEval = evaluateFinancialContext(highObj);
    expect(highEval.confidence.level).toBe("HIGH");

    // Medium confidence with estimates
    const medObj = createBlankDecisionIntelligenceObject();
    medObj.context.liquid_savings = createUserEstimate(4000, 0.6);
    medObj.context.monthly_income = createUserEstimate(3000, 0.5);
    const medEval = evaluateFinancialContext(medObj);
    expect(medEval.confidence.level).toBe("MEDIUM");

    // Low confidence with missing critical data
    const lowObj = createBlankDecisionIntelligenceObject();
    lowObj.context.liquid_savings = createUnknown(0);
    const lowEval = evaluateFinancialContext(lowObj);
    expect(lowEval.confidence.level).toBe("LOW");
    expect(lowEval.confidence.missingVariables).toContain("Liquid Savings Balance");
  });

  it("evaluates debt pressure and monthly cash flow pressure", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 2000;
    decisionObj.context.monthly_debt_payments.value = 1400; // 35% DTI
    decisionObj.economics.recurring_cost.value = 300;

    const evaluation = evaluateFinancialContext(decisionObj);
    expect(evaluation.metrics.postDecisionDebtToIncomeRatio).toBeGreaterThan(40);
    expect(evaluation.metrics.debtStressLevel).toBe("ELEVATED");
    expect(evaluation.metrics.postDecisionFreeCashFlow).toBe(300);
    expect(evaluation.metrics.monthlyCashFlowPressureRating).toBe("SEVERE");
  });
});
