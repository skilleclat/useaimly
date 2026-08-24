import { BaselineFinancialProfile } from "../finance";
import { CurrencyCode } from "../types/finance";

export type CanonicalTransactionType =
  | "ONE_TIME_EXPENSE"
  | "RECURRING_EXPENSE"
  | "LOAN_OR_DEBT"
  | "FINANCED_PURCHASE"
  | "INVESTMENT"
  | "DEBT_PAYOFF"
  | "PURCHASE_FUNDING";

export interface DecisionInputParameters {
  title: string;
  category: string;
  transactionType?: CanonicalTransactionType;
  totalAmount: number;
  downPayment?: number;
  loanTermMonths?: number;
  annualInterestRatePercent?: number;
  customMonthlyPayment?: number;
  isRecurring?: boolean;
  currency: CurrencyCode;
  priority?: "PROTECT_CASH" | "REACH_GOALS" | "LOW_MONTHLY" | "AVOID_DEBT" | "BUY_SOONER";
}

export interface ScenarioFundingLedger {
  openingCashReserves: number;
  monthlyNetInflow: number;
  baselineLivingExpenses: number;
  baselineDebtService: number;
  baselineFreeCashFlow: number;
  scenarioMonthlyRecurringCommitment: number;
  postDecisionMonthlyExpenses: number;
  postDecisionFreeCashFlow: number;
  monthlyGoalAllocation: number;
  monthlyDecisionSavings: number;
  unallocatedMonthlyCash: number;
  waitDaysRequired: number;
  accumulatedDecisionSavings: number;
  outflowFromExistingReserves: number;
  endingCashReserves: number;
  endingEmergencyRunwayMonths: number;
  goalDelayDays: number;
  moneyConservationPassed: boolean;
  provenanceExplanation: string;
}

export interface ScenarioImpactResult {
  id: string;
  code: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D";
  title: string;
  badge: string;
  description: string;
  modelType: CanonicalTransactionType;
  amount: number;
  downPayment: number;
  principalFinanced: number;
  loanTermMonths: number;
  annualRatePercent: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalCostOverTime: number;
  immediateCashOutflow: number;
  postDecisionCash: number;
  deltaCash: number;
  newMonthlyObligation: number;
  postDecisionMonthlyExpenses: number;
  postDecisionFreeCashFlow: number;
  deltaFreeCashFlow: number;
  fcfPercentageShift: number;
  postDecisionRunwayMonths: number;
  deltaRunwayMonths: number;
  goalDelayDays: number;
  goalDelayMonths: number;
  goalStatus: "ON_TRACK" | "DELAYED" | "GOAL_FUNDING_PAUSED";
  goalExplanation: string;
  ledger: ScenarioFundingLedger;
  isRecommended: boolean;
  rankingScore: number;
  reasons: string[];
}

export interface FinancingSummary {
  hasFinancing: boolean;
  principalBorrowed: number;
  downPayment: number;
  annualInterestRatePercent: number;
  loanTermMonths: number;
  paymentFrequency: string;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalLifetimeCost: number;
  isAssumedTerms: boolean;
  aprSourceExplanation: string;
}

export interface CategorizedAssumptions {
  confirmedUserBaseline: string[];
  aimlySafetyThresholds: string[];
  scenarioAllocationMechanics: string[];
  financingAssumptions: string[];
}

export interface CanonicalDecisionAnalysis {
  analysisId: string;
  timestamp: string;
  currency: CurrencyCode;
  inputs: DecisionInputParameters;
  transactionType: CanonicalTransactionType;

  // Baseline Financial Snapshot
  baseline: {
    liquidSavings: number;
    monthlyIncome: number;
    monthlyLivingExpenses: number;
    monthlyDebtService: number;
    totalMonthlyOutflows: number;
    netFreeCashFlow: number;
    emergencyRunwayMonths: number;
    primaryGoal: {
      id: string;
      title: string;
      targetAmount: number;
      currentAmount: number;
      targetDate: string;
      monthlyAllocation: number;
      monthsToTarget: number;
    };
  };

  // Financing Summary
  financing: FinancingSummary;

  // Primary Impact (Option A - As Proposed)
  primaryImpact: ScenarioImpactResult;

  // Scenarios
  scenarios: {
    optionA: ScenarioImpactResult;
    optionB: ScenarioImpactResult;
    optionC: ScenarioImpactResult;
    optionD?: ScenarioImpactResult;
  };

  // Exactly ONE Canonical Recommendation
  recommendation: {
    recommendedScenarioId: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D";
    recommendedScenarioTitle: string;
    actionPlanStep1: string;
    actionPlanStep2: string;
    actionPlanStep3: string;
    reasons: string[];
  };

  // Verdict
  verdict: {
    decision: "RECOMMENDED" | "PROCEED_WITH_CAUTION" | "NOT_RECOMMENDED";
    headline: string;
    primaryReason: string;
    dominantConsequence: string;
  };

  // Categorized & Filtered Material Assumptions
  assumptions: string[];
  categorizedAssumptions: CategorizedAssumptions;
  isAssumedLoanTerms: boolean;
}

/**
 * Standard Loan Amortization (Deterministic PMT Formula)
 */
export function calculateMonthlyLoanPayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number
): { monthlyPayment: number; totalInterest: number; totalCost: number } {
  if (principal <= 0 || termMonths <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalCost: 0 };
  }

  if (annualRatePercent <= 0) {
    const monthlyPayment = Math.round((principal / termMonths) * 100) / 100;
    return {
      monthlyPayment,
      totalInterest: 0,
      totalCost: principal,
    };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment =
    Math.round((principal * ((monthlyRate * factor) / (factor - 1))) * 100) / 100;
  const totalCost = Math.round(monthlyPayment * termMonths * 100) / 100;
  const totalInterest = Math.max(0, Math.round((totalCost - principal) * 100) / 100);

  return { monthlyPayment, totalInterest, totalCost };
}

/**
 * DETERMINISTIC CANONICAL DECISION EVALUATOR (STRICT DOMAIN MODELING)
 */
export function evaluateCanonicalDecision(
  baselineProfile: BaselineFinancialProfile,
  inputs: DecisionInputParameters
): CanonicalDecisionAnalysis {
  const {
    title,
    category,
    totalAmount,
    currency,
    priority = "PROTECT_CASH",
  } = inputs;

  // 1. RECONCILE BASELINE SNAPSHOT
  const monthlyIncome = baselineProfile.incomes.reduce((acc, i) => acc + i.amount, 0);
  const monthlyLivingExpenses = baselineProfile.expenses.reduce((acc, e) => acc + e.amount, 0);
  const monthlyDebtService = baselineProfile.debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
  const totalMonthlyOutflows = monthlyLivingExpenses + monthlyDebtService;
  const netFreeCashFlow = Math.round(Math.max(0, monthlyIncome - totalMonthlyOutflows) * 100) / 100;
  const emergencyRunwayMonths =
    monthlyLivingExpenses > 0
      ? Math.round((baselineProfile.liquidSavings / monthlyLivingExpenses) * 10) / 10
      : 3.0;

  // Primary Goal Baseline
  const primaryGoalRaw = baselineProfile.goals[0] || {
    id: "primary-goal",
    title: "Business Launch Goal",
    targetAmount: 25000,
    currentAmount: 12000,
    targetDate: "2027-12-31",
  };

  const goalRemaining = Math.max(0, primaryGoalRaw.targetAmount - primaryGoalRaw.currentAmount);
  const baselineGoalMonthlyAllocation = Math.min(
    netFreeCashFlow,
    Math.max(100, Math.min(990, Math.round(netFreeCashFlow * 0.45)))
  );
  const baselineMonthsToTarget =
    baselineGoalMonthlyAllocation > 0 ? Math.ceil(goalRemaining / baselineGoalMonthlyAllocation) : 24;

  const baselineData = {
    liquidSavings: baselineProfile.liquidSavings,
    monthlyIncome,
    monthlyLivingExpenses,
    monthlyDebtService,
    totalMonthlyOutflows,
    netFreeCashFlow,
    emergencyRunwayMonths,
    primaryGoal: {
      id: primaryGoalRaw.id,
      title: primaryGoalRaw.title,
      targetAmount: primaryGoalRaw.targetAmount,
      currentAmount: primaryGoalRaw.currentAmount,
      targetDate: primaryGoalRaw.targetDate,
      monthlyAllocation: baselineGoalMonthlyAllocation,
      monthsToTarget: baselineMonthsToTarget,
    },
  };

  // 2. STRICT DETERMINATION OF CANONICAL TRANSACTION TYPE
  let transactionType: CanonicalTransactionType = inputs.transactionType || "PURCHASE_FUNDING";

  if (
    inputs.isRecurring ||
    category === "MOVE_HOME" ||
    title.toLowerCase().includes("rent") ||
    title.toLowerCase().includes("subscription") ||
    title.toLowerCase().includes("monthly") ||
    title.toLowerCase().includes("salary")
  ) {
    transactionType = "RECURRING_EXPENSE";
  } else if (
    category === "TAKE_A_LOAN" ||
    title.toLowerCase().includes("loan") ||
    title.toLowerCase().includes("borrow")
  ) {
    transactionType = "LOAN_OR_DEBT";
  } else if (inputs.downPayment && inputs.downPayment > 0 && inputs.downPayment < totalAmount) {
    transactionType = "FINANCED_PURCHASE";
  } else if (category === "INVEST") {
    transactionType = "INVESTMENT";
  } else if (category === "PAY_OFF_DEBT") {
    transactionType = "DEBT_PAYOFF";
  } else {
    transactionType = "ONE_TIME_EXPENSE";
  }

  // Determine Financing Parameters
  const isLoanOrFinanced = transactionType === "LOAN_OR_DEBT" || transactionType === "FINANCED_PURCHASE";
  const userProvidedAPR = inputs.annualInterestRatePercent !== undefined;
  const annualRate = inputs.annualInterestRatePercent ?? 8.5;
  const termMonths = inputs.loanTermMonths || 36;
  const isAssumedLoanTerms = isLoanOrFinanced && !userProvidedAPR;

  const aprSourceExplanation = userProvidedAPR
    ? `User-confirmed financing terms (${annualRate}% APR fixed).`
    : `Standard European Consumer Credit Benchmark (${annualRate}% APR over ${termMonths} months).`;

  // Available Cash Flow after Goal Allocation for Discretionary Pre-Saving
  const availableForDecisionSavingsPerMonth = Math.max(0, netFreeCashFlow - baselineGoalMonthlyAllocation);

  // 3. FINANCIAL SCENARIO BUILDER WITH STRICT DOMAIN MODEL LOGIC
  function buildScenario(
    code: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D",
    title: string,
    badge: string,
    desc: string,
    model: CanonicalTransactionType,
    amount: number,
    downPayment: number,
    term: number,
    rate: number,
    monthlyGoalContrib: number,
    monthlyDecisionSavings: number,
    waitDays: number
  ): ScenarioImpactResult {
    let immediateCashOutflow = 0;
    let newMonthlyObligation = 0;
    let principalFinanced = 0;
    let totalInterestPaid = 0;
    let totalCostOverTime = amount;
    let postDecisionMonthlyExpenses = baselineData.totalMonthlyOutflows;
    let postDecisionFreeCashFlow = baselineData.netFreeCashFlow;
    let accumulatedDecisionSavings = 0;
    let provenanceExplanation = "";

    // ─────────────────────────────────────────────────────────────
    // DOMAIN MODEL A: RECURRING EXPENSE (Rent, Subscriptions)
    // ─────────────────────────────────────────────────────────────
    if (model === "RECURRING_EXPENSE") {
      immediateCashOutflow = downPayment; // Only deposit/initial fee leaves reserves, NOT full recurring amount!
      newMonthlyObligation = amount; // Full recurring amount added to monthly living expenses
      principalFinanced = 0;
      totalCostOverTime = amount * 12; // 1-year baseline commitment
      postDecisionMonthlyExpenses = Math.round((baselineData.totalMonthlyOutflows + amount) * 100) / 100;
      postDecisionFreeCashFlow = Math.round(Math.max(0, baselineData.monthlyIncome - postDecisionMonthlyExpenses) * 100) / 100;
      provenanceExplanation = `Recurring commitment of ${amount} ${currency}/mo added to monthly living expenses. Cash reserves unchanged (0 initial outflow).`;
    }

    // ─────────────────────────────────────────────────────────────
    // DOMAIN MODEL B: LOAN OR DEBT / FINANCED PURCHASE
    // ─────────────────────────────────────────────────────────────
    else if (model === "LOAN_OR_DEBT" || model === "FINANCED_PURCHASE") {
      immediateCashOutflow = downPayment;
      principalFinanced = Math.max(0, amount - downPayment);
      const loan = calculateMonthlyLoanPayment(principalFinanced, rate, term);
      newMonthlyObligation = loan.monthlyPayment;
      totalInterestPaid = loan.totalInterest;
      totalCostOverTime = downPayment + loan.totalCost;
      postDecisionMonthlyExpenses = Math.round((baselineData.totalMonthlyOutflows + newMonthlyObligation) * 100) / 100;
      postDecisionFreeCashFlow = Math.round(Math.max(0, baselineData.monthlyIncome - postDecisionMonthlyExpenses) * 100) / 100;
      provenanceExplanation = `Financed ${principalFinanced} ${currency} at ${rate}% APR over ${term} mos. Down payment: ${downPayment} ${currency}. Monthly installment: ${newMonthlyObligation} ${currency}/mo.`;
    }

    // ─────────────────────────────────────────────────────────────
    // DOMAIN MODEL C: ONE-TIME EXPENSE / PURCHASE FUNDING
    // ─────────────────────────────────────────────────────────────
    else {
      if (waitDays > 0) {
        // Self-funded via cash flow accumulation over waitDays
        accumulatedDecisionSavings = amount; // Exact match to avoid residual drift
        immediateCashOutflow = 0; // 100% self-funded from cash flow, 0 reserve drain!
        newMonthlyObligation = 0;
        totalCostOverTime = amount;
        provenanceExplanation = `Self-funded ${amount} ${currency} via cash flow savings over ${waitDays} days. Zero reserve drain.`;
      } else {
        // Paid immediately from cash reserves
        immediateCashOutflow = amount;
        newMonthlyObligation = 0;
        totalCostOverTime = amount;
        provenanceExplanation = `Paid ${amount} ${currency} immediately from liquid cash reserves. Monthly cash flow unchanged.`;
      }
      postDecisionMonthlyExpenses = baselineData.totalMonthlyOutflows;
      postDecisionFreeCashFlow = baselineData.netFreeCashFlow;
    }

    // Cash Reserves & Runway Reconciliation
    const postDecisionCash = Math.round(Math.max(0, baselineData.liquidSavings - immediateCashOutflow) * 100) / 100;
    const deltaCash = Math.round((postDecisionCash - baselineData.liquidSavings) * 100) / 100;
    const deltaFreeCashFlow = Math.round((postDecisionFreeCashFlow - baselineData.netFreeCashFlow) * 100) / 100;

    const fcfPercentageShift =
      baselineData.netFreeCashFlow > 0
        ? Math.round((Math.abs(deltaFreeCashFlow) / baselineData.netFreeCashFlow) * 100)
        : 0;

    // Runway is calculated against NEW monthly living expenses (crucial for rent increases!)
    const effectiveLivingExpenses = model === "RECURRING_EXPENSE" ? baselineData.monthlyLivingExpenses + amount : baselineData.monthlyLivingExpenses;
    const postDecisionRunwayMonths =
      effectiveLivingExpenses > 0
        ? Math.round((postDecisionCash / effectiveLivingExpenses) * 10) / 10
        : 0;
    const deltaRunwayMonths = Math.round((postDecisionRunwayMonths - baselineData.emergencyRunwayMonths) * 10) / 10;

    // Goal Timeline & Explainability
    let goalDelayDays = 0;
    let goalDelayMonths = 0;
    let goalStatus: ScenarioImpactResult["goalStatus"] = "ON_TRACK";
    let goalExplanation = "";

    if (model === "RECURRING_EXPENSE") {
      if (postDecisionFreeCashFlow < baselineGoalMonthlyAllocation) {
        // Squeezes monthly goal funding
        const availableGoalFunding = Math.max(0, postDecisionFreeCashFlow);
        if (availableGoalFunding === 0) {
          goalStatus = "GOAL_FUNDING_PAUSED";
          goalDelayMonths = 12;
          goalDelayDays = 365;
          goalExplanation = `Recurring expense of ${amount} ${currency}/mo leaves only +${postDecisionFreeCashFlow} ${currency}/mo in free cash flow, pausing contributions to "${baselineData.primaryGoal.title}".`;
        } else {
          const postMonths = Math.ceil(goalRemaining / availableGoalFunding);
          goalDelayMonths = Math.max(0, postMonths - baselineMonthsToTarget);
          goalDelayDays = Math.min(365, goalDelayMonths * 30);
          goalStatus = goalDelayDays > 0 ? "DELAYED" : "ON_TRACK";
          goalExplanation = `Reduced monthly goal allocation (+${availableGoalFunding} ${currency}/mo vs baseline +${baselineGoalMonthlyAllocation} ${currency}/mo) shifts goal completion by +${goalDelayDays} days.`;
        }
      } else {
        goalStatus = "ON_TRACK";
        goalDelayDays = 0;
        goalExplanation = `Your goal "${baselineData.primaryGoal.title}" remains on schedule because remaining cash flow (+${postDecisionFreeCashFlow} ${currency}/mo) covers the required contribution (+${baselineGoalMonthlyAllocation} ${currency}/mo).`;
      }
    } else if (model === "LOAN_OR_DEBT" || model === "FINANCED_PURCHASE") {
      if (postDecisionFreeCashFlow < baselineGoalMonthlyAllocation) {
        const postMonths = Math.ceil(goalRemaining / Math.max(1, postDecisionFreeCashFlow));
        goalDelayMonths = Math.max(0, postMonths - baselineMonthsToTarget);
        goalDelayDays = Math.min(365, goalDelayMonths * 30);
        goalStatus = goalDelayDays > 0 ? "DELAYED" : "ON_TRACK";
        goalExplanation = `Loan payment of ${newMonthlyObligation} ${currency}/mo reduces goal contributions, shifting arrival by +${goalDelayDays} days.`;
      } else {
        goalStatus = "ON_TRACK";
        goalDelayDays = 0;
        goalExplanation = `Your goal "${baselineData.primaryGoal.title}" remains 100% on schedule because post-decision cash flow (+${postDecisionFreeCashFlow} ${currency}/mo) fully covers your goal allocation (+${baselineGoalMonthlyAllocation} ${currency}/mo).`;
      }
    } else {
      // One-time self-funded or cash purchase
      goalStatus = "ON_TRACK";
      goalDelayDays = 0;
      goalExplanation = `Your goal "${baselineData.primaryGoal.title}" remains on schedule with 0 days delay because monthly contributions (+${baselineGoalMonthlyAllocation} ${currency}/mo) continue uninterrupted.`;
    }

    // Conservation Verification
    const unallocatedMonthlyCash = Math.max(0, postDecisionFreeCashFlow - monthlyGoalContrib);
    const moneyConservationPassed =
      Math.abs(baselineData.liquidSavings - immediateCashOutflow - postDecisionCash) <= 0.01;

    const ledger: ScenarioFundingLedger = {
      openingCashReserves: baselineData.liquidSavings,
      monthlyNetInflow: monthlyIncome,
      baselineLivingExpenses: monthlyLivingExpenses,
      baselineDebtService: monthlyDebtService,
      baselineFreeCashFlow: netFreeCashFlow,
      scenarioMonthlyRecurringCommitment: newMonthlyObligation,
      postDecisionMonthlyExpenses,
      postDecisionFreeCashFlow,
      monthlyGoalAllocation: Math.min(postDecisionFreeCashFlow, monthlyGoalContrib),
      monthlyDecisionSavings,
      unallocatedMonthlyCash,
      waitDaysRequired: waitDays,
      accumulatedDecisionSavings,
      outflowFromExistingReserves: immediateCashOutflow,
      endingCashReserves: postDecisionCash,
      endingEmergencyRunwayMonths: postDecisionRunwayMonths,
      goalDelayDays,
      moneyConservationPassed,
      provenanceExplanation,
    };

    // Ranking Evaluation
    let rankingScore = 100;
    const reasons: string[] = [];

    if (postDecisionRunwayMonths < 2.0) {
      rankingScore -= 60;
      reasons.push(`Emergency buffer drops to ${postDecisionRunwayMonths} mos (below mandatory 2.0-month floor).`);
    } else if (postDecisionRunwayMonths >= 3.0) {
      rankingScore += 20;
      reasons.push(`Preserves a robust ${postDecisionRunwayMonths}-month emergency living buffer.`);
    } else {
      reasons.push(`Maintains emergency runway at ${postDecisionRunwayMonths} months.`);
    }

    if (model === "RECURRING_EXPENSE") {
      if (postDecisionFreeCashFlow < 500) {
        rankingScore -= 40;
        reasons.push(`Severely constrains recurring free cash flow (+${postDecisionFreeCashFlow} ${currency}/mo remaining).`);
      } else {
        reasons.push(`Leaves comfortable ongoing free cash flow (+${postDecisionFreeCashFlow} ${currency}/mo).`);
      }
    }

    if (goalDelayDays === 0) {
      rankingScore += 20;
      reasons.push(`Keeps "${baselineData.primaryGoal.title}" 100% on schedule.`);
    } else {
      rankingScore -= Math.min(25, Math.round(goalDelayDays / 15));
      reasons.push(`Shifts goal arrival by ${goalDelayDays} days.`);
    }

    if (priority === "PROTECT_CASH" && postDecisionRunwayMonths >= 2.0) rankingScore += 20;
    if (priority === "LOW_MONTHLY" && newMonthlyObligation === 0) rankingScore += 25;
    if (priority === "AVOID_DEBT" && totalInterestPaid === 0) rankingScore += 30;

    return {
      id: code,
      code,
      title,
      badge,
      description: desc,
      modelType: model,
      amount,
      downPayment,
      principalFinanced,
      loanTermMonths: term,
      annualRatePercent: rate,
      monthlyPayment: newMonthlyObligation,
      totalInterestPaid,
      totalCostOverTime,
      immediateCashOutflow,
      postDecisionCash,
      deltaCash,
      newMonthlyObligation,
      postDecisionMonthlyExpenses,
      postDecisionFreeCashFlow,
      deltaFreeCashFlow,
      fcfPercentageShift,
      postDecisionRunwayMonths,
      deltaRunwayMonths,
      goalDelayDays,
      goalDelayMonths,
      goalStatus,
      goalExplanation,
      ledger,
      isRecommended: false,
      rankingScore,
      reasons,
    };
  }

  // 4. GENERATE SCENARIOS DERIVED FROM CANONICAL TRANSACTION TYPE
  let optionA: ScenarioImpactResult;
  let optionB: ScenarioImpactResult;
  let optionC: ScenarioImpactResult;
  let optionD: ScenarioImpactResult;

  if (transactionType === "RECURRING_EXPENSE") {
    // OPTION A: Full Proposed Recurring Expense (+€1,800/mo)
    optionA = buildScenario(
      "OPTION_A",
      `Option A: Full Rent Adjustment (+${totalAmount} ${currency}/mo)`,
      "As Proposed",
      `Increases monthly living expenses by +${totalAmount} ${currency}/month.`,
      "RECURRING_EXPENSE",
      totalAmount,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      0,
      0
    );

    // OPTION B: Negotiated / Capped Adjustment (66% of proposed increase)
    const optBAmount = Math.round(totalAmount * 0.66);
    optionB = buildScenario(
      "OPTION_B",
      `Option B: Capped Adjustment (+${optBAmount} ${currency}/mo)`,
      "Aimly Recommended",
      `Negotiates or selects an option capped at +${optBAmount} ${currency}/mo to preserve goal compounding.`,
      "RECURRING_EXPENSE",
      optBAmount,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      0,
      0
    );

    // OPTION C: Moderate Alternative (50% of proposed increase)
    const optCAmount = Math.round(totalAmount * 0.5);
    optionC = buildScenario(
      "OPTION_C",
      `Option C: Moderate Alternative (+${optCAmount} ${currency}/mo)`,
      "Budget Alternative",
      `Reduces ongoing recurring commitment to +${optCAmount} ${currency}/month.`,
      "RECURRING_EXPENSE",
      optCAmount,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      0,
      0
    );

    // OPTION D: Maintain Current Rent / Relocate Later
    optionD = buildScenario(
      "OPTION_D",
      `Option D: Maintain Current Rent Baseline`,
      "Zero Impact",
      `Defers rent increase to protect emergency reserves and goal velocity.`,
      "RECURRING_EXPENSE",
      0,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      0,
      0
    );
  } else if (isLoanOrFinanced) {
    // Loan / Financing Archetype
    optionA = buildScenario(
      "OPTION_A",
      `Option A: Proceed with Financing (${totalAmount} ${currency})`,
      "As Configured",
      `Finances ${totalAmount} ${currency} at ${annualRate}% APR over ${termMonths} months.`,
      "LOAN_OR_DEBT",
      totalAmount,
      inputs.downPayment || 0,
      termMonths,
      annualRate,
      baselineGoalMonthlyAllocation,
      0,
      0
    );

    const waitDaysB = Math.ceil((Math.min(totalAmount * 0.5, 3000) / availableForDecisionSavingsPerMonth) * 30);
    const downB = Math.min(totalAmount * 0.5, 3000);
    optionB = buildScenario(
      "OPTION_B",
      `Option B: Wait ${waitDaysB} Days & Put ${downB} ${currency} Down`,
      "Aimly Recommended",
      `Saves ${downB} ${currency} from cash flow to reduce loan principal and interest.`,
      "LOAN_OR_DEBT",
      totalAmount,
      downB,
      termMonths,
      annualRate,
      baselineGoalMonthlyAllocation,
      availableForDecisionSavingsPerMonth,
      waitDaysB
    );

    const optCAmount = Math.round(totalAmount * 0.75);
    optionC = buildScenario(
      "OPTION_C",
      `Option C: Optimized ${optCAmount} ${currency} Model`,
      "Budget Alternative",
      `Reduces borrowing amount by 25% to minimize recurring obligations.`,
      "LOAN_OR_DEBT",
      optCAmount,
      0,
      termMonths,
      annualRate,
      baselineGoalMonthlyAllocation,
      0,
      0
    );

    optionD = buildScenario(
      "OPTION_D",
      `Option D: Extended 48-Month Term`,
      "Lower Payment",
      `Extends repayment term to 48 months.`,
      "LOAN_OR_DEBT",
      totalAmount,
      0,
      48,
      annualRate,
      baselineGoalMonthlyAllocation,
      0,
      0
    );
  } else {
    // ONE-TIME EXPENSE / PURCHASE FUNDING
    optionA = buildScenario(
      "OPTION_A",
      `Option A: Pay Now from Cash Reserves (${totalAmount} ${currency})`,
      "Immediate Execution",
      `Pays ${totalAmount} ${currency} immediately from liquid cash reserves.`,
      "ONE_TIME_EXPENSE",
      totalAmount,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      0,
      0
    );

    // Wait until fully self-funded (exact horizon in days)
    const waitDaysB = Math.max(30, Math.ceil((totalAmount / availableForDecisionSavingsPerMonth) * 30));
    optionB = buildScenario(
      "OPTION_B",
      `Option B: Wait ${waitDaysB} Days & Self-Fund (${totalAmount} ${currency})`,
      "Aimly Recommended",
      `Saves ${availableForDecisionSavingsPerMonth} ${currency}/mo from free cash flow while preserving goal contributions.`,
      "PURCHASE_FUNDING",
      totalAmount,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      availableForDecisionSavingsPerMonth,
      waitDaysB
    );

    const optCAmount = Math.round(totalAmount * 0.75);
    const waitDaysC = Math.max(20, Math.ceil((optCAmount / availableForDecisionSavingsPerMonth) * 30));
    optionC = buildScenario(
      "OPTION_C",
      `Option C: Optimized ${optCAmount} ${currency} Model (Wait ${waitDaysC} Days)`,
      "Budget Alternative",
      `Reduces outlay by 25% to reach self-funding faster without reserve drain.`,
      "PURCHASE_FUNDING",
      optCAmount,
      0,
      0,
      0,
      baselineGoalMonthlyAllocation,
      availableForDecisionSavingsPerMonth,
      waitDaysC
    );

    const optDDown = Math.min(1000, Math.round(totalAmount * 0.25));
    optionD = buildScenario(
      "OPTION_D",
      `Option D: 24-Month Financing (${optDDown} ${currency} Down)`,
      "Financing Alternative",
      `Spreads repayment over 24 months.`,
      "FINANCED_PURCHASE",
      totalAmount,
      optDDown,
      24,
      annualRate,
      baselineGoalMonthlyAllocation,
      0,
      0
    );
  }

  // 5. DETERMINISTIC SCENARIO RANKING (Across the 3 Visible Comparison Pillars)
  const candidates = [optionA, optionB, optionC];
  candidates.sort((a, b) => b.rankingScore - a.rankingScore);

  const winningScenario = candidates[0];
  optionA.isRecommended = winningScenario.code === "OPTION_A";
  optionB.isRecommended = winningScenario.code === "OPTION_B";
  optionC.isRecommended = winningScenario.code === "OPTION_C";
  if (optionD) optionD.isRecommended = false;

  // Action plan strictly matching winning scenario
  let actionStep1 = "";
  if (winningScenario.code === "OPTION_B") {
    actionStep1 =
      transactionType === "RECURRING_EXPENSE"
        ? `1. Execute Option B: Negotiate or target a capped recurring adjustment of +${optionB.amount} ${currency}/month to preserve monthly goal contributions and emergency buffer.`
        : `1. Execute Option B: Allocate +${availableForDecisionSavingsPerMonth} ${currency}/month toward your decision savings account for ${optionB.ledger.waitDaysRequired} days to fully self-fund ${totalAmount} ${currency} with zero debt.`;
  } else if (winningScenario.code === "OPTION_C") {
    actionStep1 = `1. Execute Option C: Choose the optimized ${optionC.amount} ${currency} model to minimize ongoing obligations while protecting life goals.`;
  } else {
    actionStep1 = `1. Execute Option A: Proceed with the proposed decision under strict budget oversight.`;
  }

  const actionStep2 = `2. Maintain your confirmed +${baselineGoalMonthlyAllocation} ${currency}/month contribution to "${baselineData.primaryGoal.title}" to protect target arrival date.`;
  const actionStep3 = `3. Review cash flow trajectory at 30-day milestones to confirm reserve buffer safety.`;

  const recommendation = {
    recommendedScenarioId: winningScenario.code,
    recommendedScenarioTitle: winningScenario.title,
    actionPlanStep1: actionStep1,
    actionPlanStep2: actionStep2,
    actionPlanStep3: actionStep3,
    reasons: winningScenario.reasons,
  };

  // 6. FINANCING SUMMARY (Only populated if financing is actively used)
  const isFinancingUsed = isLoanOrFinanced || winningScenario.modelType === "LOAN_OR_DEBT" || winningScenario.modelType === "FINANCED_PURCHASE";
  const financing: FinancingSummary = {
    hasFinancing: isFinancingUsed,
    principalBorrowed: isFinancingUsed ? (isLoanOrFinanced ? optionA.principalFinanced : optionD.principalFinanced) : 0,
    downPayment: isFinancingUsed ? (isLoanOrFinanced ? optionA.downPayment : optionD.downPayment) : 0,
    annualInterestRatePercent: isFinancingUsed ? annualRate : 0,
    loanTermMonths: isFinancingUsed ? termMonths : 0,
    paymentFrequency: "Monthly",
    monthlyPayment: isFinancingUsed ? (isLoanOrFinanced ? optionA.monthlyPayment : optionD.monthlyPayment) : 0,
    totalInterestPaid: isFinancingUsed ? (isLoanOrFinanced ? optionA.totalInterestPaid : optionD.totalInterestPaid) : 0,
    totalLifetimeCost: isFinancingUsed ? (isLoanOrFinanced ? optionA.totalCostOverTime : optionD.totalCostOverTime) : totalAmount,
    isAssumedTerms: isAssumedLoanTerms,
    aprSourceExplanation: isFinancingUsed ? aprSourceExplanation : "",
  };

  // 7. VERDICT GENERATION
  let verdictDecision: CanonicalDecisionAnalysis["verdict"]["decision"] = "RECOMMENDED";
  let headline = "";
  let primaryReason = "";
  let dominantConsequence = "";

  if (optionA.postDecisionRunwayMonths < 2.0 || optionA.postDecisionFreeCashFlow < 200) {
    verdictDecision = "NOT_RECOMMENDED";
    headline =
      transactionType === "RECURRING_EXPENSE"
        ? `Proposed recurring commitment drops your emergency runway to ${optionA.postDecisionRunwayMonths} months (below mandatory 2.0-month safety floor).`
        : `Immediate cash execution drops emergency reserves to ${optionA.postDecisionRunwayMonths} months (below mandatory 2.0-month safety floor).`;
    primaryReason =
      transactionType === "RECURRING_EXPENSE"
        ? `Adding +${totalAmount} ${currency}/mo in fixed commitments absorbs ${optionA.fcfPercentageShift}% of your free cash flow, leaving only +${optionA.postDecisionFreeCashFlow} ${currency}/mo.`
        : `Paying ${totalAmount} ${currency} from cash today leaves only ${optionA.postDecisionCash} ${currency} in reserves (${optionA.postDecisionRunwayMonths} mos runway). Option B solves this with zero reserve risk.`;
    dominantConsequence =
      transactionType === "RECURRING_EXPENSE"
        ? `Reduces monthly free cash flow by -${totalAmount} ${currency}/mo (-${optionA.fcfPercentageShift}%).`
        : `Reduces emergency living buffer by ${Math.abs(optionA.deltaRunwayMonths)} months.`;
  } else if (optionA.postDecisionRunwayMonths < 3.0 || optionA.goalDelayDays > 14) {
    verdictDecision = "PROCEED_WITH_CAUTION";
    headline = `Executable today, but reduces financial flexibility and emergency buffer.`;
    primaryReason =
      transactionType === "RECURRING_EXPENSE"
        ? `Increases fixed monthly outflows by +${totalAmount} ${currency}/mo.`
        : `Consumes ${totalAmount} ${currency} from liquid reserves.`;
    dominantConsequence = `Shifts your primary financial cushion.`;
  } else {
    verdictDecision = "RECOMMENDED";
    headline = `Safely executable while maintaining healthy living buffers and goal momentum.`;
    primaryReason = `Fully sustainable within current financial cash flows.`;
    dominantConsequence = `Preserves liquid reserves and goal velocity.`;
  }

  // 8. CATEGORIZED MATERIAL ASSUMPTIONS (Strict Relevance Filter)
  const categorizedAssumptions: CategorizedAssumptions = {
    confirmedUserBaseline: [
      `Monthly net inflow confirmed at ${monthlyIncome} ${currency}.`,
      `Core living expenses and debt payments confirmed at ${totalMonthlyOutflows} ${currency}/month.`,
      `Liquid cash reserves confirmed at ${baselineProfile.liquidSavings} ${currency}.`,
    ],
    aimlySafetyThresholds: [
      `Mandatory Emergency Floor: 2.0 months of living expenses (${monthlyLivingExpenses * 2} ${currency}).`,
      `Target Emergency Buffer: 3.0 months of living expenses (${monthlyLivingExpenses * 3} ${currency}).`,
    ],
    scenarioAllocationMechanics: [
      `Monthly Net Free Cash Flow: ${netFreeCashFlow} ${currency}/month.`,
      `Goal Allocation: ${baselineGoalMonthlyAllocation} ${currency}/month preserved to "${baselineData.primaryGoal.title}".`,
      `Discretionary Decision Savings: ${availableForDecisionSavingsPerMonth} ${currency}/month allocated during waiting periods.`,
    ],
    financingAssumptions: isFinancingUsed
      ? [
          aprSourceExplanation,
          `Amortization modeled as standard monthly reducing balance with zero early repayment penalties.`,
        ]
      : [],
  };

  const assumptionsList: string[] = [
    ...categorizedAssumptions.confirmedUserBaseline,
    ...categorizedAssumptions.aimlySafetyThresholds,
    ...categorizedAssumptions.scenarioAllocationMechanics,
    ...categorizedAssumptions.financingAssumptions,
  ];

  return {
    analysisId: `ANL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    currency,
    inputs,
    transactionType,
    baseline: baselineData,
    financing,
    primaryImpact: optionA,
    scenarios: {
      optionA,
      optionB,
      optionC,
      optionD,
    },
    recommendation,
    verdict: {
      decision: verdictDecision,
      headline,
      primaryReason,
      dominantConsequence,
    },
    assumptions: assumptionsList,
    categorizedAssumptions,
    isAssumedLoanTerms,
  };
}
