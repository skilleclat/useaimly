import { describe, it, expect } from "vitest";
import { generateFinancialDecisionMemorandumPDF } from "../../lib/decision-engine/decision-memorandum-pdf";
import { generateMasterAimlyDecisionReport } from "../../lib/decision-engine/step7-master-decision-report";
import { createBlankDecisionIntelligenceObject } from "../../lib/decision-engine/master-decision-model";

describe("PROMPT 18: Financial Decision Memorandum PDF Generator", () => {
  it("generates a crisp 2-page Financial Decision Memorandum PDF for a standard capital allocation", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "BUY_SOMETHING",
      action: "Apple Studio Display 27",
      currency: "USD",
      locale: "en",
    });
    decisionObj.definition.financial_amount.value = 1600;
    decisionObj.context.liquid_savings.value = 12000;
    decisionObj.context.monthly_income.value = 5000;
    decisionObj.context.essential_expenses.value = 2000;
    decisionObj.context.monthly_income.source = "VERIFIED_FACT";
    decisionObj.context.liquid_savings.source = "VERIFIED_FACT";

    const masterReport = generateMasterAimlyDecisionReport(decisionObj);
    const pdfDoc = generateFinancialDecisionMemorandumPDF(masterReport);

    expect(pdfDoc).toBeDefined();
    expect(pdfDoc.getNumberOfPages()).toBe(2);
  });

  it("generates a high-stakes loan Decision Memorandum PDF with amortization and multi-scenario matrices", () => {
    const decisionObj = createBlankDecisionIntelligenceObject({
      category: "TAKE_A_LOAN",
      action: "Equipment Loan Financing",
      currency: "USD",
      locale: "en",
    });
    decisionObj.definition.financial_amount.value = 18000;
    decisionObj.economics.down_payment.value = 3000;
    decisionObj.economics.interest_rate.value = 7.5;
    decisionObj.economics.loan_duration.value = 36;
    decisionObj.context.liquid_savings.value = 15000;
    decisionObj.context.monthly_income.value = 6000;
    decisionObj.context.essential_expenses.value = 2500;

    const masterReport = generateMasterAimlyDecisionReport(decisionObj);
    const pdfDoc = generateFinancialDecisionMemorandumPDF(masterReport);

    expect(pdfDoc).toBeDefined();
    expect(pdfDoc.getNumberOfPages()).toBe(2);
  });

  it("generates French and Spanish localized PDF Memorandums seamlessly", () => {
    const decisionObjFr = createBlankDecisionIntelligenceObject({
      category: "BUY_A_CAR",
      action: "Véhicule Utilitaire Électrique",
      currency: "EUR",
      locale: "fr",
    });
    decisionObjFr.definition.financial_amount.value = 22000;
    decisionObjFr.context.liquid_savings.value = 30000;
    decisionObjFr.context.monthly_income.value = 5500;
    decisionObjFr.context.essential_expenses.value = 2200;

    const reportFr = generateMasterAimlyDecisionReport(decisionObjFr);
    const pdfFr = generateFinancialDecisionMemorandumPDF(reportFr);

    expect(pdfFr.getNumberOfPages()).toBe(2);

    const decisionObjEs = createBlankDecisionIntelligenceObject({
      category: "BUSINESS_EXPENSE",
      action: "Equipo de Producción Audiovisual",
      currency: "EUR",
      locale: "es",
    });
    decisionObjEs.definition.financial_amount.value = 4500;
    decisionObjEs.context.liquid_savings.value = 14000;
    decisionObjEs.context.monthly_income.value = 4000;
    decisionObjEs.context.essential_expenses.value = 1800;

    const reportEs = generateMasterAimlyDecisionReport(decisionObjEs);
    const pdfEs = generateFinancialDecisionMemorandumPDF(reportEs);

    expect(pdfEs.getNumberOfPages()).toBe(2);
  });
});
