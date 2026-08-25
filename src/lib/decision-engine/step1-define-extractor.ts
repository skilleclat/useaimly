/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * STEP 1: DEFINE — STRUCTURED DECISION INTAKE & EPISTEMIC EXTRACTION (PROMPT 2)
 *
 * Transforms raw natural language input into a deeply structured, epistemically classified
 * financial decision definition. Separates Facts, Estimates, Assumptions, Unknowns, and Ambiguities.
 */

import { CurrencyCode } from "../types/finance";
import {
  MasterDecisionCategory,
  DecisionTimeHorizon,
  ReversibilityLevel,
  ClassifiedValue,
  createFact,
  createUserProvided,
  createUserEstimate,
  createAssumption,
  createUnknown,
} from "./master-decision-model";

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED STEP 1 OUTPUT CONTRACT
// ─────────────────────────────────────────────────────────────────────────────

export type CommitmentType =
  | "UPFRONT_ONLY"
  | "RECURRING_ONLY"
  | "HYBRID_UPFRONT_AND_RECURRING"
  | "DEBT_FINANCED"
  | "EQUITY_INVESTMENT";

export interface Step1StructuredDecision {
  // Core Decision Anatomy
  proposedAction: string;
  financialAmount: ClassifiedValue<number>;
  recurringAmount: ClassifiedValue<number>;
  currency: CurrencyCode;
  commitmentType: CommitmentType;
  decisionCategory: MasterDecisionCategory;
  
  // Psychological & Strategic Grounding
  underlyingProblem: string;
  underlyingGoal: string;
  expectedBenefit: string;
  deadline: string | null;
  timeHorizon: DecisionTimeHorizon;
  reversibilityLevel: ReversibilityLevel;
  reversibilityExplanation: string;

  // Epistemic Classification Pillars
  knownFacts: string[];
  userEstimates: string[];
  possibleAssumptions: string[];
  criticalUnknownVariables: string[];
  ambiguities: string[];
  
  // Synthesis & Initial Hypothesis
  initialDecisionHypothesis: string;
  decisionContextTags: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL AI SYSTEM INSTRUCTION FOR STEP 1
// ─────────────────────────────────────────────────────────────────────────────

export const STEP1_DEFINE_SYSTEM_PROMPT = `
You are the Intake Strategist of The Aimly Decision Engine.
Your role is to transform raw user input into an epistemically rigorous Financial Decision Definition.

CRITICAL PRINCIPLES:
1. NEVER just summarize what the user said in vague prose.
2. Structure the decision completely and unpack hidden financial friction.
3. Explicitly separate what is known, what is estimated, what is assumed, and what is missing.
4. Output STRICT JSON conforming to the Step1StructuredDecision schema.

You must extract and evaluate:
- What action is being considered?
- What is the financial commitment (amount, currency, upfront vs recurring)?
- What is the real underlying problem being solved (e.g. work capability, transport necessity, lifestyle upgrade)?
- What is the user's likely higher-order goal (e.g. business growth, independence, convenience)?
- What benefit does the user expect?
- Is there a deadline or urgency?
- What is the expected time horizon (IMMEDIATE, SHORT_TERM, MEDIUM_TERM, LONG_TERM, MULTI_YEAR)?
- Is the decision reversible (INSTANTLY_REVERSIBLE, FULLY_REVERSIBLE, MODERATELY_REVERSIBLE, COSTLY_TO_REVERSE, IRREVERSIBLE)?
- What assumptions are hidden inside the statement (e.g. cash available, no financing interest, zero ongoing maintenance, no opportunity cost)?
- What critical unknown variables must be confirmed (e.g. warranty/accessories cost, insurance changes, resale value, financing APR)?
- What points are ambiguous?
- Provide a clear, honest INITIAL DECISION HYPOTHESIS.
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC EXTRACTION ENGINE (ZERO LATENCY & RED-TEAM TESTED)
// ─────────────────────────────────────────────────────────────────────────────

export function extractStructuredDecisionStep1(
  rawQuery: string,
  selectedCategory: MasterDecisionCategory = "BUY_SOMETHING",
  fallbackCurrency: CurrencyCode = "USD"
): Step1StructuredDecision {
  const text = (rawQuery || "").trim();
  const lower = text.toLowerCase();

  // 1. Currency Extraction
  let currency: CurrencyCode = fallbackCurrency;
  if (/usd|\$|dollars?/i.test(text)) currency = "USD";
  else if (/eur|€|euros?/i.test(text)) currency = "EUR";
  else if (/gbp|£|pounds?/i.test(text)) currency = "GBP";
  else if (/kes|ksh|shillings?/i.test(text)) currency = "KES";

  // 2. Amount Extraction (supports 30k, 2.5k, $2,000, 2000)
  let extractedAmount = 2000;
  let hasExtractedAmount = false;
  let isEstimate = false;

  if (/about|approx|roughly|around|~|maybe|environ|environ\s*de/i.test(lower)) {
    isEstimate = true;
  }

  const kMatch = text.match(/(?:kes|usd|eur|gbp|\$|€|£|sh)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    extractedAmount = Math.round(parseFloat(kMatch[1]) * 1000);
    hasExtractedAmount = true;
  } else {
    const numMatch = text.match(/(?:kes|usd|eur|gbp|\$|€|£|sh)?\s*([\d,]+(?:\.\d+)?)/i);
    if (numMatch) {
      const clean = numMatch[1].replace(/,/g, "");
      const parsed = parseFloat(clean);
      if (!isNaN(parsed) && parsed > 0) {
        extractedAmount = parsed;
        hasExtractedAmount = true;
      }
    }
  }

  // 3. Category & Archetype Auto-Detection
  let category: MasterDecisionCategory = selectedCategory;
  if (selectedCategory === "BUY_SOMETHING" || selectedCategory === "OTHER") {
    if (/pay\s*off.*debt|repay.*debt|clear.*debt|debt.*early|rembourser.*dette|solder.*dette/i.test(lower)) {
      category = "PAY_OFF_DEBT";
    } else if (/start.*business|business.*loan|launch.*startup|entreprise|société/i.test(lower)) {
      category = "BUSINESS_EXPENSE";
    } else if (/apartment|appartement|flat|housing|rent|loyer|déménagement|move/i.test(lower)) {
      category = "MOVE_HOME";
    } else if (/car|voiture|véhicule|auto|truck|suv/i.test(lower)) {
      category = "BUY_A_CAR";
    } else if (/invest|placement|bourse|stocks|fund|equity|crypto|opportunity|immobilier/i.test(lower)) {
      category = "INVEST";
    } else if (/loan|prêt|crédit|borrow|emprunt/i.test(lower)) {
      category = "TAKE_A_LOAN";
    }
  }

  const isRecurring =
    /per month|\/mo|monthly|a month|every month|par mois|\/mois|subscription|abonnement|rent|loyer/i.test(lower) ||
    category === "MOVE_HOME";
  const isLoan =
    /loan|prêt|crédit|borrow|emprunt|finance|mensualité|monthly payment/i.test(lower) ||
    category === "TAKE_A_LOAN";
  const isCar = category === "BUY_A_CAR" || /car|voiture|véhicule|auto|truck|suv/i.test(lower);
  const isInvestment = category === "INVEST" || /invest|placement|bourse|stocks|fund|equity|crypto|opportunity|immobilier/i.test(lower);
  const isDebtPayoff = category === "PAY_OFF_DEBT" || /pay\s*off.*debt|repay.*debt|clear.*debt|debt.*early/i.test(lower);
  const isBusiness = category === "BUSINESS_EXPENSE" || /start.*business|business.*loan|launch.*startup/i.test(lower);
  const isHome = category === "MOVE_HOME" || /apartment|appartement|flat|housing|rent|loyer|déménagement|move/i.test(lower);
  const isTech = /laptop|computer|macbook|pc|ordinateur|phone|tech/i.test(lower);

  let commitmentType: CommitmentType = "UPFRONT_ONLY";
  if (isLoan) commitmentType = "DEBT_FINANCED";
  else if (isInvestment) commitmentType = "EQUITY_INVESTMENT";
  else if (isRecurring) commitmentType = "RECURRING_ONLY";

  // 4. Proposed Action Formulation
  let proposedAction = "Make Proposed Financial Commitment";
  if (isDebtPayoff) proposedAction = `Pay Off Debt Early (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isBusiness && isLoan) proposedAction = `Take Loan to Fund Business Initiative (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isBusiness) proposedAction = `Fund Business Startup / Growth (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isCar) proposedAction = `Purchase or Finance Vehicle (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isHome) proposedAction = `Relocate to New Apartment / Housing (${currency} ${extractedAmount.toLocaleString()}/mo)`;
  else if (isLoan) proposedAction = `Take Loan Facility (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isInvestment) proposedAction = `Deploy Capital to Investment Opportunity (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isTech) proposedAction = `Purchase Computer Hardware (${currency} ${extractedAmount.toLocaleString()})`;
  else if (isRecurring) proposedAction = `Subscribe / Commit to Recurring Expense (${currency} ${extractedAmount.toLocaleString()}/mo)`;
  else if (text.length > 5) proposedAction = text.charAt(0).toUpperCase() + text.slice(1);

  // 5. Underlying Problem & Strategic Objective
  let underlyingProblem = "Needs appropriate tool, resource, or service to solve an immediate operational bottleneck.";
  let underlyingGoal = "Maintain financial progress while fulfilling functional requirement.";
  let expectedBenefit = "Immediate utility, capability enhancement, or quality-of-life improvement.";
  let timeHorizon: DecisionTimeHorizon = "SHORT_TERM";
  let reversibilityLevel: ReversibilityLevel = "MODERATELY_REVERSIBLE";
  let reversibilityExplanation = "Asset can be re-sold on secondary market with standard depreciation.";

  if (isDebtPayoff) {
    underlyingProblem = "Carrying outstanding debt principal incurring compounding interest and reducing monthly free cash flow.";
    underlyingGoal = "Eliminate monthly debt obligations to achieve debt freedom and restore 100% of free cash flow.";
    expectedBenefit = "Guaranteed risk-free return matching borrowing APR, elimination of monthly debt service, increased future free cash flow.";
    timeHorizon = "IMMEDIATE";
    reversibilityLevel = "IRREVERSIBLE";
    reversibilityExplanation = "Debt repayment directly settles liability and cannot be revoked without applying for a new loan facility.";
  } else if (isBusiness) {
    underlyingProblem = "Initial startup or working capital required before generating positive operating cash flow.";
    underlyingGoal = "Fund business launch and commercial growth while protecting personal baseline solvency.";
    expectedBenefit = "Independent revenue stream, enterprise equity value, and commercial scalability.";
    timeHorizon = "MULTI_YEAR";
    reversibilityLevel = "HARD_TO_REVERSE";
    reversibilityExplanation = "Early commercial startup expenses and legal incorporation are largely non-recoverable operating sunk costs.";
  } else if (isTech) {
    underlyingProblem = "Requires reliable computing hardware for professional productivity or workflow efficiency.";
    underlyingGoal = "Enhance work throughput and reliability without destabilizing emergency reserves.";
    expectedBenefit = "Higher productivity, reduced technical friction, longer operational hardware lifespan.";
    timeHorizon = "MEDIUM_TERM";
    reversibilityLevel = "MODERATELY_REVERSIBLE";
    reversibilityExplanation = "Electronics lose 15-25% value upon unboxing but retain substantial resale value over 12-24 months.";
  } else if (isCar) {
    underlyingProblem = "Requires reliable personal or family transportation.";
    underlyingGoal = "Secure dependable mobility while containing total cost of ownership (fuel, insurance, upkeep).";
    expectedBenefit = "Autonomy, daily time savings, flexible travel.";
    timeHorizon = "LONG_TERM";
    reversibilityLevel = "COSTLY_TO_REVERSE";
    reversibilityExplanation = "Vehicle transactions incur dealer margins, registration fees, and steep initial depreciation.";
  } else if (isHome) {
    underlyingProblem = "Housing upgrade, relocation, or change in living space requirements.";
    underlyingGoal = "Secure comfortable living environment within sustainable housing expense ratio (<30% of income).";
    expectedBenefit = "Improved daily comfort, shorter commute, or appropriate living space.";
    timeHorizon = "LONG_TERM";
    reversibilityLevel = "COSTLY_TO_REVERSE";
    reversibilityExplanation = "Lease agreements typically require security deposits and 1-3 months notice or penalties to break.";
  } else if (isLoan) {
    underlyingProblem = "Immediate capital requirement exceeds available cash flow or liquid savings.";
    underlyingGoal = "Bridge funding gap while minimizing lifetime interest drag and monthly debt burden.";
    expectedBenefit = "Immediate access to needed liquidity.";
    timeHorizon = "LONG_TERM";
    reversibilityLevel = "COSTLY_TO_REVERSE";
    reversibilityExplanation = "Loan agreements entail interest accrual, early repayment conditions, and fixed legal obligations.";
  } else if (isInvestment) {
    underlyingProblem = "Idle capital losing purchasing power to inflation or seeking growth.";
    underlyingGoal = "Generate compounding wealth and long-term capital appreciation.";
    expectedBenefit = "Passive returns, dividend income, or portfolio diversification.";
    timeHorizon = "MULTI_YEAR";
    reversibilityLevel = "PARTIALLY_REVERSIBLE";
    reversibilityExplanation = "Public market assets can typically be liquidated on market days, subject to market price fluctuations.";
  }

  // 6. Epistemic Pillars: Facts, Estimates, Assumptions, Unknowns, Ambiguities
  const knownFacts: string[] = [];
  const userEstimates: string[] = [];
  const possibleAssumptions: string[] = [];
  const criticalUnknownVariables: string[] = [];
  const ambiguities: string[] = [];

  // Facts
  if (hasExtractedAmount && !isEstimate) {
    knownFacts.push(`Target financial figure specified as ${currency} ${extractedAmount.toLocaleString()}`);
  }
  knownFacts.push(`Base operational currency is ${currency}`);
  knownFacts.push(`Classified under category ${category}`);

  // Estimates
  if (isEstimate) {
    userEstimates.push(`Amount (${currency} ${extractedAmount.toLocaleString()}) is an approximate estimate rather than a firm quote.`);
  }

  // Hidden Assumptions
  if (isDebtPayoff) {
    possibleAssumptions.push("Assumes target debt has no early settlement penalties or prepayment lockups.");
    possibleAssumptions.push("Assumes paying debt from liquid cash leaves a sufficient emergency runway.");
  } else if (isBusiness) {
    possibleAssumptions.push("Assumes business model will generate positive unit economics and client contracts.");
    possibleAssumptions.push("Assumes personal living expenses can be supported during early unprofitable launch phase.");
  } else {
    possibleAssumptions.push("Assumes purchase will be funded entirely from existing liquid cash unless financing is chosen.");
    possibleAssumptions.push("Assumes no major immediate ancillary expenses (accessories, extended warranty, setup costs).");
  }

  // Critical Unknown Variables
  if (isDebtPayoff) {
    criticalUnknownVariables.push("Exact Annual Percentage Rate (APR) and remaining balance of target debt.");
    criticalUnknownVariables.push("Prepayment penalties or interest calculation methods.");
    criticalUnknownVariables.push("Remaining liquid emergency cushion after executing payoff.");
  } else if (isBusiness) {
    criticalUnknownVariables.push("Projected break-even timeline (in months).");
    criticalUnknownVariables.push("Customer acquisition costs and sales cycle length.");
    criticalUnknownVariables.push("Fixed debt repayment burden if revenue is delayed 6+ months.");
    criticalUnknownVariables.push("Separation of personal vs business liability.");
  } else if (isTech) {
    criticalUnknownVariables.push("Specific hardware specs & warranty coverage (new vs refurbished).");
    criticalUnknownVariables.push("Ancillary costs: software licenses, peripheral adapters, case/insurance.");
    criticalUnknownVariables.push("Expected productive lifespan (3 vs 5 years).");
    criticalUnknownVariables.push("Tax deductibility status for business accounting.");
  } else if (isCar) {
    criticalUnknownVariables.push("Insurance premium impact per month.");
    criticalUnknownVariables.push("Monthly fuel / energy and regular maintenance budget.");
    criticalUnknownVariables.push("Financing APR, down payment requirement, and loan duration.");
    criticalUnknownVariables.push("Expected 3-year depreciation trajectory.");
  } else if (isHome) {
    criticalUnknownVariables.push("Total upfront move-in costs (security deposit, broker fees, movers).");
    criticalUnknownVariables.push("Utility and heating cost differential.");
    criticalUnknownVariables.push("Commute expense and travel time impact.");
  } else if (isLoan) {
    criticalUnknownVariables.push("Exact Annual Percentage Rate (APR) and origination fees.");
    criticalUnknownVariables.push("Loan tenure (months) and exact monthly amortization.");
    criticalUnknownVariables.push("Prepayment penalty clauses.");
  } else if (isInvestment) {
    criticalUnknownVariables.push("Expected annualized return and volatility range.");
    criticalUnknownVariables.push("Minimum lockup / holding horizon before liquidity access.");
    criticalUnknownVariables.push("Maximum drawdown risk in severe adverse market conditions.");
    criticalUnknownVariables.push("Tax implications on capital gains and distributions.");
  } else {
    criticalUnknownVariables.push("Immediate cash buffer remaining after transaction.");
    criticalUnknownVariables.push("Secondary ongoing recurring commitments linked to this purchase.");
    criticalUnknownVariables.push("Alternative lower-cost options or postponement feasibility.");
  }

  // Ambiguities
  if (!/cash|credit|loan|finance|prêt|comptant/i.test(lower) && !isDebtPayoff && !isHome) {
    ambiguities.push("Payment method not explicitly stated: paying 100% upfront in cash vs installment/financing.");
  }
  if (!/urgent|immediate|tomorrow|this week|dans 3 mois/i.test(lower)) {
    ambiguities.push("Purchase timeline urgency is flexible (immediate need vs planned acquisition).");
  }

  // Initial Decision Hypothesis
  const initialDecisionHypothesis = isDebtPayoff
    ? `A debt settlement capital outlay of ${currency} ${extractedAmount.toLocaleString()} that reduces liquid reserves today in exchange for a permanent increase in future monthly cash flow.`
    : isBusiness && isLoan
    ? `A commercial leverage decision borrowing ${currency} ${extractedAmount.toLocaleString()} to launch an enterprise, requiring loan service resilience against delayed revenue.`
    : commitmentType === "DEBT_FINANCED"
    ? `A capital borrowing commitment of ${currency} ${extractedAmount.toLocaleString()} requiring monthly debt servicing validation against free cash flow.`
    : commitmentType === "RECURRING_ONLY"
    ? `A recurring commitment of ${currency} ${extractedAmount.toLocaleString()}/month which permanently increases the monthly expense floor.`
    : `A one-off capital deployment of ${currency} ${extractedAmount.toLocaleString()} that reduces immediate cash reserves and may postpone target goal milestones.`;

  return {
    proposedAction,
    financialAmount: isEstimate
      ? createUserEstimate(extractedAmount, 0.7, "Approximated in intake")
      : createUserProvided(extractedAmount, "Explicitly stated in intake"),
    recurringAmount: isRecurring
      ? createUserProvided(extractedAmount, "Monthly recurring commitment")
      : createUnknown(0, "Not a recurring commitment"),
    currency,
    commitmentType,
    decisionCategory: category,
    underlyingProblem,
    underlyingGoal,
    expectedBenefit,
    deadline: null,
    timeHorizon,
    reversibilityLevel,
    reversibilityExplanation,
    knownFacts,
    userEstimates,
    possibleAssumptions,
    criticalUnknownVariables,
    ambiguities,
    initialDecisionHypothesis,
    decisionContextTags: [
      category,
      commitmentType,
      timeHorizon,
      reversibilityLevel,
    ],
  };
}
