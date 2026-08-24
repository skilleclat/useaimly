/**
 * UseAimly Document-Grounded Decision Intelligence Types
 * Strict Evidence Hierarchy:
 * DOCUMENT EVIDENCE ➔ VERIFIED FACTS ➔ CALCULATIONS ➔ SCENARIOS ➔ DECISION INTELLIGENCE
 */

import { CurrencyCode } from "./finance";

export type DocumentType =
  | "ACCOUNTING_REPORT"
  | "FINANCIAL_STATEMENT"
  | "PROFIT_AND_LOSS"
  | "BALANCE_SHEET"
  | "CASH_FLOW_STATEMENT"
  | "BANK_STATEMENT"
  | "LOAN_AGREEMENT"
  | "CREDIT_AGREEMENT"
  | "MORTGAGE"
  | "PURCHASE_QUOTE"
  | "VEHICLE_FINANCING"
  | "LEASE_AGREEMENT"
  | "COMMERCIAL_CONTRACT"
  | "EMPLOYMENT_CONTRACT"
  | "INVOICE"
  | "TAX_DOCUMENT"
  | "INVESTMENT_PROPOSAL"
  | "INSURANCE_DOCUMENT"
  | "MIXED_DOCUMENT"
  | "UNKNOWN_DOCUMENT";

export type DocumentProcessingStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "extracting"
  | "analyzing"
  | "ready"
  | "failed";

export type EvidenceType =
  | "verified_document"
  | "calculated"
  | "user_provided"
  | "scenario"
  | "unavailable";

export type ProvenanceSourceType =
  | "CONFIRMED_BY_DOCUMENT"
  | "ESTIMATED_FROM_INPUTS"
  | "GENERAL_CONSIDERATION"
  | "DETERMINISTIC_CALCULATION";

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: DocumentType;
  mimeType: string;
  uploadedAt: string;
  status: DocumentProcessingStatus;
  rawText: string;
  pageCount?: number;
  ocrApplied?: boolean;
  metadata?: {
    author?: string;
    creationDate?: string;
    organization?: string;
    detectedLanguage?: string;
    detectedCurrency?: CurrencyCode;
    periodCovered?: string;
  };
  errorMessage?: string;
}

export type FactCategory =
  | "REVENUE"
  | "COST_OF_SALES"
  | "GROSS_PROFIT"
  | "OPERATING_EXPENSES"
  | "OPERATING_PROFIT"
  | "NET_PROFIT"
  | "CASH_BALANCE"
  | "ASSETS"
  | "LIABILITIES"
  | "PRICE"
  | "DOWN_PAYMENT"
  | "MONTHLY_PAYMENT"
  | "INTEREST_RATE"
  | "TERM_DURATION"
  | "FEE"
  | "PENALTY"
  | "TAX"
  | "DATE"
  | "ENTITY"
  | "RENEWAL_CLAUSE"
  | "TERMINATION_CLAUSE"
  | "GENERAL_FACT";

export interface DocumentFact {
  id: string;
  category: FactCategory;
  key: string;
  label: string;
  value: string;
  numericValue?: number;
  currency?: CurrencyCode;
  evidenceType: EvidenceType;
  sourceDocumentId: string;
  sourceDocumentName: string;
  source?: {
    page?: number;
    section?: string;
    originalText?: string;
  };
  confidence: "high" | "medium" | "low";
  isConfirmedByDocument: boolean;
}

export interface DocumentCalculation {
  id: string;
  label: string;
  numericValue: number;
  formattedValue: string;
  unit?: string;
  formula: string;
  inputFactIds: string[];
  explanation: string;
  evidenceType: "calculated";
}

export interface DocumentTruthObject {
  documentId: string;
  documentName: string;
  documentType: DocumentType;
  confidence: "high" | "medium" | "low";
  typeReasoning: string;
  currency: CurrencyCode;
  period?: string;
  verifiedFacts: DocumentFact[];
  notFoundFields: {
    fieldKey: string;
    label: string;
    status: "NOT_FOUND";
    implication: string;
  }[];
}

export interface DocumentObligation {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  frequency: "ONE_OFF" | "MONTHLY" | "ANNUAL" | "VARIABLE";
  durationMonths?: number;
  totalCommitment: number;
  penaltyClause?: string;
  renewalClause?: string;
  sourceDocumentId: string;
  sourceDocumentName: string;
}

export type RiskSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type RiskCategory = "FINANCIAL" | "LEGAL" | "COMMITMENT" | "FLEXIBILITY" | "UNCERTAINTY";

export interface DocumentRisk {
  id: string;
  severity: RiskSeverity;
  category: RiskCategory;
  title: string;
  description: string;
  evidenceExcerpt?: string;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  mitigationSuggestion?: string;
}

export interface MissingVariable {
  id: string;
  title: string;
  whyItMatters: string;
  recommendedQuestion: string;
  defaultAssumption?: string;
  category: "PRICING" | "TERMS" | "FEES" | "PENALTIES" | "FLEXIBILITY" | "OPERATIONS" | "LIQUIDITY";
}

export interface UserFinancialContextInput {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  liquidSavings?: number;
  existingDebtsMonthly?: number;
  primaryGoalTitle?: string;
  primaryGoalTarget?: number;
  primaryGoalSaved?: number;
  primaryGoalTargetDate?: string;
  currency?: CurrencyCode;
}

export interface AccountingCalculations {
  currency: CurrencyCode;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  operatingProfit: number;
  operatingMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  closingCash: number;
  costOfSalesRatioPercent: number;
  operatingExpenseBurdenPercent: number;
}

export interface FinancingCalculations {
  currency: CurrencyCode;
  totalNominalPrice: number;
  downPayment: number;
  principalFinanced: number;
  monthlyPayment: number;
  termMonths: number;
  totalFinancingOutlay: number;
  totalInterestAndFees: number;
  annualPercentageRate?: number;
  cashReserveBefore?: number;
  cashReserveAfter?: number;
  reserveFloorMonthsAfter?: number;
  monthlyFreeCashFlowBefore?: number;
  monthlyFreeCashFlowAfter?: number;
  debtToIncomeRatioAfter?: number;
  goalDelayDays?: number;
  opportunityCostInvestment10Yr?: number;
}

export type DecisionAssessmentStatus =
  | "PROCEED_WITH_CONFIDENCE"
  | "PROCEED_WITH_CAUTION"
  | "NEEDS_MORE_INFORMATION"
  | "HIGH_RISK_DEFICIT"
  | "HEALTHY_PROFITABILITY"
  | "MODERATE_PROFITABILITY"
  | "OPERATING_PRESSURE";

export interface AimlyDecisionScore {
  overallScore: number | null; // null if insufficient data
  status: DecisionAssessmentStatus;
  statusHeadline: string;
  scoreConfidence: "high" | "medium" | "low" | "insufficient_data";
  scoreBreakdown: {
    profitabilityOrAffordability: number;
    operatingOrCashFlowHealth: number;
    marginOrCommitmentDefense: number;
    riskOrFlexibilityExposure: number;
    dataCompleteness: number;
  };
  explanation: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
}

export interface WhatMattersMostCard {
  id: string;
  title: string;
  value: string;
  subtext: string;
  badgeText?: string;
  evidenceType: EvidenceType;
  iconType: "dollar" | "calendar" | "shield" | "alert" | "trending" | "lock" | "pie";
  sourceDocumentName?: string;
  sourceExcerpt?: string;
  calculationFormula?: string;
}

export interface QuestionToAsk {
  number: number;
  question: string;
  context: string;
  whyItMatters: string;
  evidenceType: EvidenceType;
}

export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  assumptionDescription: string;
  parameterName: string;
  parameterDelta: string;
  calculatedOutcome: {
    primaryMetricDelta: string;
    secondaryMetricDelta: string;
    verdict: string;
  };
  evidenceType: "scenario";
}

export interface OptionComparisonItem {
  id: string;
  optionName: string;
  documentName?: string;
  primaryMetric: string;
  secondaryMetric: string;
  totalCommitmentOrRevenue: string;
  keyRisksCount: number;
  aimlyScore: number;
  primaryAdvantage: string;
  primaryDrawback: string;
}

export interface OptionComparisonMatrix {
  options: OptionComparisonItem[];
  aimlysTake: string;
  recommendedOptionId?: string;
  tradeoffAnalysis: string;
}

export interface GroundedChatMessage {
  id: string;
  sender: "user" | "aimly";
  text: string;
  timestamp: string;
  citations?: {
    evidenceType: EvidenceType;
    documentName?: string;
    excerpt?: string;
  }[];
  suggestedFollowUps?: string[];
}

export interface DecisionIntelligenceContext {
  id: string;
  createdAt: string;
  userDecisionText: string;
  documentTruth: DocumentTruthObject;
  documents: DocumentItem[];
  accountingCalculations?: AccountingCalculations;
  financingCalculations?: FinancingCalculations;
  calculationsList: DocumentCalculation[];
  risks: DocumentRisk[];
  missingVariables: MissingVariable[];
  score: AimlyDecisionScore;
  assumptions: string[];
}

export interface AimlyIntelligenceReport {
  id: string;
  contextId: string;
  generatedAt: string;
  documentType: DocumentType;
  documentTypeLabel: string;
  currency: CurrencyCode;
  period?: string;
  whatThisMeansForYou: string; // 5-second instant clarity
  theBigPicture: string; // Executive plain-language summary
  score: AimlyDecisionScore;
  verifiedFacts: DocumentFact[];
  keyCalculations: DocumentCalculation[];
  whatMattersMost: WhatMattersMostCard[];
  financialImpact: {
    primaryHeadline: string;
    primaryAmountFormatted: string;
    secondaryHeadline: string;
    secondaryAmountFormatted: string;
    summaryTable: {
      metric: string;
      amount: string;
      evidenceType: EvidenceType;
      analysis: string;
    }[];
    opportunityCostOrReinvestmentExplanation?: string;
  };
  whatMightIBeMissing: {
    headline: string;
    questionsToAsk: QuestionToAsk[];
    hiddenClausesDetected: DocumentRisk[];
    missingDataItems: MissingVariable[];
  };
  scenarios: WhatIfScenario[];
  comparison?: OptionComparisonMatrix;
  context: DecisionIntelligenceContext;
}
