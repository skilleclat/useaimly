/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * MASTER DECISION INTELLIGENCE OBJECT & ARCHITECTURE (PROMPT 1)
 *
 * Provides the unified, end-to-end data model passed across all 7 stages of
 * decision evaluation. Implements strict epistemic classification (Facts vs Estimates vs Assumptions vs Unknowns)
 * and multidimensional confidence scoring.
 */

import { CurrencyCode } from "../types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// B. EPISTEMIC INFORMATION CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export type InformationSourceClassification =
  | "VERIFIED_FACT"        // Confirmed historical records, verified bank/contract data
  | "USER_PROVIDED"        // Directly input by the user without third-party proof
  | "USER_ESTIMATE"        // User's forecast or subjective guess
  | "DERIVED_CALCULATION"  // 100% deterministic mathematical derivation
  | "ASSUMPTION"           // Heuristic, default industry benchmark, or model parameter
  | "EXTERNAL_DATA"        // Live benchmark (market APR, tax tables, inflation rate)
  | "UNKNOWN";             // Explicitly unentered, missing, or unquantifiable

export interface ClassifiedValue<T> {
  value: T;
  classification: InformationSourceClassification;
  confidenceLevel: number; // 0.0 (total uncertainty) to 1.0 (absolute certainty)
  sourceNotes?: string;
  provenancePath?: string;
  isUnknown?: boolean;
  isEstimate?: boolean;
  lastVerifiedAt?: string;
}

/** Helper factories for creating classified values */
export function createFact<T>(value: T, sourceNotes = "Verified fact"): ClassifiedValue<T> {
  return {
    value,
    classification: "VERIFIED_FACT",
    confidenceLevel: 1.0,
    sourceNotes,
    isUnknown: false,
    isEstimate: false,
    lastVerifiedAt: new Date().toISOString(),
  };
}

export function createUserProvided<T>(value: T, sourceNotes = "User provided"): ClassifiedValue<T> {
  return {
    value,
    classification: "USER_PROVIDED",
    confidenceLevel: 0.9,
    sourceNotes,
    isUnknown: false,
    isEstimate: false,
  };
}

export function createUserEstimate<T>(value: T, confidence = 0.6, sourceNotes = "User estimate"): ClassifiedValue<T> {
  return {
    value,
    classification: "USER_ESTIMATE",
    confidenceLevel: Math.max(0, Math.min(1, confidence)),
    sourceNotes,
    isUnknown: false,
    isEstimate: true,
  };
}

export function createAssumption<T>(value: T, sourceNotes = "Aimly default assumption", confidence = 0.5): ClassifiedValue<T> {
  return {
    value,
    classification: "ASSUMPTION",
    confidenceLevel: Math.max(0, Math.min(1, confidence)),
    sourceNotes,
    isUnknown: false,
    isEstimate: true,
  };
}

export function createDerived<T>(value: T, sourceNotes = "Derived calculation"): ClassifiedValue<T> {
  return {
    value,
    classification: "DERIVED_CALCULATION",
    confidenceLevel: 1.0,
    sourceNotes,
    isUnknown: false,
    isEstimate: false,
  };
}

export function createExternalData<T>(value: T, sourceNotes = "External benchmark"): ClassifiedValue<T> {
  return {
    value,
    classification: "EXTERNAL_DATA",
    confidenceLevel: 0.85,
    sourceNotes,
    isUnknown: false,
    isEstimate: false,
  };
}

export function createUnknown<T>(defaultValue: T, sourceNotes = "Unknown / Not provided"): ClassifiedValue<T> {
  return {
    value: defaultValue,
    classification: "UNKNOWN",
    confidenceLevel: 0.0,
    sourceNotes,
    isUnknown: true,
    isEstimate: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A. DECISION DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export type MasterDecisionCategory =
  | "BUY_SOMETHING"
  | "TAKE_A_LOAN"
  | "BUY_A_CAR"
  | "MOVE_HOME"
  | "INVEST"
  | "BUSINESS_EXPENSE"
  | "PAY_OFF_DEBT"
  | "CAREER_OR_EDUCATION"
  | "SUBSCRIPTION_OR_SERVICE"
  | "OTHER";

export type DecisionTimeHorizon =
  | "IMMEDIATE"      // < 1 month
  | "SHORT_TERM"     // 1 to 6 months
  | "MEDIUM_TERM"    // 6 to 24 months
  | "LONG_TERM"      // 2 to 5 years
  | "MULTI_YEAR";    // > 5 years

export type ReversibilityLevel =
  | "INSTANTLY_REVERSIBLE"    // Free return window, 100% refund possible
  | "FULLY_REVERSIBLE"        // Minor friction / re-sellable at minimal loss
  | "MODERATELY_REVERSIBLE"   // Re-sellable or cancellable with moderate penalty (10-30%)
  | "COSTLY_TO_REVERSE"       // Heavy depreciation, early termination fees (>30%)
  | "IRREVERSIBLE";           // Sunk cost, non-refundable capital expenditure

export interface DecisionDefinition {
  decision_id: string;
  decision_category: MasterDecisionCategory;
  proposed_action: string;
  decision_description: string;
  underlying_problem: string;
  underlying_goal: string;
  financial_amount: ClassifiedValue<number>;
  currency: CurrencyCode;
  recurring_amount: ClassifiedValue<number>;
  is_recurring: ClassifiedValue<boolean>;
  expected_benefit: string;
  deadline: string | null;
  decision_time_horizon: DecisionTimeHorizon;
  reversibility_level: ReversibilityLevel;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// C. FINANCIAL CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

export type IncomeStability =
  | "HIGHLY_STABLE"    // Guaranteed salary / civil service / long-term contract
  | "MODERATE"         // Standard private employment / established business
  | "VARIABLE"         // Freelance / commission / seasonal business
  | "VOLATILE"         // Early-stage startup / high variance earnings
  | "UNKNOWN";

export interface CurrencyExposure {
  primaryCurrency: CurrencyCode;
  foreignCurrencies?: CurrencyCode[];
  hasForeignExchangeRisk: boolean;
  exposureNotes?: string;
}

export interface FinancialContext {
  available_cash: ClassifiedValue<number>;
  liquid_savings: ClassifiedValue<number>;
  emergency_reserves: ClassifiedValue<number>;
  monthly_income: ClassifiedValue<number>;
  income_stability: ClassifiedValue<IncomeStability>;
  essential_expenses: ClassifiedValue<number>;
  discretionary_expenses: ClassifiedValue<number>;
  monthly_debt_payments: ClassifiedValue<number>;
  total_debt: ClassifiedValue<number>;
  upcoming_commitments: ClassifiedValue<number>;
  existing_assets: ClassifiedValue<number>;
  currency_exposure: ClassifiedValue<CurrencyExposure>;
  primary_goal?: {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    monthlyAllocation: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// D. DECISION ECONOMICS
// ─────────────────────────────────────────────────────────────────────────────

export interface DecisionEconomics {
  upfront_cost: ClassifiedValue<number>;
  recurring_cost: ClassifiedValue<number>;
  financing_cost: ClassifiedValue<number>;
  interest_rate: ClassifiedValue<number>;     // Annual rate percentage (e.g. 8.5)
  loan_duration: ClassifiedValue<number>;     // in months (e.g. 36)
  down_payment: ClassifiedValue<number>;
  fees: ClassifiedValue<number>;              // Origination, closing, transaction fees
  taxes: ClassifiedValue<number>;             // Sales tax, VAT, property tax
  insurance: ClassifiedValue<number>;         // Monthly or upfront mandatory insurance
  maintenance: ClassifiedValue<number>;       // Anticipated recurring upkeep
  hidden_costs: ClassifiedValue<number>;      // Ancillary equipment, onboarding, accessories
  expected_future_value: ClassifiedValue<number>;
  resale_value: ClassifiedValue<number>;
  expected_revenue: ClassifiedValue<number>;   // If income-generating asset
  expected_return: ClassifiedValue<number>;    // Expected ROI % or absolute gains
  opportunity_cost: ClassifiedValue<number>;   // Forgone capital returns or goal postponement cost
}

// ─────────────────────────────────────────────────────────────────────────────
// E. DECISION PRIORITIES (WEIGHTED INTENT)
// ─────────────────────────────────────────────────────────────────────────────

export interface DecisionPriorities {
  liquidity_preservation: number; // 0.0 to 1.0
  lowest_total_cost: number;
  lowest_monthly_payment: number;
  maximum_return: number;
  downside_protection: number;
  flexibility: number;
  speed: number;
  stability: number;
  growth: number;
  strategic_value: number;
  certainty: number;
  primary_priority_code:
    | "PROTECT_CASH"
    | "REACH_GOALS"
    | "LOW_MONTHLY"
    | "AVOID_DEBT"
    | "BUY_SOONER"
    | "MAXIMIZE_RETURN"
    | "FLEXIBILITY_FIRST";
}

// ─────────────────────────────────────────────────────────────────────────────
// F. ANALYSIS RESULTS
// ─────────────────────────────────────────────────────────────────────────────

export interface CashFlowAnalysisResult {
  baselineMonthlyNetInflow: number;
  baselineFreeCashFlow: number;
  postDecisionMonthlyOutflows: number;
  postDecisionFreeCashFlow: number;
  deltaFreeCashFlow: number;
  fcfBurnRatePercentage: number;
  monthsOfSurplusRemaining: number;
  isCashFlowNegative: boolean;
}

export interface AffordabilityAnalysisResult {
  isCashAffordableImmediately: boolean;
  isMonthlyAffordable: boolean;
  endingReservesAfterUpfront: number;
  postDecisionRunwayMonths: number;
  runwayMonthsLost: number;
  meetsEmergencyBufferStandard: boolean; // >= 3 months living expenses
  affordabilityStatus:
    | "COMFORTABLY_AFFORDABLE"
    | "AFFORDABLE_WITH_TIGHT_BUFFER"
    | "STRETCHES_CASH_FLOW"
    | "CRITICAL_RUNWAY_DEFICIT"
    | "COMPLETELY_UNSUSTAINABLE";
}

export interface TotalCostAnalysisResult {
  nominalPurchasePrice: number;
  totalFinancingInterest: number;
  totalFeesAndTaxes: number;
  totalLifetimeMaintenance: number;
  totalTrueLifetimeCost: number;
  hiddenCostRatio: number; // hidden costs / nominal price
}

export interface DecisionScenarioOption {
  id: string;
  code: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D";
  title: string;
  badge: string;
  description: string;
  upfrontOutflow: number;
  monthlyCommitment: number;
  totalLifetimeCost: number;
  postDecisionCash: number;
  postDecisionRunwayMonths: number;
  goalDelayDays: number;
  goalDelayMonths: number;
  isRecommended: boolean;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ScenarioAnalysisResult {
  options: DecisionScenarioOption[];
  recommendedOptionCode: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D";
  comparisonMatrix: {
    criteria: string;
    optionAValue: string;
    optionBValue: string;
    optionCValue: string;
  }[];
}

export interface SensitivityAnalysisResult {
  incomeShockResistance: {
    drop10PercentStatus: string;
    drop25PercentStatus: string;
    drop50PercentStatus: string;
  };
  interestRateSensitivity?: {
    rateUp200BpsCostDelta: number;
  };
  costOverrunImpact: {
    costPlus20PercentDelayDays: number;
  };
}

export interface OpportunityCostAnalysisResult {
  primaryGoalDelayDays: number;
  primaryGoalDelayMonths: number;
  equivalentMarketInvestmentGrowth10Y: number; // At benchmark 7% annual compound
  forgoneEmergencyBufferDays: number;
  narrativeTradeoff: string;
}

export interface ReversibilityAnalysisResult {
  level: ReversibilityLevel;
  exitStrategy: string;
  maximumSunkLossEstimate: number;
  timeToLiquidateDays: number;
  cancellationWindowDays: number;
}

export interface DownsideAnalysisResult {
  worstCaseScenarioHeadline: string;
  worstCaseCashRunwayMonths: number;
  warningSignalsToWatch: string[];
  catastrophicTriggerPoint: string;
}

export interface PreMortemItem {
  failureMode: string;
  likelihood: "LOW" | "MEDIUM" | "HIGH";
  severity: "MODERATE" | "SEVERE" | "FATAL";
  rootCause: string;
  earlyWarningSignal: string;
  preventionTactic: string;
}

export interface PreMortemAnalysisResult {
  headline: string;
  potentialFailureScenarios: PreMortemItem[];
}

export interface RedTeamReviewResult {
  harshCritique: string;
  blindSpotsIdentified: string[];
  optimismBiasWarning?: string;
  untestedAssumptions: string[];
  suggestedCheckBeforeSigning: string[];
}

export interface AlternativesAnalysisResult {
  alternativesConsidered: {
    title: string;
    description: string;
    estimatedSavings: number;
    pros: string[];
    cons: string[];
  }[];
  doNothingConsequences: string;
}

export interface FinalRecommendationResult {
  verdict: "RECOMMENDED" | "PROCEED_WITH_CAUTION" | "NOT_RECOMMENDED";
  headline: string;
  primaryReason: string;
  coreActionStep: string;
  contingencyTrigger: string;
  requiredPreConditions: string[];
}

export interface AnalysisResults {
  cash_flow_analysis?: CashFlowAnalysisResult;
  affordability_analysis?: AffordabilityAnalysisResult;
  total_cost_analysis?: TotalCostAnalysisResult;
  scenario_analysis?: ScenarioAnalysisResult;
  sensitivity_analysis?: SensitivityAnalysisResult;
  opportunity_cost_analysis?: OpportunityCostAnalysisResult;
  reversibility_analysis?: ReversibilityAnalysisResult;
  downside_analysis?: DownsideAnalysisResult;
  pre_mortem?: PreMortemAnalysisResult;
  red_team_review?: RedTeamReviewResult;
  alternatives_analysis?: AlternativesAnalysisResult;
  recommendation?: FinalRecommendationResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// G. CONFIDENCE, QUALITY & EPISTEMIC AUDIT
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfidenceAndQuality {
  data_completeness: number;      // 0 to 100 (% of required variables populated)
  data_quality: number;           // 0 to 100 (% of variables verified vs guessed)
  outcome_uncertainty: number;    // 0 (deterministic) to 100 (highly speculative)
  decision_robustness: number;    // 0 to 100 (resilience across negative shocks)
  analysis_confidence: number;    // 0 to 100 (mathematical engine modeling confidence)
  recommendation_confidence: number; // 0 to 100 (conviction of primary advice)
  
  audit: {
    factCount: number;
    userEstimateCount: number;
    assumptionCount: number;
    unknownCount: number;
    criticalUnknowns: string[];
    keyAssumptionsNeedingVerification: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DECISION INTELLIGENCE OBJECT
// ─────────────────────────────────────────────────────────────────────────────

export interface DecisionIntelligenceObject {
  version: "1.0.0";
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  definition: DecisionDefinition;
  context: FinancialContext;
  economics: DecisionEconomics;
  priorities: DecisionPriorities;
  analysis: AnalysisResults;
  confidence: ConfidenceAndQuality;
  metadata: {
    locale: "en" | "fr" | "es";
    engineVersion: string;
    generatedAt: string;
    lastModifiedAt: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY / INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

export function createBlankDecisionIntelligenceObject(params?: {
  id?: string;
  category?: MasterDecisionCategory;
  action?: string;
  currency?: CurrencyCode;
  locale?: "en" | "fr" | "es";
}): DecisionIntelligenceObject {
  const now = new Date().toISOString();
  const curr = params?.currency || "USD";
  const cat = params?.category || "BUY_SOMETHING";
  const action = params?.action || "Proposed Financial Decision";

  return {
    version: "1.0.0",
    stage: 1,
    definition: {
      decision_id: params?.id || `aimly-dec-${Date.now()}`,
      decision_category: cat,
      proposed_action: action,
      decision_description: "",
      underlying_problem: "",
      underlying_goal: "",
      financial_amount: createUserProvided(2000, "Initial input"),
      currency: curr,
      recurring_amount: createUnknown(0, "Not applicable / unentered"),
      is_recurring: createUserProvided(false),
      expected_benefit: "",
      deadline: null,
      decision_time_horizon: "SHORT_TERM",
      reversibility_level: "MODERATELY_REVERSIBLE",
      created_at: now,
      updated_at: now,
    },
    context: {
      available_cash: createFact(4840, "Baseline savings profile"),
      liquid_savings: createFact(4840, "Baseline liquid cash"),
      emergency_reserves: createFact(3000, "Target emergency fund"),
      monthly_income: createFact(4500, "Primary monthly salary"),
      income_stability: createFact("HIGHLY_STABLE", "Verified regular income"),
      essential_expenses: createFact(2300, "Monthly living expenses"),
      discretionary_expenses: createFact(400, "Discretionary budget"),
      monthly_debt_payments: createFact(0, "No active debt service"),
      total_debt: createFact(0, "No active debt balance"),
      upcoming_commitments: createFact(0, "No major upcoming annual bills"),
      existing_assets: createFact(4840, "Liquid cash balance"),
      currency_exposure: createFact({
        primaryCurrency: curr,
        hasForeignExchangeRisk: false,
      }),
      primary_goal: {
        id: "goal-1",
        title: "Business Launch & Financial Independence",
        targetAmount: 25000,
        currentAmount: 12000,
        targetDate: "2027-12-31",
        monthlyAllocation: 450,
      },
    },
    economics: {
      upfront_cost: createUserProvided(2000),
      recurring_cost: createUnknown(0),
      financing_cost: createUnknown(0),
      interest_rate: createAssumption(8.5, "Default market rate assumption"),
      loan_duration: createAssumption(36, "Standard loan tenure"),
      down_payment: createUserProvided(0),
      fees: createUnknown(0),
      taxes: createUnknown(0),
      insurance: createUnknown(0),
      maintenance: createUnknown(0),
      hidden_costs: createUnknown(0),
      expected_future_value: createUnknown(0),
      resale_value: createUnknown(0),
      expected_revenue: createUnknown(0),
      expected_return: createUnknown(0),
      opportunity_cost: createUnknown(0),
    },
    priorities: {
      liquidity_preservation: 0.8,
      lowest_total_cost: 0.7,
      lowest_monthly_payment: 0.4,
      maximum_return: 0.5,
      downside_protection: 0.9,
      flexibility: 0.6,
      speed: 0.3,
      stability: 0.85,
      growth: 0.6,
      strategic_value: 0.7,
      certainty: 0.8,
      primary_priority_code: "PROTECT_CASH",
    },
    analysis: {},
    confidence: {
      data_completeness: 75,
      data_quality: 80,
      outcome_uncertainty: 20,
      decision_robustness: 85,
      analysis_confidence: 90,
      recommendation_confidence: 85,
      audit: {
        factCount: 10,
        userEstimateCount: 2,
        assumptionCount: 2,
        unknownCount: 8,
        criticalUnknowns: [],
        keyAssumptionsNeedingVerification: ["Market interest rate at 8.5%"],
      },
    },
    metadata: {
      locale: params?.locale || "en",
      engineVersion: "2.0.0-PROMPT1",
      generatedAt: now,
      lastModifiedAt: now,
    },
  };
}
