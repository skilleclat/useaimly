import { describe, it, expect } from "vitest";
import { runMicroScenarioScan } from "../../lib/decision-engine/micro-scenario-scan";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 4: Micro-Scenario Detection Engine", () => {
  it("detects CRITICAL liquidity deficit when proposed outlay exceeds liquid cash", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "High-end sound system",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 8000;
    decisionObj.context.liquid_savings.value = 3000; // less than 8000
    decisionObj.context.essential_expenses.value = 1500;

    const result = runMicroScenarioScan(decisionObj);
    expect(result.criticalCount).toBeGreaterThan(0);
    expect(result.highestSeverity).toBe("CRITICAL");

    const cashDeficit = result.findings.find((f) => f.id === "liq_exceeds_available_cash");
    expect(cashDeficit).toBeDefined();
    expect(cashDeficit?.severity).toBe("CRITICAL");
    expect(cashDeficit?.canInformationReduceUncertainty).toBe(true);
  });

  it("detects emergency runway compression under 3 months", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 3000;
    decisionObj.context.liquid_savings.value = 4500;
    decisionObj.context.essential_expenses.value = 2000; // post cash is 1500 < 3*2000 (6000)

    const result = runMicroScenarioScan(decisionObj);
    const runwayBreach = result.findings.find(
      (f) => f.id === "liq_safety_buffer_breach" || f.id === "liq_severe_emergency_depletion"
    );
    expect(runwayBreach).toBeDefined();
  });

  it("scans vehicle ownership friction (insurance and maintenance overhead)", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_A_CAR",
      action: "Used SUV purchase",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 18000;
    decisionObj.context.liquid_savings.value = 25000;
    decisionObj.context.essential_expenses.value = 2000;

    const result = runMicroScenarioScan(decisionObj);
    const carFriction = result.findings.find((f) => f.id === "cost_car_ancillary_friction");
    expect(carFriction).toBeDefined();
    expect(carFriction?.severity).toBe("HIGH");
    expect(carFriction?.estimatedFinancialImpactAmount).toBeGreaterThan(0);
  });

  it("scans compounded interest overhead drag on long-term loans", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Personal bank loan",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 10000;
    decisionObj.economics.interest_rate.value = 14.5;
    decisionObj.economics.loan_duration.value = 48;

    const result = runMicroScenarioScan(decisionObj);
    const loanInterest = result.findings.find((f) => f.id === "cost_financing_interest_drag");
    expect(loanInterest).toBeDefined();
    expect(loanInterest?.estimatedFinancialImpactAmount).toBeGreaterThan(1500);
  });

  it("detects dependency risk when committing to fixed payments with variable income", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
    });
    decisionObj.definition.financial_amount.value = 5000;
    decisionObj.context.income_stability.value = "VARIABLE";
    decisionObj.economics.loan_duration.value = 24;

    const result = runMicroScenarioScan(decisionObj);
    const varIncomeRisk = result.findings.find(
      (f) => f.id === "dep_variable_income_fixed_obligation"
    );
    expect(varIncomeRisk).toBeDefined();
    expect(varIncomeRisk?.severity).toBe("CRITICAL");
  });

  it("detects behavioral urgency pressure when keywords like 'today' or 'limited deal' are present", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      action: "Flash sale laptop deal must buy today urgent",
    });
    decisionObj.definition.financial_amount.value = 1500;

    const result = runMicroScenarioScan(decisionObj);
    const urgency = result.findings.find((f) => f.id === "beh_urgency_pressure_bias");
    expect(urgency).toBeDefined();
    expect(urgency?.category).toBe("BEHAVIORAL_RISKS");
  });

  it("calculates opportunity cost and goal postponement impact", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 4000;
    decisionObj.context.primary_goal = {
      id: "goal-1",
      title: "Home Down Payment",
      targetAmount: 50000,
      currentAmount: 20000,
      targetDate: "2028-12-31",
      monthlyAllocation: 400,
    };

    const result = runMicroScenarioScan(decisionObj);
    const oppCost = result.findings.find((f) => f.id === "opp_primary_goal_postponement");
    expect(oppCost).toBeDefined();
    expect(oppCost?.category).toBe("HIDDEN_OPPORTUNITY_COSTS");
  });
});
