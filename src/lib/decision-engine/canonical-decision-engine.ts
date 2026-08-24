import { BaselineFinancialProfile } from "../finance";
import { CurrencyCode } from "../types/finance";

export type DecisionType =
  | "ONE_OFF_PURCHASE"
  | "FINANCED_PURCHASE"
  | "LOAN_FACILITY"
  | "RECURRING_EXPENSE"
  | "INVESTMENT"
  | "DEBT_PAYOFF";

export interface DecisionInputParameters {
  title: string;
  category: string;
  decisionType: DecisionType;
  totalAmount: number;
  downPayment?: number;
  loanTermMonths?: number;
  annualInterestRatePercent?: number; // e.g. 8.5 for 8.5%
  customMonthlyPayment?: number;
  isRecurring?: boolean;
  currency: CurrencyCode;
  priority?: "PROTECT_CASH" | "REACH_GOALS" | "LOW_MONTHLY" | "AVOID_DEBT" | "BUY_SOONER";
}

export interface ScenarioImpactResult {
  id: string; // e.g. "OPTION_A", "OPTION_B", "OPTION_C"
  code: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D";
  title: string;
  badge: string;
  description: string;
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
}

export interface CanonicalDecisionAnalysis {
  analysisId: string;
  timestamp: string;
  currency: CurrencyCode;
  inputs: DecisionInputParameters;

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
      baselineMonthlyAllocation: number;
      baselineMonthsToTarget: number;
    };
  };

  // Financing Summary
  financing: FinancingSummary;

  // Primary Impact (Option A - As Proposed)
  primaryImpact: ScenarioImpactResult;

  // Compared Scenarios
  scenarios: {
    optionA: ScenarioImpactResult; // Proceed Now
    optionB: ScenarioImpactResult; // Wait & Save
    optionC: ScenarioImpactResult; // 25% Budget Alternative
    optionD?: ScenarioImpactResult; // Extended Term
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

  // Material Assumptions
  assumptions: string[];
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
 * DETERMINISTIC CANONICAL DECISION EVALUATOR (10/10 STANDARD)
 * Single Source of Truth for the entire UseAimly system.
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

  // 1. Reconcile Baseline Metrics
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
    title: "Business Launch & Life Goal",
    targetAmount: 25000,
    currentAmount: 12000,
    targetDate: "2027-12-31",
  };

  const goalRemaining = Math.max(0, primaryGoalRaw.targetAmount - primaryGoalRaw.currentAmount);
  const baselineMonthlyGoalAllocation = Math.min(
    netFreeCashFlow,
    Math.max(100, Math.round(netFreeCashFlow * 0.45))
  );
  const baselineMonthsToTarget =
    baselineMonthlyGoalAllocation > 0 ? Math.ceil(goalRemaining / baselineMonthlyGoalAllocation) : 24;

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
      baselineMonthlyAllocation: baselineMonthlyGoalAllocation,
      baselineMonthsToTarget,
    },
  };

  // 2. Classify Transaction Archetype
  let decisionType = inputs.decisionType;
  if (!decisionType) {
    if (category === "TAKE_A_LOAN" || title.toLowerCase().includes("loan") || title.toLowerCase().includes("borrow")) {
      decisionType = "LOAN_FACILITY";
    } else if (inputs.isRecurring || category === "MOVE_HOME") {
      decisionType = "RECURRING_EXPENSE";
    } else if (inputs.downPayment && inputs.downPayment > 0 && inputs.downPayment < totalAmount) {
      decisionType = "FINANCED_PURCHASE";
    } else if (category === "INVEST") {
      decisionType = "INVESTMENT";
    } else if (category === "PAY_OFF_DEBT") {
      decisionType = "DEBT_PAYOFF";
    } else {
      decisionType = "ONE_OFF_PURCHASE";
    }
  }

  // Determine Financing Parameters
  let isAssumedLoanTerms = false;
  let termMonths = inputs.loanTermMonths || 36;
  let annualRate = inputs.annualInterestRatePercent ?? 8.5;
  const isLoanOrFinanced = decisionType === "LOAN_FACILITY" || decisionType === "FINANCED_PURCHASE";

  if (isLoanOrFinanced) {
    if (!inputs.loanTermMonths || inputs.annualInterestRatePercent === undefined) {
      isAssumedLoanTerms = true;
    }
  }

  // Material Assumptions List
  const assumptions: string[] = [
    `Monthly net income remains steady at ${monthlyIncome} ${currency}.`,
    `Core living costs remain constant at ${monthlyLivingExpenses} ${currency}/month.`,
  ];

  if (isAssumedLoanTerms) {
    assumptions.push(
      `Financing terms estimated at ${annualRate}% APR over ${termMonths} months (standard market reference).`
    );
  } else if (isLoanOrFinanced) {
    assumptions.push(
      `Financing terms fixed at ${annualRate}% APR over ${termMonths} months with zero early repayment penalties.`
    );
  }

  // 3. SCENARIO CALCULATION HELPER (Deep Differentiation)
  function buildScenario(
    code: "OPTION_A" | "OPTION_B" | "OPTION_C" | "OPTION_D",
    scenTitle: string,
    scenBadge: string,
    scenDesc: string,
    scenType: DecisionType,
    scenAmount: number,
    scenDownPayment: number,
    scenTermMonths: number,
    scenRatePercent: number,
    scenAccumulatedCashPreSave = 0,
    scenExplicitMonthly?: number
  ): ScenarioImpactResult {
    let immediateCashOutflow = 0;
    let principalFinanced = 0;
    let monthlyPayment = 0;
    let totalInterestPaid = 0;
    let totalCostOverTime = scenAmount;

    if (scenType === "ONE_OFF_PURCHASE" || scenType === "INVESTMENT" || scenType === "DEBT_PAYOFF") {
      immediateCashOutflow = scenAmount;
      principalFinanced = 0;
      monthlyPayment = 0;
      totalCostOverTime = scenAmount;
    } else if (scenType === "FINANCED_PURCHASE") {
      immediateCashOutflow = scenDownPayment;
      principalFinanced = Math.max(0, scenAmount - scenDownPayment);
      if (scenExplicitMonthly && scenExplicitMonthly > 0) {
        monthlyPayment = scenExplicitMonthly;
        totalCostOverTime = scenDownPayment + scenExplicitMonthly * scenTermMonths;
        totalInterestPaid = Math.max(0, totalCostOverTime - scenAmount);
      } else {
        const loan = calculateMonthlyLoanPayment(principalFinanced, scenRatePercent, scenTermMonths);
        monthlyPayment = loan.monthlyPayment;
        totalInterestPaid = loan.totalInterest;
        totalCostOverTime = scenDownPayment + loan.totalCost;
      }
    } else if (scenType === "LOAN_FACILITY") {
      // If user accumulated extra cash in Option B, down payment absorbs part of borrowing
      immediateCashOutflow = scenDownPayment;
      principalFinanced = Math.max(0, scenAmount - scenDownPayment);
      if (scenExplicitMonthly && scenExplicitMonthly > 0) {
        monthlyPayment = scenExplicitMonthly;
        totalCostOverTime = scenDownPayment + scenExplicitMonthly * scenTermMonths;
        totalInterestPaid = Math.max(0, totalCostOverTime - scenAmount);
      } else {
        const loan = calculateMonthlyLoanPayment(principalFinanced, scenRatePercent, scenTermMonths);
        monthlyPayment = loan.monthlyPayment;
        totalInterestPaid = loan.totalInterest;
        totalCostOverTime = scenDownPayment + loan.totalCost;
      }
    } else if (scenType === "RECURRING_EXPENSE") {
      immediateCashOutflow = scenDownPayment;
      principalFinanced = 0;
      monthlyPayment = scenAmount;
      totalCostOverTime = scenAmount * 12;
    }

    // Cash Reconciliation
    // (If user pre-saved in Option B, accumulated cash offsets the down payment so baseline savings stay intact!)
    const effectiveCashDrain = Math.max(0, immediateCashOutflow - scenAccumulatedCashPreSave);
    const postDecisionCash = Math.round(Math.max(0, baselineData.liquidSavings - effectiveCashDrain) * 100) / 100;
    const deltaCash = Math.round((postDecisionCash - baselineData.liquidSavings) * 100) / 100;

    // Monthly Cash Flow Reconciliation
    const newMonthlyObligation = monthlyPayment;
    const postDecisionMonthlyExpenses = Math.round((baselineData.totalMonthlyOutflows + newMonthlyObligation) * 100) / 100;
    const postDecisionFreeCashFlow = Math.round(Math.max(0, baselineData.monthlyIncome - postDecisionMonthlyExpenses) * 100) / 100;
    const deltaFreeCashFlow = Math.round((postDecisionFreeCashFlow - baselineData.netFreeCashFlow) * 100) / 100;
    const fcfPercentageShift =
      baselineData.netFreeCashFlow > 0
        ? Math.round((Math.abs(deltaFreeCashFlow) / baselineData.netFreeCashFlow) * 100)
        : 0;

    // Runway Reconciliation
    const postDecisionRunwayMonths =
      monthlyLivingExpenses > 0
        ? Math.round((postDecisionCash / monthlyLivingExpenses) * 10) / 10
        : 0;
    const deltaRunwayMonths = Math.round((postDecisionRunwayMonths - baselineData.emergencyRunwayMonths) * 10) / 10;

    // Goal Impact & Explainability
    let goalDelayDays = 0;
    let goalDelayMonths = 0;
    let goalStatus: ScenarioImpactResult["goalStatus"] = "ON_TRACK";
    let goalExplanation = "";

    const availableForGoal = Math.max(0, Math.min(postDecisionFreeCashFlow, baselineMonthlyGoalAllocation));

    if (availableForGoal <= 0 && goalRemaining > 0) {
      goalStatus = "GOAL_FUNDING_PAUSED";
      goalDelayMonths = 12;
      goalDelayDays = 365;
      goalExplanation = `New monthly obligations absorb 100% of available free cash flow, pausing contributions to "${baselineData.primaryGoal.title}".`;
    } else if (availableForGoal < baselineMonthlyGoalAllocation) {
      const postMonths = Math.ceil(goalRemaining / availableForGoal);
      goalDelayMonths = Math.max(0, postMonths - baselineMonthsToTarget);
      goalDelayDays = Math.min(730, goalDelayMonths * 30);
      goalStatus = goalDelayDays > 0 ? "DELAYED" : "ON_TRACK";
      goalExplanation = `Reduced monthly goal allocation (+${availableForGoal} ${currency}/mo vs baseline +${baselineMonthlyGoalAllocation} ${currency}/mo) shifts goal arrival by ${goalDelayDays} days.`;
    } else {
      goalStatus = "ON_TRACK";
      goalDelayDays = 0;
      goalDelayMonths = 0;
      goalExplanation = `Your goal "${baselineData.primaryGoal.title}" remains 100% on schedule because post-decision free cash flow (+${postDecisionFreeCashFlow} ${currency}/mo) fully covers the required monthly contribution (+${baselineMonthlyGoalAllocation} ${currency}/mo).`;
    }

    // Ranking Evaluation Score
    let rankingScore = 100;
    const reasons: string[] = [];

    if (postDecisionRunwayMonths < 2.0) {
      rankingScore -= 45;
      reasons.push(`Emergency buffer drops to ${postDecisionRunwayMonths} mos (below 2.0-month safety threshold).`);
    } else if (postDecisionRunwayMonths < 3.0) {
      rankingScore -= 15;
      reasons.push(`Preserves emergency runway at ${postDecisionRunwayMonths} months.`);
    } else {
      rankingScore += 15;
      reasons.push(`Maintains a robust ${postDecisionRunwayMonths}-month emergency reserve buffer.`);
    }

    if (newMonthlyObligation > netFreeCashFlow) {
      rankingScore -= 50;
      reasons.push(`Monthly installment (${newMonthlyObligation} ${currency}) exceeds free cash flow.`);
    } else if (newMonthlyObligation > 0) {
      reasons.push(`Monthly obligation of ${newMonthlyObligation} ${currency}/mo is safely covered by cash flow.`);
    }

    if (totalInterestPaid > 0) {
      reasons.push(`Total borrowing interest cost: ${totalInterestPaid} ${currency}.`);
      if (code === "OPTION_B" || code === "OPTION_C") {
        rankingScore += 15;
      }
    }

    if (goalDelayDays === 0) {
      rankingScore += 20;
      reasons.push(`Keeps "${baselineData.primaryGoal.title}" 100% on schedule with 0 days delay.`);
    } else {
      rankingScore -= Math.min(25, Math.round(goalDelayDays / 15));
      reasons.push(`Shifts goal timeline by ${goalDelayDays} days.`);
    }

    // Priority adjustments
    if (priority === "PROTECT_CASH" && (code === "OPTION_B" || postDecisionRunwayMonths >= 3.0)) rankingScore += 20;
    if (priority === "LOW_MONTHLY" && monthlyPayment < 200) rankingScore += 20;
    if (priority === "AVOID_DEBT" && totalInterestPaid < 800) rankingScore += 25;
    if (priority === "BUY_SOONER" && code === "OPTION_A") rankingScore += 30;

    return {
      id: code,
      code,
      title: scenTitle,
      badge: scenBadge,
      description: scenDesc,
      amount: scenAmount,
      downPayment: scenDownPayment,
      principalFinanced,
      loanTermMonths: scenTermMonths,
      annualRatePercent: scenRatePercent,
      monthlyPayment,
      totalInterestPaid,
      totalCostOverTime,
      immediateCashOutflow,
      postDecisionCash,
      deltaCash,
      newMonthlyObligation,
      postDecisionMonthlyExpenses,
      postDecisionFreeCashFlow,
      deltaFreeCashFlow,
      fcfPercentageShift: deltaFreeCashFlow === 0 ? 0 : fcfPercentageShift,
      postDecisionRunwayMonths,
      deltaRunwayMonths,
      goalDelayDays,
      goalDelayMonths,
      goalStatus,
      goalExplanation,
      isRecommended: false,
      rankingScore,
      reasons,
    };
  }

  // 4. GENERATE ECONOMICALLY DIFFERENTIATED SCENARIOS
  const downPayment = inputs.downPayment || 0;
  const explicitMonthly = inputs.customMonthlyPayment;

  // OPTION A: Proceed Now (As Configured)
  const optionA = buildScenario(
    "OPTION_A",
    isLoanOrFinanced
      ? `Option A: Proceed with Borrowing (${totalAmount} ${currency})`
      : `Option A: Proceed with Purchase (${totalAmount} ${currency})`,
    "Immediate Execution",
    "Executes the full transaction immediately under standard terms.",
    decisionType,
    totalAmount,
    downPayment,
    termMonths,
    annualRate,
    0,
    explicitMonthly
  );

  // OPTION B: Wait 60 Days & Accumulate Down Payment (Real Economic Model)
  // During 60 days, user saves 2 months of Net FCF (e.g. 2 x 2,200 = 4,400)
  // For a loan: User puts this 4,400 as down payment, borrowing only (10,000 - 4,400) = 5,600!
  const waitMonths = 2;
  const waitDays = waitMonths * 30;
  const accumulatedSavingsDuringWait = Math.round(netFreeCashFlow * waitMonths * 0.75); // 75% of FCF saved

  let optionBAmount = totalAmount;
  let optionBDownPayment = downPayment;
  let optionBAccumulated = 0;

  if (isLoanOrFinanced) {
    optionBDownPayment = Math.min(totalAmount * 0.6, Math.max(downPayment + 1500, accumulatedSavingsDuringWait));
    optionBAccumulated = optionBDownPayment;
  } else {
    optionBDownPayment = totalAmount;
    optionBAccumulated = totalAmount;
  }

  const optionB = buildScenario(
    "OPTION_B",
    isLoanOrFinanced
      ? `Option B: Wait ${waitDays} Days & Borrow ${totalAmount - optionBDownPayment} ${currency}`
      : `Option B: Wait ${waitDays} Days & Save ${totalAmount} ${currency}`,
    "Aimly Recommended",
    isLoanOrFinanced
      ? `Saves ${optionBDownPayment} ${currency} from cash flow to reduce borrowed principal and cut interest.`
      : `Saves full purchase price from monthly cash flow before executing.`,
    isLoanOrFinanced ? "LOAN_FACILITY" : "ONE_OFF_PURCHASE",
    optionBAmount,
    optionBDownPayment,
    termMonths,
    annualRate,
    optionBAccumulated
  );

  // OPTION C: 25% Budget Alternative
  const cheaperAmount = Math.round(totalAmount * 0.75);
  const cheaperDown = Math.round(downPayment * 0.75);
  const optionC = buildScenario(
    "OPTION_C",
    `Option C: Optimized ${cheaperAmount} ${currency} Alternative`,
    "Budget Alternative",
    "Selects a 25% lower-cost option to minimize recurring obligations and interest.",
    decisionType,
    cheaperAmount,
    cheaperDown,
    termMonths,
    annualRate
  );

  // OPTION D: Extended Term (48 Months)
  const optionD = buildScenario(
    "OPTION_D",
    `Option D: 48-Month Extended Financing`,
    "Lower Monthly Payment",
    "Extends repayment over 48 months to reduce monthly pressure.",
    decisionType,
    totalAmount,
    downPayment,
    48,
    annualRate
  );

  // 5. DETERMINISTIC RANKING ENGINE (EXACTLY ONE BEST SCENARIO)
  const candidateScenarios = [optionA, optionB, optionC, optionD];
  candidateScenarios.sort((a, b) => b.rankingScore - a.rankingScore);

  // Exactly one winner
  const winningScenario = candidateScenarios[0];
  optionA.isRecommended = winningScenario.code === "OPTION_A";
  optionB.isRecommended = winningScenario.code === "OPTION_B";
  optionC.isRecommended = winningScenario.code === "OPTION_C";
  optionD.isRecommended = winningScenario.code === "OPTION_D";

  // Build Action Plan strictly linked to winning scenario
  let actionStep1 = "";
  if (winningScenario.code === "OPTION_B") {
    actionStep1 = isLoanOrFinanced
      ? `1. Execute Option B: Wait ${waitDays} days to accumulate ${optionBDownPayment} ${currency} in cash flow down payment, reducing borrowed principal to ${totalAmount - optionBDownPayment} ${currency} and saving ${Math.round(optionA.totalInterestPaid - optionB.totalInterestPaid)} ${currency} in interest.`
      : `1. Execute Option B: Wait ${waitDays} days to save the full ${totalAmount} ${currency} from monthly cash flow, completely avoiding debt.`;
  } else if (winningScenario.code === "OPTION_C") {
    actionStep1 = `1. Execute Option C: Choose the optimized ${cheaperAmount} ${currency} alternative to reduce monthly payment to ${optionC.monthlyPayment} ${currency}/mo and lower lifetime cost by ${Math.round(optionA.totalCostOverTime - optionC.totalCostOverTime)} ${currency}.`;
  } else {
    actionStep1 = `1. Execute Option A: Proceed today as configured, maintaining strict budget controls over the ${termMonths}-month amortization schedule.`;
  }

  const actionStep2 = `2. Maintain steady monthly contributions of +${baselineMonthlyGoalAllocation} ${currency}/month toward "${baselineData.primaryGoal.title}" to secure target timeline.`;
  const actionStep3 = `3. Re-evaluate this decision if additional liquidity becomes available or if financing terms can be negotiated below ${annualRate}% APR.`;

  const recommendation = {
    recommendedScenarioId: winningScenario.code,
    recommendedScenarioTitle: winningScenario.title,
    actionPlanStep1: actionStep1,
    actionPlanStep2: actionStep2,
    actionPlanStep3: actionStep3,
    reasons: winningScenario.reasons,
  };

  // Primary Impact (Option A - As Proposed)
  const primaryImpact = optionA;

  // 6. Financing Summary
  const financing: FinancingSummary = {
    hasFinancing: isLoanOrFinanced,
    principalBorrowed: primaryImpact.principalFinanced,
    downPayment: primaryImpact.downPayment,
    annualInterestRatePercent: annualRate,
    loanTermMonths: termMonths,
    paymentFrequency: "Monthly",
    monthlyPayment: primaryImpact.monthlyPayment,
    totalInterestPaid: primaryImpact.totalInterestPaid,
    totalLifetimeCost: primaryImpact.totalCostOverTime,
    isAssumedTerms: isAssumedLoanTerms,
  };

  // 7. BUILD DETERMINISTIC VERDICT
  let verdictType: CanonicalDecisionAnalysis["verdict"]["decision"] = "RECOMMENDED";
  let headline = "";
  let primaryReason = "";
  let dominantConsequence = "";

  if (primaryImpact.postDecisionRunwayMonths < 2.0 || primaryImpact.newMonthlyObligation > netFreeCashFlow) {
    verdictType = "NOT_RECOMMENDED";
    headline = "This commitment puts your financial resilience below critical safety thresholds.";
    primaryReason =
      primaryImpact.newMonthlyObligation > netFreeCashFlow
        ? `Monthly payment of ${primaryImpact.newMonthlyObligation} ${currency}/mo exceeds your available free cash flow (${netFreeCashFlow} ${currency}/mo).`
        : `Leaves only ${primaryImpact.postDecisionRunwayMonths} months of emergency living runway (below mandatory 2.0-month floor).`;
    dominantConsequence = `Executing this today risks cash deficit and severely reduces your safety cushion.`;
  } else if (
    primaryImpact.postDecisionRunwayMonths < 3.0 ||
    primaryImpact.goalDelayDays > 14 ||
    isAssumedLoanTerms
  ) {
    verdictType = "PROCEED_WITH_CAUTION";
    if (primaryImpact.goalDelayDays > 0) {
      headline = `Executable today, but shifts "${baselineData.primaryGoal.title}" by ${primaryImpact.goalDelayDays} days.`;
      dominantConsequence = `Shifts your primary goal arrival by ${primaryImpact.goalDelayDays} days.`;
    } else {
      headline = `Executable today, but reduces your monthly free cash flow by ${primaryImpact.fcfPercentageShift}%.`;
      dominantConsequence = `Adds a monthly obligation of ${primaryImpact.monthlyPayment} ${currency}/mo, absorbing ${primaryImpact.fcfPercentageShift}% of your free cash flow.`;
    }
    primaryReason =
      primaryImpact.newMonthlyObligation > 0
        ? `Adds a monthly obligation of ${primaryImpact.monthlyPayment} ${currency}/mo, absorbing ${primaryImpact.fcfPercentageShift}% of your free cash flow.`
        : `Consumes ${primaryImpact.immediateCashOutflow} ${currency} of liquid reserves, leaving ${primaryImpact.postDecisionCash} ${currency} in available cash.`;
  } else {
    verdictType = "RECOMMENDED";
    headline = "This commitment safely protects your emergency runway and life goals.";
    primaryReason = `Leaves a robust ${primaryImpact.postDecisionRunwayMonths} months of emergency runway with full goal compounding intact.`;
    dominantConsequence = `Preserves your liquid reserves and keeps your primary goal on schedule.`;
  }

  return {
    analysisId: `ANL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    currency,
    inputs,
    baseline: baselineData,
    financing,
    primaryImpact,
    scenarios: {
      optionA,
      optionB,
      optionC,
      optionD,
    },
    recommendation,
    verdict: {
      decision: verdictType,
      headline,
      primaryReason,
      dominantConsequence,
    },
    assumptions,
    isAssumedLoanTerms,
  };
}
