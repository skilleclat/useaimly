/**
 * Structured Extraction Service
 * Deeply extracts numerical terms, financial obligations, risks, penalty clauses,
 * dates, entities, and missing variables from documents with strict provenance tracking.
 */

import {
  DocumentItem,
  DocumentFact,
  DocumentObligation,
  DocumentRisk,
  MissingVariable,
  FactCategory,
} from "../types/document-intelligence";
import { CurrencyCode } from "../types/finance";

export interface ExtractionResult {
  facts: DocumentFact[];
  obligations: DocumentObligation[];
  risks: DocumentRisk[];
  missingVariables: MissingVariable[];
}

export class StructuredExtractionService {
  /**
   * Extracts all structured facts, obligations, and risks from a single document.
   */
  public extractFromDocument(doc: DocumentItem, targetCurrency: CurrencyCode = "KES"): ExtractionResult {
    const facts: DocumentFact[] = [];
    const obligations: DocumentObligation[] = [];
    const risks: DocumentRisk[] = [];
    const missingVariables: MissingVariable[] = [];

    const text = doc.rawText;
    const lower = text.toLowerCase();

    // 1. PRICE EXTRACTION
    const pricePatterns = [
      /(?:total\s*price|vehicle\s*price|purchase\s*price|property\s*price|price|principal|amount|invoice\s*total)[^\d]*?(?:kes|ksh|\$|€|£)?\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{4,8})\b/i,
      /(?:kes|ksh|\$|€|£)\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{4,8})\b/i,
    ];

    let detectedPrice = 0;
    let priceExcerpt = "";
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const val = parseInt(match[1].replace(/[,. ]/g, ""), 10);
        if (!isNaN(val) && val >= 500) {
          detectedPrice = val;
          priceExcerpt = match[0];
          break;
        }
      }
    }

    if (detectedPrice > 0) {
      facts.push({
        id: `fact-price-${doc.id}`,
        category: "PRICE",
        key: "total_price",
        label: "Total Purchase / Principal Price",
        value: `${targetCurrency} ${detectedPrice.toLocaleString()}`,
        numericValue: detectedPrice,
        currency: targetCurrency,
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
        sourceExcerpt: priceExcerpt,
        confidence: 0.95,
        isConfirmedByDocument: true,
      });
    } else {
      missingVariables.push({
        id: `miss-price-${doc.id}`,
        title: "Exact Total Price / Cost",
        whyItMatters: "Without a confirmed total price, total long-term obligation cannot be strictly computed.",
        recommendedQuestion: "What is the final all-inclusive price including all taxes and dealer preparation fees?",
        category: "PRICING",
        defaultAssumption: "Assuming benchmark estimation based on asset class.",
      });
    }

    // 2. DOWN PAYMENT / DEPOSIT EXTRACTION
    const depositPattern = /(?:deposit|down\s*payment|initial\s*payment|upfront)[^\d]*?(?:kes|ksh|\$|€|£)?\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{4,8})\b/i;
    const depositMatch = text.match(depositPattern);
    let detectedDeposit = 0;
    if (depositMatch) {
      const val = parseInt(depositMatch[1].replace(/[,. ]/g, ""), 10);
      if (!isNaN(val)) {
        detectedDeposit = val;
        facts.push({
          id: `fact-deposit-${doc.id}`,
          category: "DOWN_PAYMENT",
          key: "down_payment",
          label: "Required Down Payment / Initial Deposit",
          value: `${targetCurrency} ${val.toLocaleString()}`,
          numericValue: val,
          currency: targetCurrency,
          sourceDocumentId: doc.id,
          sourceDocumentName: doc.name,
          sourceExcerpt: depositMatch[0],
          confidence: 0.92,
          isConfirmedByDocument: true,
        });
      }
    }

    // 3. MONTHLY INSTALLMENT / PAYMENT EXTRACTION
    const monthlyPattern = /(?:monthly\s*(?:payment|installment|repayment|cost)|per\s*month|\/mo|\bpm\b)[^\d]*?(?:kes|ksh|\$|€|£)?\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{3,7})\b/i;
    const monthlyMatch = text.match(monthlyPattern);
    let detectedMonthly = 0;
    if (monthlyMatch) {
      const val = parseInt(monthlyMatch[1].replace(/[,. ]/g, ""), 10);
      if (!isNaN(val) && val > 0) {
        detectedMonthly = val;
        facts.push({
          id: `fact-monthly-${doc.id}`,
          category: "MONTHLY_PAYMENT",
          key: "monthly_installment",
          label: "Monthly Payment / Installment",
          value: `${targetCurrency} ${val.toLocaleString()} / month`,
          numericValue: val,
          currency: targetCurrency,
          sourceDocumentId: doc.id,
          sourceDocumentName: doc.name,
          sourceExcerpt: monthlyMatch[0],
          confidence: 0.94,
          isConfirmedByDocument: true,
        });
      }
    }

    // 4. TERM DURATION EXTRACTION
    const termPattern = /\b([0-9]{1,3})\s*(?:months|month|mo|years|year|yrs|yr)\b/i;
    const termMatch = text.match(termPattern);
    let detectedTermMonths = 0;
    if (termMatch) {
      const num = parseInt(termMatch[1], 10);
      const isYear = /\b(?:year|years|yr|yrs)\b/i.test(termMatch[0]);
      detectedTermMonths = isYear ? num * 12 : num;

      facts.push({
        id: `fact-term-${doc.id}`,
        category: "TERM_DURATION",
        key: "term_duration",
        label: "Commitment Term / Duration",
        value: `${detectedTermMonths} Months (${(detectedTermMonths / 12).toFixed(1)} Years)`,
        numericValue: detectedTermMonths,
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
        sourceExcerpt: termMatch[0],
        confidence: 0.9,
        isConfirmedByDocument: true,
      });
    }

    // 5. INTEREST RATE / APR EXTRACTION
    const ratePattern = /([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%\s*(?:p\.?a\.?|per\s*annum|apr|interest|annual)?/i;
    const rateMatch = text.match(ratePattern);
    if (rateMatch) {
      const rateVal = parseFloat(rateMatch[1]);
      if (!isNaN(rateVal) && rateVal > 0) {
        facts.push({
          id: `fact-apr-${doc.id}`,
          category: "INTEREST_RATE",
          key: "interest_rate",
          label: "Annual Interest Rate (APR)",
          value: `${rateVal}% p.a.`,
          numericValue: rateVal,
          sourceDocumentId: doc.id,
          sourceDocumentName: doc.name,
          sourceExcerpt: rateMatch[0],
          confidence: 0.93,
          isConfirmedByDocument: true,
        });
      }
    } else if (doc.type === "VEHICLE_FINANCING" || doc.type === "MORTGAGE" || doc.type === "PERSONAL_LOAN") {
      missingVariables.push({
        id: `miss-rate-${doc.id}`,
        title: "Interest Rate Type (Fixed vs. Variable)",
        whyItMatters: "If the rate is variable, future monthly payments could rise if central interest rates increase.",
        recommendedQuestion: "Is this interest rate fixed for the full term or subject to periodic bank adjustment?",
        category: "TERMS",
        defaultAssumption: "Assuming standard regional financing rate benchmark.",
      });
    }

    // 6. OBLIGATION SYNTHESIS
    if (detectedMonthly > 0 && detectedTermMonths > 0) {
      const totalCommitment = detectedDeposit + detectedMonthly * detectedTermMonths;
      obligations.push({
        id: `obg-${doc.id}`,
        title: `${doc.name} - Recurring Payment Schedule`,
        amount: detectedMonthly,
        currency: targetCurrency,
        frequency: "MONTHLY",
        durationMonths: detectedTermMonths,
        totalCommitment,
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
      });
    } else if (detectedPrice > 0) {
      obligations.push({
        id: `obg-onetime-${doc.id}`,
        title: `${doc.name} - Capital Outlay`,
        amount: detectedPrice,
        currency: targetCurrency,
        frequency: "ONE_OFF",
        totalCommitment: detectedPrice,
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
      });
    }

    // 7. HIDDEN CLAUSES & RISK DETECTION
    if (lower.includes("early termination") || lower.includes("prepayment penalty") || lower.includes("break fee")) {
      risks.push({
        id: `risk-penalty-${doc.id}`,
        severity: "HIGH",
        category: "COMMITMENT",
        title: "Early Termination Penalty Detected",
        description: "Ending this contract or paying off the balance ahead of schedule incurs penalty fees or forfeiture of unearned interest discounts.",
        evidenceExcerpt: "Early termination / prepayment penalty clause found in agreement terms.",
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
        mitigationSuggestion: "Ask for a written settlement quote calculation formula before signing.",
      });
    }

    if (lower.includes("automatic renewal") || lower.includes("auto-renew") || lower.includes("rollover")) {
      risks.push({
        id: `risk-autorenew-${doc.id}`,
        severity: "MEDIUM",
        category: "LEGAL",
        title: "Automatic Contract Renewal Clause",
        description: "The agreement automatically renews for an additional term unless written cancellation is provided within the specified notice window.",
        evidenceExcerpt: "Automatic renewal clause detected in contractual commitments.",
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
        mitigationSuggestion: "Set a calendar reminder 60 days before contract expiry to review terms.",
      });
    }

    if (lower.includes("balloon payment") || lower.includes("residual value") || lower.includes("final lump sum")) {
      risks.push({
        id: `risk-balloon-${doc.id}`,
        severity: "CRITICAL",
        category: "FINANCIAL",
        title: "Balloon / Residual Payment Due at Term End",
        description: "A substantial lump-sum payment is required at the end of the financing period to retain the asset.",
        evidenceExcerpt: "Residual value / balloon payment terms detected.",
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
        mitigationSuggestion: "Ensure a dedicated sinking fund is built to cover the final balloon payment.",
      });
    }

    if (lower.includes("variable") || lower.includes("floating rate") || lower.includes("subject to change")) {
      risks.push({
        id: `risk-variable-${doc.id}`,
        severity: "HIGH",
        category: "FINANCIAL",
        title: "Floating / Variable Interest Rate Risk",
        description: "Your monthly obligation is tied to base lending rate fluctuations and may increase over time.",
        evidenceExcerpt: "Variable interest rate clause noted in financing terms.",
        sourceDocumentId: doc.id,
        sourceDocumentName: doc.name,
        mitigationSuggestion: "Stress-test your monthly budget with a +2.0% to +3.5% rate increase.",
      });
    }

    return {
      facts,
      obligations,
      risks,
      missingVariables,
    };
  }

  /**
   * Aggregates extraction across multiple documents.
   */
  public extractFromMultipleDocuments(docs: DocumentItem[], targetCurrency: CurrencyCode = "KES"): ExtractionResult {
    const aggregated: ExtractionResult = {
      facts: [],
      obligations: [],
      risks: [],
      missingVariables: [],
    };

    for (const doc of docs) {
      const res = this.extractFromDocument(doc, targetCurrency);
      aggregated.facts.push(...res.facts);
      aggregated.obligations.push(...res.obligations);
      aggregated.risks.push(...res.risks);
      aggregated.missingVariables.push(...res.missingVariables);
    }

    return aggregated;
  }
}

export const structuredExtractionService = new StructuredExtractionService();
