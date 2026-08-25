import { describe, it, expect } from "vitest";
import { runSensitivityAnalysis } from "../../lib/decision-engine/sensitivity-analysis-engine";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 9: Sensitivity Analysis Engine", () => {
  it("identifies the Top 3 variables that matter most for a standard equipment purchase", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Studio Camera and Lighting",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 3500;
    decisionObj.context.liquid_savings.value = 7000;
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 2200;

    const report = runSensitivityAnalysis(decisionObj);

    expect(report.topThreeVariables).toHaveLength(3);
    expect(report.singleMostDangerousVariable).toBeDefined();
    expect(report.singleMostDangerousVariable.nameEn).toBeDefined();
    expect(report.singleMostDangerousVariable.tippingPointEn).toBeDefined();

    // Verify all 4 required dimensions are present on each of the top 3 variables
    report.topThreeVariables.forEach((v) => {
      expect(v.currentAssumption.formatted).toBeDefined();
      expect(v.ifImproves.testedShift).toBeDefined();
      expect(v.ifImproves.resultingOutcomeEn).toBeDefined();
      expect(v.ifWorsens.testedShift).toBeDefined();
      expect(v.ifWorsens.resultingOutcomeEn).toBeDefined();
      expect(v.tippingPointThreshold.thresholdValueFormatted).toBeDefined();
      expect(v.tippingPointThreshold.descriptionEn).toBeDefined();
    });
  });

  it("identifies Interest Rate and Income as top sensitivities for a financed vehicle purchase", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_A_CAR",
      action: "Family Van Financing",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 24000;
    decisionObj.economics.down_payment.value = 4000;
    decisionObj.economics.interest_rate.value = 7.5;
    decisionObj.economics.loan_duration.value = 48;
    decisionObj.context.liquid_savings.value = 12000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2500;

    const report = runSensitivityAnalysis(decisionObj);
    const variableNames = report.topThreeVariables.map((v) => v.variableNameEn);

    expect(variableNames.some((name) => name.toLowerCase().includes("income"))).toBe(true);
    expect(variableNames.some((name) => name.toLowerCase().includes("interest") || name.toLowerCase().includes("outlay"))).toBe(true);
  });

  it("identifies Expected Commercial Revenue as a top sensitivity for business investments", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "Commercial Espresso Machine for Coffee Shop",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 6000;
    decisionObj.economics.expected_revenue.value = 1200; // $1200/mo
    decisionObj.context.liquid_savings.value = 9000;
    decisionObj.context.monthly_income.value = 4000;

    const report = runSensitivityAnalysis(decisionObj);
    const variableNames = report.topThreeVariables.map((v) => v.variableNameEn);

    expect(variableNames.some((name) => name.toLowerCase().includes("revenue") || name.toLowerCase().includes("billing"))).toBe(true);
  });
});
