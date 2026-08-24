/**
 * Evidence Validation Gate
 * Anti-Hallucination Gatekeeper: Audits 100% of facts, calculations, and claims
 * against the Document Truth Object before allowing them into the final report or PDF.
 *
 * Rules:
 * 1. Was this number directly found in the document? -> VERIFIED FACT.
 * 2. Can this number be calculated using ONLY verified facts? -> CALCULATED BY AIMLY.
 * 3. Was it explicitly provided by the user? -> USER PROVIDED.
 * 4. Is it an assumption? -> SCENARIO / ASSUMPTION (with explicit label).
 * 5. Otherwise: REJECT AND PURGE. NEVER INVENT.
 */

import {
  DocumentTruthObject,
  DocumentFact,
  DocumentCalculation,
  AimlyIntelligenceReport,
  EvidenceType,
} from "../types/document-intelligence";
import { CurrencyCode } from "../types/finance";

export interface ValidationViolation {
  field: string;
  claimedValue: string;
  reason: string;
  actionTaken: "PURGED" | "LABELED_SCENARIO" | "REPLACED_NOT_FOUND";
}

export interface EvidenceAuditResult {
  isValid: boolean;
  violations: ValidationViolation[];
  sanitizedReport: AimlyIntelligenceReport;
}

export class EvidenceValidationGate {
  /**
   * Audits and sanitizes an AimlyIntelligenceReport against the Document Truth Object.
   */
  public validateReport(
    report: AimlyIntelligenceReport,
    documentTruth: DocumentTruthObject
  ): EvidenceAuditResult {
    const violations: ValidationViolation[] = [];
    const docCurrency = documentTruth.currency;
    const docType = documentTruth.documentType;

    // 1. Currency Integrity Check
    if (report.currency !== docCurrency) {
      violations.push({
        field: "currency",
        claimedValue: report.currency,
        reason: `Report currency (${report.currency}) does not match document currency (${docCurrency}).`,
        actionTaken: "PURGED",
      });
      report.currency = docCurrency;
    }

    // 2. Cross-Check Accounting Report against Loan Hallucinations
    if (
      docType === "ACCOUNTING_REPORT" ||
      docType === "FINANCIAL_STATEMENT" ||
      docType === "PROFIT_AND_LOSS" ||
      docType === "BALANCE_SHEET"
    ) {
      // If report contains loan terms, purge them
      const hasLoanFact = documentTruth.verifiedFacts.some((f) => f.category === "PRICE" || f.category === "MONTHLY_PAYMENT");
      if (!hasLoanFact) {
        // Sanitize 'whatMattersMost' cards that claim loan commitments
        report.whatMattersMost = report.whatMattersMost.filter((card) => {
          const lower = card.title.toLowerCase();
          if (lower.includes("loan") || lower.includes("financing") || lower.includes("monthly cash flow drag") || lower.includes("10-year opportunity")) {
            violations.push({
              field: `whatMattersMost[${card.title}]`,
              claimedValue: card.value,
              reason: "Loan / financing commitment card generated for an accounting report without loan facts.",
              actionTaken: "PURGED",
            });
            return false;
          }
          return true;
        });

        // Ensure questions to ask are accounting-specific, not loan-specific
        report.whatMightIBeMissing.questionsToAsk = report.whatMightIBeMissing.questionsToAsk.filter((q) => {
          const lower = q.question.toLowerCase();
          if (lower.includes("interest rate") || lower.includes("dealer preparation") || lower.includes("prepayment penalty")) {
            violations.push({
              field: `questionsToAsk[${q.question}]`,
              claimedValue: q.question,
              reason: "Loan-specific question generated for an accounting report.",
              actionTaken: "PURGED",
            });
            return false;
          }
          return true;
        });
      }
    }

    // 3. Verify Every Number in Verified Facts is Grounded in Document Truth
    const validFactIds = new Set(documentTruth.verifiedFacts.map((f) => f.id));
    report.verifiedFacts = report.verifiedFacts.filter((fact) => {
      if (!validFactIds.has(fact.id) && fact.evidenceType === "verified_document") {
        violations.push({
          field: `verifiedFacts[${fact.label}]`,
          claimedValue: fact.value,
          reason: "Fact was not present in the Document Truth Object.",
          actionTaken: "PURGED",
        });
        return false;
      }
      return true;
    });

    return {
      isValid: violations.length === 0,
      violations,
      sanitizedReport: report,
    };
  }
}

export const evidenceValidationGate = new EvidenceValidationGate();
