import { addMonths, formatDateToISO } from "@/lib/utils/date";

export interface TrajectoryPoint {
  monthIndex: number;
  date: string;
  baselineSavings: number;
  simulatedSavings: number;
  targetGoalAmount: number;
  baselineGoalReached: boolean;
  simulatedGoalReached: boolean;
}

export interface TrajectoryCurveSummary {
  points: TrajectoryPoint[];
  baselineArrivalMonth: number | null;
  simulatedArrivalMonth: number | null;
  delayMonths: number;
  delayDays: number;
}

/**
 * Generates month-by-month capital accumulation trajectories for baseline vs simulated decision.
 */
export function generateTrajectoryLedger(
  targetAmount: number,
  baselineInitialSavings: number,
  baselineMonthlyCashFlow: number,
  simulatedInitialSavings: number,
  simulatedMonthlyCashFlow: number,
  horizonMonths: number = 36,
  referenceDate: Date = new Date()
): TrajectoryCurveSummary {
  const points: TrajectoryPoint[] = [];

  let currentBaseline = baselineInitialSavings;
  let currentSimulated = simulatedInitialSavings;

  let baselineArrivalMonth: number | null = currentBaseline >= targetAmount ? 0 : null;
  let simulatedArrivalMonth: number | null = currentSimulated >= targetAmount ? 0 : null;

  for (let m = 0; m <= horizonMonths; m++) {
    const pointDate = formatDateToISO(addMonths(referenceDate, m));

    if (m > 0) {
      currentBaseline += Math.max(0, baselineMonthlyCashFlow);
      currentSimulated += Math.max(0, simulatedMonthlyCashFlow);
    }

    const baselineGoalReached = currentBaseline >= targetAmount;
    const simulatedGoalReached = currentSimulated >= targetAmount;

    if (baselineArrivalMonth === null && baselineGoalReached) {
      baselineArrivalMonth = m;
    }

    if (simulatedArrivalMonth === null && simulatedGoalReached) {
      simulatedArrivalMonth = m;
    }

    points.push({
      monthIndex: m,
      date: pointDate,
      baselineSavings: Math.round(currentBaseline),
      simulatedSavings: Math.round(currentSimulated),
      targetGoalAmount: targetAmount,
      baselineGoalReached,
      simulatedGoalReached,
    });
  }

  // Calculate delay in months and days
  let delayMonths = 0;
  if (baselineArrivalMonth !== null && simulatedArrivalMonth !== null) {
    delayMonths = Math.max(0, simulatedArrivalMonth - baselineArrivalMonth);
  } else if (baselineArrivalMonth !== null && simulatedArrivalMonth === null) {
    // Decision causes goal not to arrive within the horizon
    delayMonths = horizonMonths - baselineArrivalMonth;
  }

  const delayDays = delayMonths * 30;

  return {
    points,
    baselineArrivalMonth,
    simulatedArrivalMonth,
    delayMonths,
    delayDays,
  };
}
