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
  id: string;
  title: string;
  badge: string;
  description: string;
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
  totalInterestPaid: number;
  totalCostOverTime: number;
  isRecommended: boolean;
  rankingScore: number;
  reasons: string[];
}

export interface CanonicalDecisionAnalysis {
  analysisId: string;
  timestamp: string;
  currency: CurrencyCode;
  inputs: DecisionInputParameters;

  // Baseline Snapshot
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

  // Primary Scenario Calculated Impact
  primaryImpact: ScenarioImpactResult;

  // Compared Scenarios
  scenarios: {
    optionA: ScenarioImpactResult; // Proceed Now
    optionB: ScenarioImpactResult; // Wait & Save
    optionC: ScenarioImpactResult; // Budget Alternative (25% lower)
    optionD?: ScenarioImpactResult; // Longer term financing
  };

  // Verdict
  verdict: {
    decision: "RECOMMENDED" | "PROCEED_WITH_CAUTION" | "NOT_RECOMMENDED";
    headline: string;
    primaryReason: string;
    dominantConsequence: string;
  };

  // Explicit Assumptions
  assumptions: string[];
  isAssumedLoanTerms: boolean;
}

/**
 * Standard Amortization Formula (Deterministic PMT)
 * PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
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
 * DETERMINISTIC CANONICAL DECISION EVALUATOR
 * Single Source of Truth for the entire UseAimly pipeline.
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

  // 1. Reconcile Baseline
  const monthlyIncome = baselineProfile.incomes.reduce((acc, i) => acc + i.amount, 0);
  const monthlyLivingExpenses = baselineProfile.expenses.reduce((acc, e) => acc + e.amount, 0);
  const monthlyDebtService = baselineProfile.debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
  const totalMonthlyOutflows = monthlyLivingExpenses + monthlyDebtService;
  const netFreeCashFlow = Math.max(0, monthlyIncome - totalMonthlyOutflows);
  const emergencyRunwayMonths =
    monthlyLivingExpenses > 0
      ? Math.round((baselineProfile.liquidSavings / monthlyLivingExpenses) * 10) / 10
      : 3.0;

  // Baseline Primary Goal
  const primaryGoalRaw = baselineProfile.goals[0] || {
    id: "primary-goal",
    title: "Business Launch & Life Goal",
    targetAmount: 25000,
    currentAmount: 12000,
    targetDate: "2027-12-31",
  };

  const goalRemaining = Math.max(0, primaryGoalRaw.targetAmount - primaryGoalRaw.currentAmount);
  const baselineMonthlyGoalAllocation = Math.min(netFreeCashFlow, Math.max(100, Math.round(netFreeCashFlow * 0.5)));
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

  // 2. Determine Transaction Archetype
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

  // Check if assumptions were used for loan parameters
  let isAssumedLoanTerms = false;
  let termMonths = inputs.loanTermMonths || 36;
  let annualRate = inputs.annualInterestRatePercent ?? 8.5;

  if (decisionType === "LOAN_FACILITY" || decisionType === "FINANCED_PURCHASE") {
    if (!inputs.loanTermMonths || inputs.annualInterestRatePercent === undefined) {
      isAssumedLoanTerms = true;
    }
  }

  const assumptions: string[] = [
    `Assumes monthly net income remains steady at ${monthlyIncome} ${currency}.`,
    `Assumes core living expenses remain constant at ${monthlyLivingExpenses} ${currency}/month.`,
  ];

  if (isAssumedLoanTerms) {
    assumptions.push(
      `Financing terms estimated at ${annualRate}% APR over ${termMonths} months (standard market reference).`
    );
  }

  // 3. Helper to Calculate Single Scenario Impact
  function calculateScenario(
    scenId: string,
    scenTitle: string,
    scenBadge: string,
    scenDesc: string,
    scenType: DecisionType,
    scenAmount: number,
    scenDownPayment: number,
    scenTermMonths: number,
    scenRatePercent: number,
    scenExplicitMonthly?: number
  ): ScenarioImpactResult {
    let immediateCashOutflow = 0;
    let newMonthlyObligation = 0;
    let totalInterestPaid = 0;
    let totalCostOverTime = scenAmount;

    if (scenType === "ONE_OFF_PURCHASE" || scenType === "INVESTMENT" || scenType === "DEBT_PAYOFF") {
      immediateCashOutflow = scenAmount;
      newMonthlyObligation = 0;
      totalCostOverTime = scenAmount;
    } else if (scenType === "FINANCED_PURCHASE") {
      immediateCashOutflow = scenDownPayment;
      const financedPrincipal = Math.max(0, scenAmount - scenDownPayment);
      if (scenExplicitMonthly && scenExplicitMonthly > 0) {
        newMonthlyObligation = scenExplicitMonthly;
        totalCostOverTime = scenDownPayment + scenExplicitMonthly * scenTermMonths;
        totalInterestPaid = Math.max(0, totalCostOverTime - scenAmount);
      } else {
        const loanCalc = calculateMonthlyLoanPayment(financedPrincipal, scenRatePercent, scenTermMonths);
        newMonthlyObligation = loanCalc.monthlyPayment;
        totalInterestPaid = loanCalc.totalInterest;
        totalCostOverTime = scenDownPayment + loanCalc.totalCost;
      }
    } else if (scenType === "LOAN_FACILITY") {
      immediateCashOutflow = scenDownPayment;
      const principalBorrowed = Math.max(0, scenAmount - scenDownPayment);
      if (scenExplicitMonthly && scenExplicitMonthly > 0) {
        newMonthlyObligation = scenExplicitMonthly;
        totalCostOverTime = scenDownPayment + scenExplicitMonthly * scenTermMonths;
        totalInterestPaid = Math.max(0, totalCostOverTime - scenAmount);
      } else {
        const loanCalc = calculateMonthlyLoanPayment(principalBorrowed > 0 ? principalBorrowed : scenAmount, scenRatePercent, scenTermMonths);
        newMonthlyObligation = loanCalc.monthlyPayment;
        totalInterestPaid = loanCalc.totalInterest;
        totalCostOverTime = scenDownPayment + loanCalc.totalCost;
      }
    } else if (scenType === "RECURRING_EXPENSE") {
      immediateCashOutflow = scenDownPayment;
      newMonthlyObligation = scenAmount;
      totalCostOverTime = scenAmount * 12;
    }

    // Cash Reconciliation
    const postDecisionCash = Math.round(Math.max(0, baselineData.liquidSavings - immediateCashOutflow) * 100) / 100;
    const deltaCash = Math.round((postDecisionCash - baselineData.liquidSavings) * 100) / 100; // strictly -immediateCashOutflow

    // Monthly Cash Flow Reconciliation
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

    // Goal Impact Reconciliation (Deterministic)
    let goalDelayDays = 0;
    let goalDelayMonths = 0;
    let goalStatus: ScenarioImpactResult["goalStatus"] = "ON_TRACK";

    const postDecisionGoalAllocation = Math.max(
      0,
      Math.min(postDecisionFreeCashFlow, baselineMonthlyGoalAllocation)
    );

    if (postDecisionGoalAllocation <= 0 && goalRemaining > 0) {
      goalStatus = "GOAL_FUNDING_PAUSED";
      goalDelayMonths = 12; // Capped for UI, clearly labeled as paused
      goalDelayDays = 365;
    } else if (postDecisionGoalAllocation > 0) {
      const postMonthsToTarget = Math.ceil(goalRemaining / postDecisionGoalAllocation);
      goalDelayMonths = Math.max(0, postMonthsToTarget - baselineMonthsToTarget);
      goalDelayDays = goalDelayMonths * 30;

      // Anomaly Clamp: Never allow absurd multi-decade numbers
      if (goalDelayDays > 1825) {
        goalDelayDays = 1825; // 5 years cap with explanation
        goalStatus = "GOAL_FUNDING_PAUSED";
      } else if (goalDelayDays > 0) {
        goalStatus = "DELAYED";
      } else {
        goalStatus = "ON_TRACK";
      }
    }

    // Explicit Ranking Score (Transparent)
    let rankingScore = 100;
    const reasons: string[] = [];

    // Critical safety: Runway
    if (postDecisionRunwayMonths < 1.5) {
      rankingScore -= 50;
      reasons.push(`Severely drains emergency buffer to ${postDecisionRunwayMonths} months.`);
    } else if (postDecisionRunwayMonths < 3.0) {
      rankingScore -= 20;
      reasons.push(`Reduces emergency runway below the 3.0-month safety target.`);
    } else {
      reasons.push(`Protects a safe emergency runway of ${postDecisionRunwayMonths} months.`);
    }

    // Cash flow
    if (newMonthlyObligation > netFreeCashFlow) {
      rankingScore -= 40;
      reasons.push(`Monthly obligation (${newMonthlyObligation} ${currency}) exceeds available free cash flow.`);
    } else if (newMonthlyObligation > 0) {
      reasons.push(`Monthly payment of ${newMonthlyObligation} ${currency}/mo is covered by cash flow.`);
    }

    // Goal
    if (goalDelayDays === 0) {
      rankingScore += 20;
      reasons.push(`Leaves primary goal "${baselineData.primaryGoal.title}" 100% on schedule.`);
    } else {
      rankingScore -= Math.min(30, Math.round(goalDelayDays / 15));
      reasons.push(`Shifts goal arrival by approximately ${goalDelayDays} days.`);
    }

    // User priority adjustment
    if (priority === "PROTECT_CASH" && postDecisionRunwayMonths >= 3.0) rankingScore += 15;
    if (priority === "LOW_MONTHLY" && newMonthlyObligation === 0) rankingScore += 15;
    if (priority === "REACH_GOALS" && goalDelayDays === 0) rankingScore += 20;
    if (priority === "BUY_SOONER" && scenId === "OPTION_A") rankingScore += 15;

    return {
      id: scenId,
      title: scenTitle,
      badge: scenBadge,
      description: scenDesc,
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
      totalInterestPaid,
      totalCostOverTime,
      isRecommended: false,
      rankingScore,
      reasons,
    };
  }

  // 4. Generate Scenarios
  const downPayment = inputs.downPayment || 0;
  const explicitMonthly = inputs.customMonthlyPayment;

  // Option A: Primary Decision
  const optionA = calculateScenario(
    "OPTION_A",
    decisionType === "LOAN_FACILITY"
      ? `Option A: Proceed with Borrowing (${totalAmount} ${currency})`
      : decisionType === "FINANCED_PURCHASE"
      ? `Option A: Finance with ${downPayment} ${currency} Down`
      : `Option A: Proceed Today (${totalAmount} ${currency})`,
    "Immediate Execution",
    "Executes the decision immediately under current terms.",
    decisionType,
    totalAmount,
    downPayment,
    termMonths,
    annualRate,
    explicitMonthly
  );

  // Option B: Wait and Save
  const requiredWaitSavings =
    decisionType === "ONE_OFF_PURCHASE" || decisionType === "INVESTMENT"
      ? totalAmount
      : Math.max(downPayment, Math.round(totalAmount * 0.3));
  const monthsToSave =
    netFreeCashFlow > 0 ? Math.max(1, Math.ceil(requiredWaitSavings / netFreeCashFlow)) : 3;
  const waitDays = Math.min(90, Math.max(30, monthsToSave * 30));

  const optionB = calculateScenario(
    "OPTION_B",
    `Option B: Wait ${waitDays} Days & Accumulate Reserves`,
    "Aimly Recommended",
    `Saves ${requiredWaitSavings} ${currency} from monthly cash flow before committing.`,
    "ONE_OFF_PURCHASE",
    0, // zero upfront impact today
    0,
    0,
    0,
    0
  );

  // Option C: 25% Budget Alternative
  const cheaperAmount = Math.round(totalAmount * 0.75);
  const cheaperDown = Math.round(downPayment * 0.75);
  const optionC = calculateScenario(
    "OPTION_C",
    `Option C: Optimized ${cheaperAmount} ${currency} Alternative`,
    "Budget Alternative",
    "Selects a 25% lower-cost alternative to minimize capital depletion.",
    decisionType,
    cheaperAmount,
    cheaperDown,
    termMonths,
    annualRate
  );

  // Mark Recommended Alternative based on Ranking Score
  const allScenarios = [optionA, optionB, optionC];
  allScenarios.sort((a, b) => b.rankingScore - a.rankingScore);
  allScenarios[0].isRecommended = true;

  // Primary Impact (Option A as Baseline Decision)
  const primaryImpact = optionA;

  // 5. Build Verdict
  let verdictType: CanonicalDecisionAnalysis["verdict"]["decision"] = "RECOMMENDED";
  let headline = "";
  let primaryReason = "";
  let dominantConsequence = "";

  if (primaryImpact.postDecisionRunwayMonths < 2.0 || primaryImpact.newMonthlyObligation > netFreeCashFlow) {
    verdictType = "NOT_RECOMMENDED";
    headline = "This commitment puts your financial resilience below critical safety thresholds.";
    primaryReason =
      primaryImpact.newMonthlyObligation > netFreeCashFlow
        ? `Monthly payment of ${primaryImpact.newMonthlyObligation} ${currency} exceeds your available free cash flow (${netFreeCashFlow} ${currency}/mo).`
        : `Leaves only ${primaryImpact.postDecisionRunwayMonths} months of emergency living runway (below mandatory 2.0-month floor).`;
    dominantConsequence = `Executing this today risks cash deficit and severely reduces your safety cushion.`;
  } else if (
    primaryImpact.postDecisionRunwayMonths < 3.0 ||
    primaryImpact.goalDelayDays > 14 ||
    isAssumedLoanTerms
  ) {
    verdictType = "PROCEED_WITH_CAUTION";
    if (primaryImpact.goalDelayDays > 0) {
      headline = `Executable today, but shifts your "${baselineData.primaryGoal.title}" by ${primaryImpact.goalDelayDays} days.`;
      dominantConsequence = `Shifts your primary goal arrival by ${primaryImpact.goalDelayDays} days.`;
    } else {
      headline = `Executable today, but reduces your living buffer to ${primaryImpact.postDecisionRunwayMonths} months.`;
      dominantConsequence = `Reduces emergency buffer to ${primaryImpact.postDecisionRunwayMonths} months of fixed living costs.`;
    }
    primaryReason =
      primaryImpact.newMonthlyObligation > 0
        ? `Adds a monthly obligation of ${primaryImpact.newMonthlyObligation} ${currency}/mo, absorbing ${primaryImpact.fcfPercentageShift}% of your free cash flow.`
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
    primaryImpact,
    scenarios: {
      optionA,
      optionB,
      optionC,
    },
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
