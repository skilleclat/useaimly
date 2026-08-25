import { describe, it, expect } from "vitest";
import { runCoreFinancialAnalysis } from "../../lib/decision-engine/core-financial-analyzer";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 7: Core Financial Analysis Engine", () => {
  it("runs TCO, Cash Flow, Depreciation, and Opportunity Cost on a standard laptop purchase", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "MacBook Pro 16",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 2500;
    decisionObj.context.liquid_savings.value = 8000;
    decisionObj.context.monthly_income.value = 4500;
    decisionObj.context.essential_expenses.value = 2200;

    const report = runCoreFinancialAnalysis(decisionObj);

    expect(report.applicableAnalysesSummary).toContain("TOTAL_COST_OF_OWNERSHIP");
    expect(report.applicableAnalysesSummary).toContain("CASH_FLOW_DYNAMICS");
    expect(report.applicableAnalysesSummary).toContain("DEPRECIATION_AND_RESALE");
    expect(report.applicableAnalysesSummary).toContain("OPPORTUNITY_COST_ANALYSIS");
    // Not a loan, not a revenue project
    expect(report.financingAnalysis).toBeUndefined();
    expect(report.breakEvenAnalysis).toBeUndefined();

    // TCO audit block
    expect(report.tcoAnalysis?.output.nominalPurchasePrice).toBe(2500);
    expect(report.tcoAnalysis?.output.trueLifetimeNetCost).toBeGreaterThan(0);
    expect(report.tcoAnalysis?.inputs.nominalPurchasePrice.unit).toBe("CURRENCY");

    // Depreciation
    expect(report.depreciationAnalysis?.output.depreciationModel).toBe("TECH_ELECTRONICS_DECAY");
    expect(report.depreciationAnalysis?.output.year1ResaleValue).toBe(1750); // 70% of 2500

    // Opportunity Cost ranges
    expect(report.opportunityCostAnalysis.output.compoundInvestmentForgone10Y.at7PercentBaseline).toBeGreaterThan(2000);
  });

  it("calculates Financing Amortization when loan parameters are active", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Car Loan",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 20000;
    decisionObj.economics.down_payment.value = 4000; // Borrowing 16,000
    decisionObj.economics.interest_rate.value = 6.0;
    decisionObj.economics.loan_duration.value = 36;

    const report = runCoreFinancialAnalysis(decisionObj);

    expect(report.financingAnalysis).toBeDefined();
    expect(report.financingAnalysis?.output.principalBorrowed).toBe(16000);
    expect(report.financingAnalysis?.output.monthlyPayment).toBe(487);
    expect(report.financingAnalysis?.output.totalInterestPaid).toBe(1523);
    expect(report.financingAnalysis?.inputs.principalBorrowed.value).toBe(16000);
    expect(report.financingAnalysis?.assumptions.length).toBeGreaterThan(0);
  });

  it("calculates Break-Even & Payback Period strictly from Net Profit, not Gross Revenue", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "New CAD Workstation for Client Projects",
      currency: "USD",
    });
    decisionObj.definition.financial_amount.value = 3000;
    decisionObj.economics.expected_revenue.value = 800; // $800/mo gross revenue
    decisionObj.economics.recurring_cost.value = 200;   // $200/mo software subscription upkeep

    const report = runCoreFinancialAnalysis(decisionObj);

    expect(report.breakEvenAnalysis).toBeDefined();
    expect(report.breakEvenAnalysis?.output.netMonthlyOperatingProfit).toBe(600); // 800 - 200
    expect(report.breakEvenAnalysis?.output.paybackPeriodMonths).toBe(5.0); // 3000 / 600
    expect(report.breakEvenAnalysis?.output.annualizedReturnOnInvestmentPercent).toBe(240);
  });
});
