import { describe, it, expect } from "vitest";
import { runStep6VerificationGate } from "../../lib/decision-engine/step6-verification-engine";
import { runStep5MasterAnalysis } from "../../lib/decision-engine/step5-analysis-orchestrator";
import { synthesizeDecisionVerdict } from "../../lib/decision-engine/decision-verdict-system";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 15: Step 6 Master Verification Engine", () => {
  it("computes 4 separate unmerged indicators and grants release clearance for resilient decisions", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "New CAD Laptop",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 2500;
    decisionObj.context.liquid_savings.value = 14000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2200;
    decisionObj.context.monthly_income.source = "VERIFIED_FACT";
    decisionObj.context.liquid_savings.source = "VERIFIED_FACT";
    decisionObj.context.essential_expenses.source = "VERIFIED_FACT";

    const analysis = runStep5MasterAnalysis(decisionObj);
    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    const verification = runStep6VerificationGate(decisionObj, analysis, verdict);

    if (!verification.allChecksPassed) {
      console.error("FAILED CHECKS:", verification.checks.filter((c) => !c.passed));
    }

    expect(verification.allChecksPassed).toBe(true);
    expect(verification.canReleaseFinalReport).toBe(true);

    // Verify 4 separate indicators
    const { fourIndicators } = verification;
    expect(fourIndicators.dataCompleteness.score).toBe(100);
    expect(fourIndicators.dataCompleteness.level).toBe("HIGH");

    expect(fourIndicators.outcomeUncertainty.score).toBeDefined();
    expect(fourIndicators.outcomeUncertainty.level).toBeDefined();

    expect(fourIndicators.decisionRobustness.score).toBeGreaterThan(60);
    expect(fourIndicators.decisionRobustness.level).toBe("RESILIENT");

    expect(fourIndicators.aimlyConfidence.score).toBeGreaterThanOrEqual(80);
    expect(fourIndicators.aimlyConfidence.level).toBe("HIGH");
  });

  it("identifies data completeness gaps and downgrades confidence to provisional on missing income", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 4000;
    decisionObj.context.monthly_income.source = "UNKNOWN";
    decisionObj.context.liquid_savings.source = "UNKNOWN";

    const analysis = runStep5MasterAnalysis(decisionObj);
    const verdict = synthesizeDecisionVerdict(decisionObj, analysis);
    const verification = runStep6VerificationGate(decisionObj, analysis, verdict);

    expect(verification.canReleaseFinalReport).toBe(false); // Blocks report release on insufficient evidence
    expect(verification.fourIndicators.dataCompleteness.score).toBeLessThan(50);
    expect(verification.fourIndicators.dataCompleteness.level).toBe("LOW");
    expect(verification.fourIndicators.dataCompleteness.missingCriticalFields).toContain("Monthly Net Income");
    expect(verification.fourIndicators.aimlyConfidence.level).toBe("PROVISIONAL");
  });
});
