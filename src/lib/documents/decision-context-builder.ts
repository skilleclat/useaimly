/**
 * Decision Context Builder
 * Builds a canonical unified Decision Intelligence Context combining user intent,
 * financial profile, ingested documents, extracted facts, obligations, risks, and calculations.
 */

import {
  DecisionIntelligenceContext,
  DocumentItem,
  UserFinancialContextInput,
} from "../types/document-intelligence";
import { CurrencyCode } from "../types/finance";
import { structuredExtractionService } from "./structured-extraction-service";
import { documentDecisionCalculator } from "../finance/calculations/document-decision-calculator";

export interface BuildContextParams {
  userDecisionText: string;
  documents?: DocumentItem[];
  userContext?: UserFinancialContextInput;
  currency?: CurrencyCode;
}

export class DecisionContextBuilder {
  /**
   * Builds an end-to-end DecisionIntelligenceContext from user input and uploaded documents.
   */
  public buildContext(params: BuildContextParams): DecisionIntelligenceContext {
    const {
      userDecisionText,
      documents = [],
      userContext = {},
      currency = "KES",
    } = params;

    const id = `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    // 1. Structured Document Extraction
    const extraction = structuredExtractionService.extractFromMultipleDocuments(documents, currency);

    // 2. Deterministic Calculation & Scoring
    const { calculations, score } = documentDecisionCalculator.calculate({
      currency,
      userContext,
      facts: extraction.facts,
      obligations: extraction.obligations,
      risks: extraction.risks,
      missingVariables: extraction.missingVariables,
    });

    // 3. Document Category Classification
    const primaryDoc = documents[0];
    const category = primaryDoc ? primaryDoc.type : "GENERAL_DOCUMENT";

    const assumptions: string[] = [
      "Assuming constant gross monthly income throughout the financing term.",
      "Assuming baseline living expenses do not experience major inflationary shocks.",
    ];
    if (extraction.missingVariables.some((m) => m.category === "TERMS")) {
      assumptions.push("Interest rate assumed fixed unless floating rate clause is verified.");
    }

    return {
      id,
      createdAt,
      userDecisionText,
      category,
      currency,
      userFinancialContext: userContext,
      documents,
      extractedFacts: extraction.facts,
      obligations: extraction.obligations,
      risks: extraction.risks,
      missingVariables: extraction.missingVariables,
      calculations,
      score,
      assumptions,
    };
  }
}

export const decisionContextBuilder = new DecisionContextBuilder();
