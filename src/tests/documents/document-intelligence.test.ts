import { describe, it, expect } from "vitest";
import { documentIngestionService } from "@/lib/documents/document-ingestion-service";
import { structuredExtractionService } from "@/lib/documents/structured-extraction-service";
import { documentDecisionCalculator } from "@/lib/finance/calculations/document-decision-calculator";
import { decisionContextBuilder } from "@/lib/documents/decision-context-builder";
import { documentIntelligenceEngine } from "@/lib/ai/document-intelligence-engine";

describe("UseAimly AI Document & Decision Intelligence Engine Suite", () => {
  const sampleVehicleQuote = `
    VEHICLE PURCHASE AND FINANCING QUOTATION
    Vehicle: 2024 Toyota Urban SUV
    Total Price: KES 500,000
    Required Down Payment: KES 100,000
    Principal Financed: KES 400,000
    Monthly Installment: KES 18,500
    Duration: 36 Months
    Annual Interest Rate: 12.5% p.a.
    Prepayment Clause: Early termination incurs a 2.5% penalty fee.
    Registration & Taxes: KES 15,000 upfront.
  `;

  // TEST 1 — Ingestion & Document Classification
  it("TEST 1: Ingestion correctly classifies vehicle financing document", async () => {
    const doc = await documentIngestionService.ingestDocument({
      name: "Toyota_Car_Quote_2024.pdf",
      size: 15400,
      type: "application/pdf",
      textContent: sampleVehicleQuote,
    });

    expect(doc.type).toBe("VEHICLE_FINANCING");
    expect(doc.status).toBe("ready");
    expect(doc.rawText).toContain("KES 500,000");
  });

  // TEST 2 — Structured Extraction of Facts, Obligations & Penalty Risks
  it("TEST 2: Structured extraction captures pricing, monthly payment, APR, and early termination risk with provenance", () => {
    const doc = {
      id: "doc-1",
      name: "Toyota_Car_Quote_2024.pdf",
      size: 15400,
      type: "VEHICLE_FINANCING" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleVehicleQuote,
    };

    const extraction = structuredExtractionService.extractFromDocument(doc, "KES");

    const priceFact = extraction.facts.find((f) => f.category === "PRICE");
    const depositFact = extraction.facts.find((f) => f.category === "DOWN_PAYMENT");
    const monthlyFact = extraction.facts.find((f) => f.category === "MONTHLY_PAYMENT");
    const aprFact = extraction.facts.find((f) => f.category === "INTEREST_RATE");

    expect(priceFact?.numericValue).toBe(500000);
    expect(depositFact?.numericValue).toBe(100000);
    expect(monthlyFact?.numericValue).toBe(18500);
    expect(aprFact?.numericValue).toBe(12.5);

    // Assert Risk Clause Extraction
    const penaltyRisk = extraction.risks.find((r) => r.title.includes("Early Termination"));
    expect(penaltyRisk).toBeDefined();
    expect(penaltyRisk?.severity).toBe("HIGH");
    expect(penaltyRisk?.sourceDocumentName).toBe("Toyota_Car_Quote_2024.pdf");

    // Assert Obligations
    expect(extraction.obligations.length).toBeGreaterThan(0);
    expect(extraction.obligations[0].amount).toBe(18500);
  });

  // TEST 3 — Deterministic Financial Calculations & Aimly Decision Score™
  it("TEST 3: Deterministic calculation computes total outlay, interest drag, buffer reduction, and explainable score", () => {
    const doc = {
      id: "doc-1",
      name: "Toyota_Car_Quote_2024.pdf",
      size: 15400,
      type: "VEHICLE_FINANCING" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleVehicleQuote,
    };

    const extraction = structuredExtractionService.extractFromDocument(doc, "KES");

    const { financingCalculations, score } = documentDecisionCalculator.calculate({
      documentTruth: extraction.documentTruth,
      userContext: {
        monthlyIncome: 180000,
        monthlyExpenses: 112000,
        liquidSavings: 200000,
        existingDebtsMonthly: 0,
        primaryGoalTarget: 500000,
        primaryGoalSaved: 180000,
      },
      facts: extraction.facts,
      risks: extraction.risks,
      missingVariables: extraction.missingVariables,
    });

    expect(financingCalculations).toBeDefined();
    const calculations = financingCalculations!;

    // Total Outlay = Down Payment (100k) + 36 * 18.5k (666k) = 766k
    expect(calculations.totalNominalPrice).toBe(500000);
    expect(calculations.downPayment).toBe(100000);
    expect(calculations.monthlyPayment).toBe(18500);
    expect(calculations.termMonths).toBe(36);
    expect(calculations.totalFinancingOutlay).toBe(766000);
    expect(calculations.totalInterestAndFees).toBe(266000);

    // Aimly Decision Score
    expect(score.overallScore).toBeGreaterThan(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(score.statusHeadline).toBeDefined();
    expect(score.scoreBreakdown.profitabilityOrAffordability).toBeGreaterThan(0);
    expect(score.explanation).toContain("766,000");
  });

  // TEST 4 — Unified Context & Intelligence Report Generation
  it("TEST 4: Intelligence engine generates 5-second clarity, 'What matters most', 'What might I be missing', scenarios, and option comparison", () => {
    const doc = {
      id: "doc-1",
      name: "Toyota_Car_Quote_2024.pdf",
      size: 15400,
      type: "VEHICLE_FINANCING" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleVehicleQuote,
    };

    const context = decisionContextBuilder.buildContext({
      userDecisionText: "I'm thinking of buying a KES 500,000 car.",
      documents: [doc],
      userContext: {
        monthlyIncome: 180000,
        monthlyExpenses: 112000,
        liquidSavings: 200000,
      },
      currency: "KES",
    });

    const report = documentIntelligenceEngine.generateReport(context);

    expect(report.whatThisMeansForYou).toBeDefined();
    expect(report.theBigPicture).toContain("766,000");
    expect(report.whatMattersMost.length).toBeGreaterThanOrEqual(2);

    // Verify "What might I be missing?"
    expect(report.whatMightIBeMissing.questionsToAsk.length).toBeGreaterThanOrEqual(1);
    expect(report.whatMightIBeMissing.questionsToAsk[0].question).toContain("taux");
  });

  // TEST 5 — Grounded Document Chat with Provenance Citations
  it("TEST 5: Grounded document chat delivers answers with provenance citations and avoids hallucinations", () => {
    const doc = {
      id: "doc-1",
      name: "Toyota_Car_Quote_2024.pdf",
      size: 15400,
      type: "VEHICLE_FINANCING" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleVehicleQuote,
    };

    const context = decisionContextBuilder.buildContext({
      userDecisionText: "I'm thinking of buying a KES 500,000 car.",
      documents: [doc],
      userContext: {
        monthlyIncome: 180000,
        monthlyExpenses: 112000,
        liquidSavings: 200000,
      },
      currency: "KES",
    });

    const report = documentIntelligenceEngine.generateReport(context);

    const chatResponse = documentIntelligenceEngine.processDocumentChatMessage(
      "Combien cela va-t-il me coûter ?",
      report
    );

    expect(chatResponse.text).toBeDefined();
    expect(chatResponse.citations).toBeDefined();
    expect(chatResponse.citations?.length).toBeGreaterThan(0);
    expect(chatResponse.citations?.[0].evidenceType).toBe("verified_document");
  });
});
