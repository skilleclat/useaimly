import { describe, it, expect } from "vitest";
import { runMultiScenarioSimulation } from "../../lib/decision-engine/multi-scenario-simulation-engine";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 8: Multi-Scenario Simulation Engine", () => {
  it("generates 5 distinct plausible economic futures with complete pillar accounting", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Workstation PC",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 3000;
    decisionObj.context.liquid_savings.value = 10000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2200;

    const report = runMultiScenarioSimulation(decisionObj);

    expect(report.orderedScenarios).toHaveLength(5);
    expect(report.scenarios.BASE_CASE).toBeDefined();
    expect(report.scenarios.FAVORABLE_CASE).toBeDefined();
    expect(report.scenarios.CAUTIOUS_CASE).toBeDefined();
    expect(report.scenarios.ADVERSE_CASE).toBeDefined();
    expect(report.scenarios.SEVERE_STRESS_CASE).toBeDefined();

    // Verify Favorable Case is clearly labeled as upside/favorable, not expected
    expect(report.scenarios.FAVORABLE_CASE.labelEn).toContain("Favorable Case");
    expect(report.scenarios.BASE_CASE.labelEn).toContain("Base Case");

    // Verify pillars are populated
    const base = report.scenarios.BASE_CASE;
    expect(base.mainAssumptionEn).toBeDefined();
    expect(base.mainRiskEn).toBeDefined();
    expect(base.recoverabilityEn).toBeDefined();
    expect(base.endingEmergencyRunwayMonths).toBeGreaterThan(0);
  });

  it("evaluates Adverse Case with realistic 15% income dip and cost overrun", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 4000;
    decisionObj.context.liquid_savings.value = 6000;
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 2000;

    const report = runMultiScenarioSimulation(decisionObj);
    const adverse = report.scenarios.ADVERSE_CASE;

    expect(adverse.totalCostOutcome).toBeGreaterThan(4000); // 15% overrun
    expect(adverse.endingEmergencyRunwayMonths).toBeLessThan(report.scenarios.BASE_CASE.endingEmergencyRunwayMonths);
    expect(adverse.mainRiskEn).toContain("emergency cushion");
  });

  it("evaluates Severe Stress Case with compounded shocks without ungrounded disaster", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Commercial loan",
    });
    decisionObj.definition.financial_amount.value = 15000;
    decisionObj.economics.down_payment.value = 3000;
    decisionObj.economics.interest_rate.value = 9.0;
    decisionObj.economics.loan_duration.value = 36;
    decisionObj.context.liquid_savings.value = 8000;
    decisionObj.context.monthly_income.value = 4500;
    decisionObj.context.essential_expenses.value = 2500;

    const report = runMultiScenarioSimulation(decisionObj);
    const stress = report.scenarios.SEVERE_STRESS_CASE;

    expect(stress.totalCostOutcome).toBeGreaterThan(report.scenarios.BASE_CASE.totalCostOutcome);
    expect(stress.recoverabilityEn).toBeDefined();
    expect(stress.recoveryEffortPerMonthRequired).toBeGreaterThan(0);
    expect(report.comparativeSummary.multipleCompoundedShocksSummaryEn).toContain("Severe stress");
  });
});
