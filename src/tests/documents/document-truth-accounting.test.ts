import { describe, it, expect } from "vitest";
import { documentIngestionService } from "@/lib/documents/document-ingestion-service";
import { structuredExtractionService } from "@/lib/documents/structured-extraction-service";
import { documentDecisionCalculator } from "@/lib/finance/calculations/document-decision-calculator";
import { decisionContextBuilder } from "@/lib/documents/decision-context-builder";
import { documentIntelligenceEngine } from "@/lib/ai/document-intelligence-engine";
import { evidenceValidationGate } from "@/lib/documents/evidence-validation-gate";
import { generateAimlyDecisionPDF } from "@/lib/documents/aimly-pdf-generator";

describe("Strict Evidence Hierarchy & Accounting Report Grounding Suite", () => {
  const sampleAccountingReport = `
    RAPPORT COMPTABLE ET ÉTATS FINANCIERS SIMPLIFIÉS
    Période : 1er Janvier 2026 au 31 Juillet 2026
    Devise : Kenyan Shillings (KES)

    COMPTE DE RÉSULTAT :
    Chiffre d'affaires : 2,850,000 KES
    Coût des ventes : 1,120,000 KES
    Marge brute : 1,730,000 KES
    Résultat d'exploitation : 500,000 KES
    Résultat net : 318,500 KES

    TRÉSORERIE & BILAN :
    Trésorerie de clôture : 530,000 KES
  `;

  // TEST 1 — Document Classification & Currency Detection
  it("TEST 1: Ingestion strictly classifies as ACCOUNTING_REPORT and detects KES currency", async () => {
    const doc = await documentIngestionService.ingestDocument({
      name: "document_comptable.pdf",
      size: 18500,
      type: "application/pdf",
      textContent: sampleAccountingReport,
    });

    expect(doc.type).toBe("ACCOUNTING_REPORT");
    expect(doc.metadata?.detectedCurrency).toBe("KES");
  });

  // TEST 2 — Document Truth Extraction of Exact Figures
  it("TEST 2: Document truth extraction captures verified accounting facts with exact numbers and page provenance", () => {
    const doc = {
      id: "doc-acct-1",
      name: "document_comptable.pdf",
      size: 18500,
      type: "ACCOUNTING_REPORT" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleAccountingReport,
    };

    const extraction = structuredExtractionService.extractFromDocument(doc, "KES");
    const truth = extraction.documentTruth;

    expect(truth.documentType).toBe("ACCOUNTING_REPORT");
    expect(truth.currency).toBe("KES");

    const rev = truth.verifiedFacts.find((f) => f.category === "REVENUE");
    const cogs = truth.verifiedFacts.find((f) => f.category === "COST_OF_SALES");
    const gp = truth.verifiedFacts.find((f) => f.category === "GROSS_PROFIT");
    const op = truth.verifiedFacts.find((f) => f.category === "OPERATING_PROFIT");
    const np = truth.verifiedFacts.find((f) => f.category === "NET_PROFIT");
    const cash = truth.verifiedFacts.find((f) => f.category === "CASH_BALANCE");

    expect(rev?.numericValue).toBe(2850000);
    expect(cogs?.numericValue).toBe(1120000);
    expect(gp?.numericValue).toBe(1730000);
    expect(op?.numericValue).toBe(500000);
    expect(np?.numericValue).toBe(318500);
    expect(cash?.numericValue).toBe(530000);

    // Verify NOT FOUND fields are explicitly captured
    expect(truth.notFoundFields.length).toBeGreaterThan(0);
    const loanPrincipalNotFound = truth.notFoundFields.find((f) => f.fieldKey === "loanPrincipal");
    expect(loanPrincipalNotFound?.status).toBe("NOT_FOUND");
  });

  // TEST 3 — Deterministic Accounting Calculations (Gross Margin, Net Margin)
  it("TEST 3: Deterministic calculator produces exact gross and net margins with formulas", () => {
    const doc = {
      id: "doc-acct-1",
      name: "document_comptable.pdf",
      size: 18500,
      type: "ACCOUNTING_REPORT" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleAccountingReport,
    };

    const extraction = structuredExtractionService.extractFromDocument(doc, "KES");
    const calc = documentDecisionCalculator.calculate({
      documentTruth: extraction.documentTruth,
      userContext: {},
      facts: extraction.facts,
      risks: extraction.risks,
      missingVariables: extraction.missingVariables,
    });

    expect(calc.accountingCalculations).toBeDefined();
    const ac = calc.accountingCalculations!;

    expect(ac.revenue).toBe(2850000);
    expect(ac.costOfSales).toBe(1120000);
    expect(ac.grossProfit).toBe(1730000);
    expect(ac.grossMarginPercent).toBe(60.7); // 1,730,000 / 2,850,000 = 60.70%
    expect(ac.netProfit).toBe(318500);
    expect(ac.netMarginPercent).toBe(11.18); // 318,500 / 2,850,000 = 11.18%
    expect(ac.operatingProfit).toBe(500000);
    expect(ac.closingCash).toBe(530000);

    // Aimly score
    expect(calc.score.overallScore).toBeGreaterThan(60);
    expect(calc.score.status).toBe("HEALTHY_PROFITABILITY");
  });

  // TEST 4 — Strict Negative Invariants (ZERO LOAN HALLUCINATIONS)
  it("TEST 4: Intelligence report NEVER invents loan principal, monthly payment, 36 months, or EUR currency", () => {
    const doc = {
      id: "doc-acct-1",
      name: "document_comptable.pdf",
      size: 18500,
      type: "ACCOUNTING_REPORT" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleAccountingReport,
    };

    const context = decisionContextBuilder.buildContext({
      userDecisionText: "Analyse des comptes annuels",
      documents: [doc],
      currency: "KES",
    });

    const report = documentIntelligenceEngine.generateReport(context);

    // 1. Currency must be KES
    expect(report.currency).toBe("KES");
    const reportText = JSON.stringify(report);
    expect(reportText).not.toContain("€");
    expect(reportText).not.toContain("EUR");

    // 2. Strict Negative Invariants
    expect(reportText).not.toContain("510,876");
    expect(reportText).not.toContain("14,191");
    expect(reportText).not.toContain("1,102,943");
    expect(reportText).not.toContain("36 months");
    expect(reportText).not.toContain("36 Mois");

    // 3. Question specific to accounting
    const q1 = report.whatMightIBeMissing.questionsToAsk[0].question;
    expect(q1.toLowerCase()).not.toContain("interest rate");
    expect(q1.toLowerCase()).not.toContain("taux d'intérêt");
    expect(q1.toLowerCase()).toContain("récurrent");
  });

  // TEST 5 — Evidence Validation Gate & PDF Generation
  it("TEST 5: Evidence validation gate passes with 0 violations and PDF generates in KES", () => {
    const doc = {
      id: "doc-acct-1",
      name: "document_comptable.pdf",
      size: 18500,
      type: "ACCOUNTING_REPORT" as const,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
      rawText: sampleAccountingReport,
    };

    const context = decisionContextBuilder.buildContext({
      userDecisionText: "Analyse comptable",
      documents: [doc],
      currency: "KES",
    });

    const report = documentIntelligenceEngine.generateReport(context);
    const audit = evidenceValidationGate.validateReport(report, context.documentTruth);

    expect(audit.isValid).toBe(true);
    expect(audit.violations.length).toBe(0);

    // Verify PDF builds cleanly
    const pdfDoc = generateAimlyDecisionPDF(report, "fr");
    expect(pdfDoc).toBeDefined();
    expect(pdfDoc.internal.pages.length).toBeGreaterThan(0);
  });
});
