/**
 * The Aimly Goal Intelligence System — Core Trajectory & Intelligence Engine
 * Deterministic, pure TypeScript engine for living goal trajectories.
 */

import {
  FinancialGoal,
  GoalTrajectoryData,
  GoalTrajectoryPoint,
  ContributionSensitivityImpact,
  WithdrawalSensitivityImpact,
  GoalHealth,
  GoalHealthClassification,
  GoalRisk,
  GoalConfidence,
  GoalRobustness,
  GoalDelayData,
  GoalDependency,
  GoalImpactEvent,
  GoalAccelerator,
  GoalThreat,
  AimlyGoalIntelligenceModel,
  GoalEvaluationResult,
  ContributionFrequency,
} from "../../types/goal";
import { addMonths, differenceInDays, differenceInMonths, formatDateToISO, parseDate } from "../../utils/date";
import { roundTo } from "../../utils/math";

/**
 * Normalizes contribution frequency to monthly equivalent
 */
export function normalizeContributionToMonthly(amount: number, frequency?: ContributionFrequency): number {
  if (!amount || amount <= 0) return 0;
  switch (frequency) {
    case "WEEKLY":
      return roundTo((amount * 52) / 12);
    case "BIWEEKLY":
      return roundTo((amount * 26) / 12);
    case "QUARTERLY":
      return roundTo(amount / 3);
    case "YEARLY":
      return roundTo(amount / 12);
    case "ONE_OFF":
      return 0; // One-off does not contribute recurring monthly flow
    case "MONTHLY":
    default:
      return roundTo(amount);
  }
}

export interface TrajectoryCalculationOptions {
  referenceDate?: Date;
  horizonMonths?: number;
  includeSensitivity?: boolean;
}

/**
 * Deterministically calculates a living goal's financial trajectory
 */
export function calculateLivingGoalTrajectory(
  goal: FinancialGoal,
  allocatedMonthlyAmount: number,
  options: TrajectoryCalculationOptions = {}
): GoalTrajectoryData {
  const referenceDate = options.referenceDate || new Date();
  const horizonMonths = options.horizonMonths || 120; // 10-year max horizon
  const targetAmount = Math.max(0, goal.targetAmount || 0);
  const currentAmount = Math.max(0, goal.currentAmount || 0);
  const growthRate = Math.max(0, goal.expectedGrowthRate || 0); // e.g. 0.05 for 5% annual
  const monthlyGrowthRate = growthRate > 0 ? Math.pow(1 + growthRate, 1 / 12) - 1 : 0;

  const targetDateStr = goal.targetDate || formatDateToISO(addMonths(referenceDate, 24));
  const targetDateObj = parseDate(targetDateStr);

  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const currentProgress = targetAmount > 0
    ? Math.min(100, roundTo((currentAmount / targetAmount) * 100, 1))
    : 100;

  const monthsUntilTarget = Math.max(1, differenceInMonths(targetDateObj, referenceDate));

  // Required monthly pace (without growth assumption for conservative budgeting)
  const requiredMonthlyContribution = remainingAmount > 0
    ? roundTo(remainingAmount / monthsUntilTarget)
    : 0;

  const monthlySurplus = Math.max(0, roundTo(allocatedMonthlyAmount - requiredMonthlyContribution));
  const monthlyShortfall = Math.max(0, roundTo(requiredMonthlyContribution - allocatedMonthlyAmount));

  // Build month-by-month trajectory points
  const trajectoryPoints: GoalTrajectoryPoint[] = [];
  let accumulated = currentAmount;
  let estimatedCompletionDate: string = "Trajectory does not arrive";
  let estimatedMonthIndex: number | null = accumulated >= targetAmount ? 0 : null;

  trajectoryPoints.push({
    monthIndex: 0,
    date: formatDateToISO(referenceDate),
    accumulatedAmount: roundTo(accumulated),
    targetAmount,
    monthlyContribution: 0,
    growthAmount: 0,
    isReached: accumulated >= targetAmount,
  });

  for (let m = 1; m <= horizonMonths; m++) {
    const pointDate = formatDateToISO(addMonths(referenceDate, m));
    
    // Apply monthly growth first
    const growth = monthlyGrowthRate > 0 ? accumulated * monthlyGrowthRate : 0;
    
    // Add contribution only until target is reached
    const contribution = accumulated < targetAmount ? allocatedMonthlyAmount : 0;
    
    accumulated = accumulated + growth + contribution;
    const isReached = accumulated >= targetAmount;

    if (estimatedMonthIndex === null && isReached) {
      estimatedMonthIndex = m;
      estimatedCompletionDate = pointDate;
    }

    // Keep recording points up to 36 months or 12 months past arrival
    if (m <= 36 || (estimatedMonthIndex !== null && m <= estimatedMonthIndex + 6)) {
      trajectoryPoints.push({
        monthIndex: m,
        date: pointDate,
        accumulatedAmount: roundTo(accumulated),
        targetAmount,
        monthlyContribution: roundTo(contribution),
        growthAmount: roundTo(growth),
        isReached,
      });
    }
  }

  // Handle case where target was already met at month 0
  if (currentAmount >= targetAmount) {
    estimatedCompletionDate = formatDateToISO(referenceDate);
    estimatedMonthIndex = 0;
  }

  const isAchievable = estimatedMonthIndex !== null;

  // Calculate schedule variance
  let scheduleVarianceMonths = 0;
  let scheduleVarianceDays = 0;

  if (estimatedMonthIndex !== null) {
    scheduleVarianceMonths = estimatedMonthIndex - monthsUntilTarget;
    scheduleVarianceDays = scheduleVarianceMonths * 30;
  } else {
    // Horizon exceeded
    scheduleVarianceMonths = 999;
    scheduleVarianceDays = 999 * 30;
  }

  // Sensitivity Matrices
  const impactOfIncreasedContributions = computeContributionSensitivity(
    goal,
    allocatedMonthlyAmount,
    targetDateObj,
    referenceDate,
    [10, 25, 50, 100]
  );

  const impactOfReducedContributions = computeContributionSensitivity(
    goal,
    allocatedMonthlyAmount,
    targetDateObj,
    referenceDate,
    [-10, -25, -50, -75]
  );

  const impactOfOneTimeWithdrawals = computeWithdrawalSensitivity(
    goal,
    allocatedMonthlyAmount,
    targetDateObj,
    referenceDate
  );

  return {
    currentProgress,
    remainingAmount: roundTo(remainingAmount),
    projectedMonthlyProgress: roundTo(allocatedMonthlyAmount),
    estimatedCompletionDate,
    scheduleVarianceMonths,
    scheduleVarianceDays,
    requiredMonthlyContribution,
    allocatedMonthlyContribution: roundTo(allocatedMonthlyAmount),
    monthlySurplus,
    monthlyShortfall,
    impactOfIncreasedContributions,
    impactOfReducedContributions,
    impactOfOneTimeWithdrawals,
    trajectoryPoints,
    isAchievable,
  };
}

/**
 * Calculates sensitivity impacts for changing monthly contributions
 */
export function computeContributionSensitivity(
  goal: FinancialGoal,
  baselineMonthly: number,
  targetDate: Date,
  referenceDate: Date,
  percentageDeltas: number[]
): ContributionSensitivityImpact[] {
  const remaining = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));
  if (remaining <= 0) return [];

  const monthsUntilTarget = Math.max(1, differenceInMonths(targetDate, referenceDate));

  return percentageDeltas.map((pct) => {
    const multiplier = 1 + pct / 100;
    const newMonthly = Math.max(0, roundTo(baselineMonthly * multiplier));
    const additionalMonthly = roundTo(newMonthly - baselineMonthly);

    let monthsNeeded = 999;
    let newEstimatedDate = "Trajectory does not arrive";
    let isAchievableBeforeDeadline = false;

    if (newMonthly > 0) {
      monthsNeeded = Math.ceil(remaining / newMonthly);
      newEstimatedDate = formatDateToISO(addMonths(referenceDate, monthsNeeded));
      isAchievableBeforeDeadline = monthsNeeded <= monthsUntilTarget;
    }

    const baselineMonthsNeeded = baselineMonthly > 0 ? Math.ceil(remaining / baselineMonthly) : 999;
    const monthsDelta = monthsNeeded - baselineMonthsNeeded;

    return {
      percentageChange: pct,
      monthlyAmount: newMonthly,
      additionalMonthly,
      estimatedCompletionDate: newEstimatedDate,
      monthsDelta,
      isAchievableBeforeDeadline,
    };
  });
}

/**
 * Calculates sensitivity impacts for one-time capital withdrawals
 */
export function computeWithdrawalSensitivity(
  goal: FinancialGoal,
  allocatedMonthly: number,
  targetDate: Date,
  referenceDate: Date
): WithdrawalSensitivityImpact[] {
  const currentAmount = Math.max(0, goal.currentAmount || 0);
  const targetAmount = Math.max(0, goal.targetAmount || 0);
  const remainingCurrent = Math.max(0, targetAmount - currentAmount);
  const monthsUntilTarget = Math.max(1, differenceInMonths(targetDate, referenceDate));

  // Determine standard withdrawal test amounts
  const withdrawalAmounts: number[] = [];
  if (currentAmount > 500) withdrawalAmounts.push(Math.round(currentAmount * 0.1));
  if (currentAmount > 1000) withdrawalAmounts.push(Math.round(currentAmount * 0.25));
  if (currentAmount > 2000) withdrawalAmounts.push(Math.round(currentAmount * 0.5));
  if (withdrawalAmounts.length === 0) {
    withdrawalAmounts.push(500, 1000, 2000);
  }

  const uniqueAmounts = Array.from(new Set(withdrawalAmounts)).filter((amt) => amt > 0);

  return uniqueAmounts.map((amt) => {
    const postWithdrawalCurrent = Math.max(0, currentAmount - amt);
    const postWithdrawalRemaining = Math.max(0, targetAmount - postWithdrawalCurrent);

    let monthsNeeded = 999;
    let newDate = "Trajectory does not arrive";
    let delayMonths = 0;

    if (allocatedMonthly > 0) {
      monthsNeeded = Math.ceil(postWithdrawalRemaining / allocatedMonthly);
      newDate = formatDateToISO(addMonths(referenceDate, monthsNeeded));
      const baselineMonths = Math.ceil(remainingCurrent / allocatedMonthly);
      delayMonths = Math.max(0, monthsNeeded - baselineMonths);
    } else {
      delayMonths = 999;
    }

    // Required monthly recovery: extra contribution needed to make up the withdrawal before targetDate
    const requiredMonthlyRecovery = monthsUntilTarget > 0 ? roundTo(amt / monthsUntilTarget) : amt;

    return {
      withdrawalAmount: amt,
      remainingAmountAfterWithdrawal: roundTo(postWithdrawalRemaining),
      newEstimatedCompletionDate: newDate,
      delayMonths,
      delayDays: delayMonths * 30,
      requiredMonthlyRecovery,
    };
  });
}

/**
 * Evaluates Goal Health with deep multi-factor causal analysis
 */
export function evaluateGoalHealth(
  goal: FinancialGoal,
  trajectory: GoalTrajectoryData,
  cashFlowCapacity: number = 0,
  emergencyBufferMonths: number = 6
): GoalHealth {
  const { currentProgress, scheduleVarianceMonths, monthlyShortfall, allocatedMonthlyContribution, requiredMonthlyContribution, isAchievable } = trajectory;
  const flexibility = goal.flexibilityOfDeadline || "MODERATE";

  // 1. COMPLETED
  if (currentProgress >= 100) {
    return {
      classification: "ON_TRACK",
      primaryReason: "Destination capital fully achieved.",
      contributingFactors: ["Target balance satisfied in full", "No further cash allocation required"],
      currentTrajectory: "Goal completed and secured.",
    };
  }

  // 2. CRITICAL
  if (!isAchievable || allocatedMonthlyContribution <= 0) {
    const recIncrease = requiredMonthlyContribution;
    return {
      classification: "CRITICAL",
      primaryReason: "Zero or negative monthly allocation makes goal achievement mathematically impossible from ongoing cash flow.",
      contributingFactors: [
        "No monthly contribution currently dedicated to this goal",
        `Requires minimum ${recIncrease}/month to reach target date`,
        "Trajectory is currently frozen",
      ],
      currentTrajectory: "Frozen trajectory with zero forward progress.",
      recommendedRecoveryPath: {
        monthlyContributionIncrease: recIncrease,
        targetAmountReduction: roundTo(goal.targetAmount * 0.3),
        summary: `Allocate at least ${recIncrease}/mo or reduce target amount by 30% to unblock trajectory.`,
      },
    };
  }

  // 3. DELAYED
  if (scheduleVarianceMonths > 6 || (flexibility === "STRICT" && scheduleVarianceMonths > 0)) {
    const delayMonths = scheduleVarianceMonths;
    return {
      classification: "DELAYED",
      primaryReason: `Projected arrival is delayed by ${delayMonths} months beyond intended deadline.`,
      contributingFactors: [
        `Monthly contribution pace is ${monthlyShortfall}/mo lower than required rate`,
        `Current completion date is projected for ${trajectory.estimatedCompletionDate}`,
        flexibility === "STRICT" ? "Deadline is strict with zero delay tolerance" : "Accumulation pace is significantly behind schedule",
      ],
      currentTrajectory: `Delayed arrival with ${monthlyShortfall}/mo contribution shortfall.`,
      recommendedRecoveryPath: {
        monthlyContributionIncrease: monthlyShortfall,
        targetDateDelayMonths: delayMonths,
        summary: `Increase contribution by ${monthlyShortfall}/mo or adjust target date by +${delayMonths} months.`,
      },
    };
  }

  // 4. AT_RISK
  if (scheduleVarianceMonths > 0 || monthlyShortfall >= 1) {
    return {
      classification: "AT_RISK",
      primaryReason: "Current contribution pace is slightly below the required rate to meet the target date.",
      contributingFactors: [
        `Monthly shortfall of ${monthlyShortfall}/mo against required pace of ${requiredMonthlyContribution}/mo`,
        `Projected delay of ${scheduleVarianceMonths} months`,
        emergencyBufferMonths < 3 ? "Thin liquidity buffer increases vulnerability to shocks" : "Manageable shortfall with modest adjustment",
      ],
      currentTrajectory: `Trending behind schedule by ~${scheduleVarianceMonths} months.`,
      recommendedRecoveryPath: {
        monthlyContributionIncrease: monthlyShortfall,
        targetDateDelayMonths: scheduleVarianceMonths,
        summary: `Add ${monthlyShortfall}/mo to close the trajectory gap.`,
      },
    };
  }

  // 5. WATCH
  if (allocatedMonthlyContribution === requiredMonthlyContribution || emergencyBufferMonths < 3) {
    return {
      classification: "WATCH",
      primaryReason: "Goal is currently on schedule, but operating with thin safety margins.",
      contributingFactors: [
        "Contribution rate matches required rate exactly with zero margin for error",
        emergencyBufferMonths < 3 ? "Overall emergency reserves are below 3 months" : "Any future expense shock could create a delay",
      ],
      currentTrajectory: "Balanced trajectory with tight variance margin.",
      recommendedRecoveryPath: {
        monthlyContributionIncrease: roundTo(requiredMonthlyContribution * 0.1),
        summary: `Add a 10% safety cushion (+${roundTo(requiredMonthlyContribution * 0.1)}/mo) to buffer against unexpected expenses.`,
      },
    };
  }

  // 6. ON_TRACK
  return {
    classification: "ON_TRACK",
    primaryReason: "Current contribution trajectory is fully aligned with target arrival.",
    contributingFactors: [
      `Allocated contribution of ${allocatedMonthlyContribution}/mo exceeds required rate of ${requiredMonthlyContribution}/mo`,
      scheduleVarianceMonths < 0 ? `Ahead of schedule by ${Math.abs(scheduleVarianceMonths)} months` : "On pace for target arrival",
      "Healthy financial trajectory",
    ],
    currentTrajectory: scheduleVarianceMonths < 0
      ? `Accelerated trajectory arriving ${Math.abs(scheduleVarianceMonths)} months early.`
      : "Steady trajectory on track for target date.",
  };
}

/**
 * Evaluates Goal Risk Profile
 */
export function evaluateGoalRisk(
  goal: FinancialGoal,
  trajectory: GoalTrajectoryData,
  emergencyBufferMonths: number = 6
): GoalRisk {
  const threats: string[] = [];
  let riskScore = 20; // baseline

  if (trajectory.monthlyShortfall > 0) {
    threats.push(`Pace deficit: shortfall of ${trajectory.monthlyShortfall}/mo against target schedule.`);
    riskScore += 30;
  }

  if (emergencyBufferMonths < 3) {
    threats.push("Low emergency liquidity cushion exposes goal to sudden liquidation.");
    riskScore += 25;
  }

  if (trajectory.scheduleVarianceMonths > 6) {
    threats.push(`Significant schedule slippage (+${trajectory.scheduleVarianceMonths} months).`);
    riskScore += 25;
  }

  if (goal.flexibilityOfDeadline === "STRICT" && trajectory.scheduleVarianceMonths > 0) {
    threats.push("Strict deadline leaves zero tolerance for cash flow interruptions.");
    riskScore += 15;
  }

  const isInvestment = goal.category === "INVESTMENT_TARGET" || goal.category === "RETIREMENT";
  const marketExposure = isInvestment || (goal.expectedGrowthRate || 0) > 0.04;
  const inflationExposure = (trajectory.scheduleVarianceMonths > 24) || (goal.targetAmount > 500000);

  if (marketExposure) {
    threats.push("Growth rate assumptions subject to asset market volatility.");
  }

  const timePressure = trajectory.scheduleVarianceMonths > 3
    ? "HIGH"
    : trajectory.scheduleVarianceMonths > 0
    ? "MODERATE"
    : "NONE";

  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  if (riskScore >= 75) riskLevel = "CRITICAL";
  else if (riskScore >= 50) riskLevel = "HIGH";
  else if (riskScore >= 30) riskLevel = "MODERATE";

  return {
    riskLevel,
    primaryThreats: threats.length > 0 ? threats : ["No significant risks identified."],
    marketExposure,
    inflationExposure,
    timePressure,
    riskScore,
  };
}

/**
 * Evaluates Goal Confidence with explicit assumptions
 */
export function evaluateGoalConfidence(
  goal: FinancialGoal,
  trajectory: GoalTrajectoryData
): GoalConfidence {
  const assumptions: string[] = [];
  const missingVariables: string[] = [];
  let score = 85;

  assumptions.push(`Monthly contribution of ${trajectory.allocatedMonthlyContribution}/mo remains steady.`);
  
  if (goal.expectedGrowthRate && goal.expectedGrowthRate > 0) {
    assumptions.push(`Annual growth rate of ${(goal.expectedGrowthRate * 100).toFixed(1)}% is achieved continuously.`);
    score -= 10;
  } else {
    assumptions.push("Zero investment growth assumed (conservative cash accumulation).");
  }

  if (!goal.startDate) {
    missingVariables.push("Historical start date not specified; assuming accumulation starts from current balance.");
    score -= 5;
  }

  if (trajectory.allocatedMonthlyContribution <= 0) {
    missingVariables.push("No dedicated monthly cash allocation assigned.");
    score -= 25;
  }

  score = Math.min(100, Math.max(10, score));

  let level: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
  if (score < 50) level = "LOW";
  else if (score < 75) level = "MEDIUM";

  let reasoning = "";
  if (level === "HIGH") {
    reasoning = `At your current contribution trajectory, you are projected to reach this goal around ${trajectory.estimatedCompletionDate}.`;
  } else if (level === "MEDIUM") {
    reasoning = `Under your current assumptions, this goal is currently projected around ${trajectory.estimatedCompletionDate}.`;
  } else {
    reasoning = `The current estimate is around ${trajectory.estimatedCompletionDate}, but confidence is limited because key financial variables are unassigned.`;
  }

  return {
    level,
    score,
    keyAssumptions: assumptions,
    missingVariables,
    reasoning,
  };
}

/**
 * Evaluates Goal Robustness and shock absorption
 */
export function evaluateGoalRobustness(
  goal: FinancialGoal,
  trajectory: GoalTrajectoryData,
  cashFlowCapacity: number = 0
): GoalRobustness {
  const currentAmount = Math.max(0, goal.currentAmount || 0);
  const monthlyAllocation = trajectory.allocatedMonthlyContribution;
  const flexibility = goal.flexibilityOfDeadline || "MODERATE";

  const maxTolerableDelayMonths = flexibility === "STRICT" ? 0 : flexibility === "MODERATE" ? 3 : 12;
  
  // Max sustainable one-time withdrawal without exceeding tolerable delay
  const maxSustainableWithdrawal = monthlyAllocation > 0
    ? roundTo(monthlyAllocation * maxTolerableDelayMonths + (trajectory.monthlySurplus * 6))
    : 0;

  const bufferMonths = monthlyAllocation > 0 ? roundTo(currentAmount / monthlyAllocation, 1) : 0;

  let resilienceScore = 60;
  if (trajectory.monthlySurplus > 0) resilienceScore += 20;
  if (bufferMonths >= 6) resilienceScore += 15;
  if (trajectory.monthlyShortfall > 0) resilienceScore -= 25;
  if (flexibility === "STRICT") resilienceScore -= 10;

  resilienceScore = Math.min(100, Math.max(10, resilienceScore));

  const resilienceSummary = resilienceScore >= 75
    ? "Highly robust: can absorb unexpected spending shocks without compromising target arrival."
    : resilienceScore >= 50
    ? "Moderate robustness: sensitive to multi-month contribution pauses."
    : "Vulnerable: any capital drain or reduction will directly cause target deadline delays.";

  return {
    resilienceScore,
    maxSustainableWithdrawal: Math.min(currentAmount, maxSustainableWithdrawal),
    maxTolerableDelayMonths,
    bufferMonths,
    resilienceSummary,
  };
}

/**
 * Assembles the full Aimly Goal Intelligence Model for a single living goal
 */
export function buildLivingGoalModel(
  goal: FinancialGoal,
  allocatedMonthlyAmount: number,
  context: {
    referenceDate?: Date;
    emergencyBufferMonths?: number;
    cashFlowCapacity?: number;
  } = {}
): AimlyGoalIntelligenceModel {
  const referenceDate = context.referenceDate || new Date();
  const emergencyBufferMonths = context.emergencyBufferMonths ?? 6;
  const cashFlowCapacity = context.cashFlowCapacity ?? allocatedMonthlyAmount;

  // 1. Calculate Trajectory
  const trajectory = calculateLivingGoalTrajectory(goal, allocatedMonthlyAmount, {
    referenceDate,
  });

  // 2. Calculate Intelligence Dimensions
  const health = evaluateGoalHealth(goal, trajectory, cashFlowCapacity, emergencyBufferMonths);
  const risk = evaluateGoalRisk(goal, trajectory, emergencyBufferMonths);
  const confidence = evaluateGoalConfidence(goal, trajectory);
  const robustness = evaluateGoalRobustness(goal, trajectory, cashFlowCapacity);

  // 3. Delays & Schedule Variance
  const delays: GoalDelayData = {
    scheduleVarianceMonths: trajectory.scheduleVarianceMonths,
    scheduleVarianceDays: trajectory.scheduleVarianceDays,
    isDelayed: trajectory.scheduleVarianceMonths > 0,
    isAhead: trajectory.scheduleVarianceMonths < 0,
    isOnTrack: trajectory.scheduleVarianceMonths === 0,
    delayClassification:
      trajectory.scheduleVarianceMonths > 6
        ? "SEVERE_DELAY"
        : trajectory.scheduleVarianceMonths > 2
        ? "MODERATE_DELAY"
        : trajectory.scheduleVarianceMonths > 0
        ? "SLIGHT_DELAY"
        : "ON_TIME",
  };

  // 4. Accelerators & Threats
  const accelerators: GoalAccelerator[] = [];
  if (trajectory.impactOfIncreasedContributions.length > 0) {
    const boost = trajectory.impactOfIncreasedContributions[1] || trajectory.impactOfIncreasedContributions[0];
    if (boost && boost.monthsDelta < 0) {
      accelerators.push({
        description: `Boost monthly contribution by +${boost.additionalMonthly} (+${boost.percentageChange}%)`,
        potentialMonthsSaved: Math.abs(boost.monthsDelta),
        additionalContributionRequired: boost.additionalMonthly,
      });
    }
  }

  const threats: GoalThreat[] = risk.primaryThreats.map((t) => ({
    threatType: "TRAJECTORY_RISK",
    description: t,
    severity: risk.riskLevel,
    potentialDelayMonths: trajectory.scheduleVarianceMonths > 0 ? trajectory.scheduleVarianceMonths : 1,
  }));

  const dependencies: GoalDependency[] = [];
  const impactEvents: GoalImpactEvent[] = [];

  return {
    goalId: goal.id,
    core: goal,
    trajectory,
    health,
    risk,
    confidence,
    robustness,
    delays,
    dependencies,
    impactEvents,
    accelerators,
    threats,
  };
}

/**
 * Evaluates multiple living goals with priority waterfall allocation of free cash flow
 */
export function evaluateMultipleLivingGoals(
  goals: FinancialGoal[],
  totalMonthlyFreeCashFlow: number,
  context: {
    referenceDate?: Date;
    emergencyBufferMonths?: number;
  } = {}
): AimlyGoalIntelligenceModel[] {
  if (!goals || goals.length === 0) return [];

  const priorityOrder: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  const sortedGoals = [...goals].sort((a, b) => {
    const pA = priorityOrder[a.priority || "MEDIUM"] || 3;
    const pB = priorityOrder[b.priority || "MEDIUM"] || 3;
    if (pA !== pB) return pA - pB;
    return (a.targetDate || "").localeCompare(b.targetDate || "");
  });

  let remainingCashFlow = Math.max(0, totalMonthlyFreeCashFlow);
  const models: AimlyGoalIntelligenceModel[] = [];

  for (const goal of sortedGoals) {
    // If goal has explicit monthly contribution set, respect it up to remaining cash flow
    const explicitMonthly = normalizeContributionToMonthly(
      goal.monthlyContribution || goal.monthlyAllocation || 0,
      goal.contributionFrequency
    );

    let allocated = 0;
    if (explicitMonthly > 0) {
      allocated = Math.min(explicitMonthly, remainingCashFlow);
    } else {
      // Calculate required pace and allocate from waterfall
      const remainingTarget = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));
      const targetObj = goal.targetDate ? parseDate(goal.targetDate) : addMonths(context.referenceDate || new Date(), 24);
      const months = Math.max(1, differenceInMonths(targetObj, context.referenceDate || new Date()));
      const required = Math.ceil(remainingTarget / months);
      allocated = Math.min(remainingCashFlow, required > 0 ? required : remainingCashFlow);
    }

    remainingCashFlow = Math.max(0, remainingCashFlow - allocated);

    models.push(
      buildLivingGoalModel(goal, allocated, {
        ...context,
        cashFlowCapacity: totalMonthlyFreeCashFlow,
      })
    );
  }

  return models;
}
