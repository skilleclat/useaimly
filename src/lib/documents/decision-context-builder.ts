/**
 * Decision Context Builder
 * Builds a unified Decision Intelligence Context strictly grounded in the Document Truth Object.
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
      currency: requestedCurrency,
    } = params;

    const id = `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    // 1. Structured Document Truth Extraction
    const extraction = structuredExtractionService.extractFromMultipleDocuments(documents, requestedCurrency);
    const documentTruth = extraction.documentTruth;
    const effectiveCurrency = documentTruth.currency;

    // 2. Deterministic Calculation & Scoring based ONLY on Document Truth
    const { accountingCalculations, financingCalculations, calculationsList, score } =
      documentDecisionCalculator.calculate({
        documentTruth,
        userContext,
        facts: extraction.facts,
        risks: extraction.risks,
        missingVariables: extraction.missingVariables,
      });

    const assumptions: string[] = [];
    if (documentTruth.documentType === "ACCOUNTING_REPORT") {
      assumptions.push("Analyse fondée exclusivement sur la période comptable et les chiffres certifiés du rapport.");
    }

    return {
      id,
      createdAt,
      userDecisionText,
      documentTruth,
      documents,
      accountingCalculations,
      financingCalculations,
      calculationsList,
      risks: extraction.risks,
      missingVariables: extraction.missingVariables,
      score,
      assumptions,
    };
  }
}

export const decisionContextBuilder = new DecisionContextBuilder();
