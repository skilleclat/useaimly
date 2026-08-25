import { describe, it, expect } from "vitest";
import { runAimlyRedTeamAudit } from "../../lib/decision-engine/aimly-red-team";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 12: Aimly Red Team System", () => {
  it("rejects verdict release with FATAL_FLAW when liquidity is completely exhausted", () => {
    const decisionObj = createBlankDecisionIntelligenceObject();
    decisionObj.definition.financial_amount.value = 5000;
    decisionObj.context.liquid_savings.value = 5000; // leaves 0 cash
    decisionObj.context.essential_expenses.value = 2500;

    const audit = runAimlyRedTeamAudit(decisionObj);

    expect(audit.verdictApprovalStatus).toBe("REJECTED_REQUIRES_RECALCULATION");
    expect(audit.fatalFlawsCount).toBeGreaterThan(0);
    const fatal = audit.objections.find((o) => o.severity === "FATAL_FLAW");
    expect(fatal).toBeDefined();
    expect(fatal?.blocksFinalVerdict).toBe(true);
    expect(fatal?.loadBearingAssumption).toBeDefined();
    expect(fatal?.invalidatingCondition).toBeDefined();
  });

  it("raises MATERIAL_CHALLENGE when unverified revenue forecast carries the recommendation", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "New CNC Router",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 7000;
    decisionObj.economics.expected_revenue.value = 1500;
    decisionObj.economics.expected_revenue.source = "USER_ESTIMATE"; // Unverified estimate
    decisionObj.context.liquid_savings.value = 14000;
    decisionObj.context.monthly_income.value = 4500;
    decisionObj.context.essential_expenses.value = 2000;

    const audit = runAimlyRedTeamAudit(decisionObj);

    expect(audit.verdictApprovalStatus).toBe("CONDITIONAL_APPROVAL_WITH_WARNINGS");
    const revenueChallenge = audit.objections.find((o) => o.id === "rt_unverified_revenue");
    expect(revenueChallenge).toBeDefined();
    expect(revenueChallenge?.severity).toBe("MATERIAL_CHALLENGE");
    expect(revenueChallenge?.category).toBe("HIDDEN_ASSUMPTION_OVERLOAD");
  });

  it("approves release without fatal flaws for well-buffered, verified purchases", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Ergonomic Desk & Chair",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 800;
    decisionObj.context.liquid_savings.value = 15000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2000;
    decisionObj.context.monthly_income.source = "VERIFIED_FACT";

    const audit = runAimlyRedTeamAudit(decisionObj);

    expect(audit.verdictApprovalStatus).toBe("APPROVED_FOR_RELEASE");
    expect(audit.fatalFlawsCount).toBe(0);
    expect(audit.analystSummaryEn).toContain("PASSED");
  });
});
