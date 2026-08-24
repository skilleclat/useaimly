/**
 * UseAimly AI Document & Decision Intelligence Engine Types
 * Provides unified schema for documents, extracted facts, provenance, obligations,
 * deterministic calculations, Aimly Decision Score™, scenarios, and grounded reports.
 */

import { CurrencyCode } from "./finance";

export type DocumentType =
  | "VEHICLE_FINANCING"
  | "MORTGAGE"
  | "PERSONAL_LOAN"
  | "PURCHASE_QUOTE"
  | "EMPLOYMENT_OFFER"
  | "PAYSLIP"
  | "BANK_STATEMENT"
  | "LEASE_AGREEMENT"
  | "SUBSCRIPTION_CONTRACT"
  | "INVESTMENT_PROPOSAL"
  | "INVOICE"
  | "GENERAL_DOCUMENT";

export type DocumentProcessingStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "extracting"
  | "analyzing"
  | "ready"
  | "failed";

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
  };
  errorMessage?: string;
}

export type FactCategory =
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
  sourceDocumentId: string;
  sourceDocumentName: string;
  sourceExcerpt?: string;
  pageNumber?: number;
  confidence: number; // 0 to 1
  isConfirmedByDocument: boolean;
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
  category: "PRICING" | "TERMS" | "FEES" | "PENALTIES" | "FLEXIBILITY";
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

export interface DeterministicFinancialCalculations {
  currency: CurrencyCode;
  totalNominalPrice: number;
  downPayment: number;
  principalFinanced: number;
  monthlyPayment: number;
  termMonths: number;
  totalFinancingOutlay: number;
  totalInterestAndFees: number;
  annualPercentageRate?: number;
  cashReserveBefore: number;
  cashReserveAfter: number;
  reserveFloorMonthsAfter: number;
  monthlyFreeCashFlowBefore: number;
  monthlyFreeCashFlowAfter: number;
  debtToIncomeRatioAfter: number;
  goalDelayDays: number;
  goalDelayMonths: number;
  recoveryMonthlyAmount: number;
  opportunityCostInvestment10Yr?: number;
  breakEvenMonths?: number;
}

export type DecisionAssessmentStatus =
  | "PROCEED_WITH_CONFIDENCE"
  | "PROCEED_WITH_CAUTION"
  | "NEEDS_MORE_INFORMATION"
  | "HIGH_RISK_DEFICIT";

export interface AimlyDecisionScore {
  overallScore: number; // 0 to 100
  status: DecisionAssessmentStatus;
  statusHeadline: string;
  scoreBreakdown: {
    affordability: number; // 0 to 25
    financialPressure: number; // 0 to 20
    longTermCommitment: number; // 0 to 20
    flexibilityDefense: number; // 0 to 15
    riskExposure: number; // 0 to 10
    informationCompleteness: number; // 0 to 10
  };
  explanation: string;
  keyDrivers: string[];
}

export interface WhatMattersMostCard {
  id: string;
  title: string;
  value: string;
  subtext: string;
  badgeText?: string;
  iconType: "dollar" | "calendar" | "shield" | "alert" | "trending" | "lock";
  provenance: ProvenanceSourceType;
  sourceDocumentName?: string;
}

export interface QuestionToAsk {
  number: number;
  question: string;
  context: string;
  whyItMatters: string;
  provenance: ProvenanceSourceType;
}

export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  parameterName: string;
  parameterDelta: string;
  calculatedOutcome: {
    monthlyPaymentDelta: number;
    totalCommitmentDelta: number;
    reserveMonthsAfter: number;
    goalDelayDays: number;
    verdict: string;
  };
}

export interface OptionComparisonItem {
  id: string;
  optionName: string;
  documentName?: string;
  upfrontCost: number;
  monthlyCost: number;
  totalCommitment: number;
  durationMonths: number;
  interestRate?: number;
  fees: number;
  flexibilityScore: "HIGH" | "MEDIUM" | "LOW";
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
    provenance: ProvenanceSourceType;
    documentName?: string;
    excerpt?: string;
  }[];
  suggestedFollowUps?: string[];
}

export interface DecisionIntelligenceContext {
  id: string;
  createdAt: string;
  userDecisionText: string;
  category: DocumentType;
  currency: CurrencyCode;
  userFinancialContext: UserFinancialContextInput;
  documents: DocumentItem[];
  extractedFacts: DocumentFact[];
  obligations: DocumentObligation[];
  risks: DocumentRisk[];
  missingVariables: MissingVariable[];
  calculations: DeterministicFinancialCalculations;
  score: AimlyDecisionScore;
  assumptions: string[];
}

export interface AimlyIntelligenceReport {
  id: string;
  contextId: string;
  generatedAt: string;
  userDecisionText: string;
  currency: CurrencyCode;
  whatThisMeansForYou: string; // 5-second instant answer
  theBigPicture: string; // Executive plain-language summary
  score: AimlyDecisionScore;
  whatMattersMost: WhatMattersMostCard[]; // 3-5 critical highlights
  financialImpact: {
    immediateImpact: string;
    immediateAmount: number;
    monthlyImpact: string;
    monthlyAmount: number;
    longTermImpact: string;
    totalCommitmentAmount: number;
    flexibilityImpact: string;
    opportunityCostExplanation: string;
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
