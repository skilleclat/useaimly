import { describe, it, expect } from "vitest";
import { runPreMortemDiagnostic } from "../../lib/decision-engine/pre-mortem-engine";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 11: Pre-Mortem Engine", () => {
  it("generates contextual failure modes with required severity, early warnings, and mitigations", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Gaming & Editing Rig",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 3500;
    decisionObj.context.liquid_savings.value = 5000; // leaves 1500 cash
    decisionObj.context.monthly_income.value = 3500;
    decisionObj.context.essential_expenses.value = 2000;

    const report = runPreMortemDiagnostic(decisionObj);

    expect(report.identifiedFailureModes.length).toBeGreaterThan(0);
    expect(report.highestRiskFailureMode).toBeDefined();

    // Verify fields on each failure mode
    report.identifiedFailureModes.forEach((fm) => {
      expect(fm.failureDescriptionEn).toBeDefined();
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(fm.likelihood);
      expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(fm.financialImpact);
      expect(fm.earlyWarningSignalEn).toBeDefined();
      expect(fm.preventativeMitigationEn).toBeDefined();
    });

    // Check checklist
    expect(report.preventativeChecklistEn.length).toBeGreaterThan(0);
  });

  it("identifies commercial revenue shortfall as a high-impact failure mode for business expenses", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "New Embroidery Machine",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 8000;
    decisionObj.economics.expected_revenue.value = 1500;
    decisionObj.context.liquid_savings.value = 14000;
    decisionObj.context.monthly_income.value = 4500;

    const report = runPreMortemDiagnostic(decisionObj);
    const revenueFail = report.identifiedFailureModes.find((fm) => fm.category === "REVENUE_SHORTFALL");

    expect(revenueFail).toBeDefined();
    expect(revenueFail?.earlyWarningSignalEn).toContain("Month 3");
    expect(revenueFail?.preventativeMitigationEn).toContain("client commitments");
  });

  it("identifies financing squeeze failure mode for high interest borrowing", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Personal credit line for motorcycle",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 6000;
    decisionObj.economics.down_payment.value = 1000;
    decisionObj.economics.interest_rate.value = 14.5; // High APR
    decisionObj.context.liquid_savings.value = 4000;
    decisionObj.context.monthly_income.value = 2500;
    decisionObj.context.essential_expenses.value = 1800;

    const report = runPreMortemDiagnostic(decisionObj);
    const financeFail = report.identifiedFailureModes.find((fm) => fm.category === "FINANCING_TRAP");

    expect(financeFail).toBeDefined();
    expect(financeFail?.likelihood).toBe("HIGH");
    expect(financeFail?.preventativeMitigationEn).toContain("fixed APR");
  });
});
