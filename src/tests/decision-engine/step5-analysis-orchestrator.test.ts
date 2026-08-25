import { describe, it, expect } from "vitest";
import {
  assessDecisionMateriality,
  runStep5MasterAnalysis,
} from "../../lib/decision-engine/step5-analysis-orchestrator";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 13: Step 5 Master Analysis Orchestrator", () => {
  it("classifies minor routine purchases as STANDARD depth", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Ergonomic Mouse",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 120;
    decisionObj.context.liquid_savings.value = 8000;
    decisionObj.context.monthly_income.value = 4000;
    decisionObj.context.essential_expenses.value = 2000;

    const materiality = assessDecisionMateriality(decisionObj);

    expect(materiality.depthTier).toBe("STANDARD");
    expect(materiality.materialityScore).toBeLessThan(35);
  });

  it("classifies debt financing and large outlays as HIGH_STAKES depth", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Vehicle Loan",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 25000;
    decisionObj.economics.down_payment.value = 5000;
    decisionObj.economics.interest_rate.value = 8.5;
    decisionObj.context.liquid_savings.value = 9000;
    decisionObj.context.monthly_income.value = 4000;

    const materiality = assessDecisionMateriality(decisionObj);

    expect(materiality.depthTier).toBe("HIGH_STAKES");
    expect(materiality.rationaleEn).toContain("High-Stakes");
  });

  it("orchestrates all 8 analytical sub-engines into a unified master report", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "MacBook Pro 16",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 2800;
    decisionObj.context.liquid_savings.value = 10000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2200;

    const masterReport = runStep5MasterAnalysis(decisionObj);

    expect(masterReport.materiality).toBeDefined();
    expect(masterReport.coreFinancialReport).toBeDefined();
    expect(masterReport.microScenarioReport).toBeDefined();
    expect(masterReport.multiScenarioReport).toBeDefined();
    expect(masterReport.sensitivityReport).toBeDefined();
    expect(masterReport.alternativesReport).toBeDefined();
    expect(masterReport.preMortemReport).toBeDefined();
    expect(masterReport.redTeamReport).toBeDefined();

    // Verify Red Team verdict gate
    expect(masterReport.redTeamReport.verdictApprovalStatus).toBe("APPROVED_FOR_RELEASE");
    expect(masterReport.analysisExecutionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
