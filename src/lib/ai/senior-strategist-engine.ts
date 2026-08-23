/**
 * Senior Financial Trajectory Architect Engine
 * Generates evidence-based, transparent, zero-hyperbole strategic assessments
 * and actionable recommendation pillars across financial profiles.
 * Strict adherence to evidence, facts, and constraint awareness.
 */

import { formatCurrency } from "../utils/currency";
import { formatMonthYear } from "../utils/date";
import { CurrencyCode, ExecutiveDecision, ConfidenceLevel } from "../types/finance";

export interface StrategistProfileContext {
  currency: CurrencyCode;
  monthlyInflow: number;
  monthlyOutflow: number;
  monthlyFreeCashFlow: number;
  totalLiquidSavings: number;
  assignedGoalCapital?: number;
  targetAmount: number;
  targetDate: string;
  destinationTitle: string;
  projectedDate?: string;
  delayInDays?: number;
  requiredMonthlySavings?: number;
  executiveDecision?: ExecutiveDecision;
  confidenceLevel?: ConfidenceLevel;
  reserveBufferMonths?: number;
  reserveTargetMonths?: number; // default 3.0
  decisionContext?: {
    title: string;
    amount: number;
    isRecurring: boolean;
    frequency?: string;
  };
}

export interface SeniorStrategistOutput {
  archetype:
    | "DEFICIT_BURN_RATE"
    | "TIGHT_MARGIN_SHORTFALL"
    | "BALANCED_ACCUMULATION"
    | "HIGH_VELOCITY_ACCELERATOR"
    | "DECISION_PURCHASE_IMPACT";
  headlineVerdict: string;
  whatYouCanDo: string;
  whatItChanges: string;
  toStayOnTrack: string;
  strategicRead: string;
  masterStrategyParagraph: string;
  burnRateRunwayMonths?: number;
  livingBufferMonths: number;
  executiveDecision: ExecutiveDecision;
  confidenceLevel: ConfidenceLevel;
}

export function generateSeniorStrategistAssessment(
  context: StrategistProfileContext
): SeniorStrategistOutput {
  const {
    currency,
    monthlyInflow,
    monthlyOutflow,
    monthlyFreeCashFlow,
    totalLiquidSavings,
    targetAmount,
    targetDate,
    destinationTitle,
    projectedDate,
    delayInDays = 0,
    requiredMonthlySavings = Math.round(targetAmount / 24),
    executiveDecision: inputDecision,
    confidenceLevel = "HIGH",
    reserveTargetMonths = 3.0,
    decisionContext,
  } = context;

  const livingBufferMonths =
    monthlyOutflow > 0
      ? Number((totalLiquidSavings / monthlyOutflow).toFixed(1))
      : 12;

  const isDeficit = monthlyFreeCashFlow < 0;
  const targetDateStr = formatMonthYear(targetDate);
  const projDateStr = projectedDate ? formatMonthYear(projectedDate) : targetDateStr;
  const targetAmtStr = formatCurrency(targetAmount, currency);
  const liquidStr = formatCurrency(totalLiquidSavings, currency);
  const inflowStr = formatCurrency(monthlyInflow, currency);
  const outflowStr = formatCurrency(monthlyOutflow, currency);
  const fcfStr = formatCurrency(Math.abs(monthlyFreeCashFlow), currency);
  const reqStr = formatCurrency(requiredMonthlySavings, currency);

  // Default Decision Determination if not passed
  let decision: ExecutiveDecision = inputDecision || "GO";
  if (isDeficit || livingBufferMonths < 1.0) {
    decision = "WAIT";
  } else if (livingBufferMonths < reserveTargetMonths || delayInDays > 30) {
    decision = "ADJUST";
  }

  // =========================================================================
  // SCENARIO 1: CAPITAL DEFICIT / BURN RATE (Inflows < Outflows)
  // =========================================================================
  if (isDeficit) {
    const monthlyBurn = Math.abs(monthlyFreeCashFlow);
    const burnRunwayMonths =
      monthlyBurn > 0
        ? Number((totalLiquidSavings / monthlyBurn).toFixed(1))
        : 0;

    const headlineVerdict = "Executive Decision: WAIT — Structural Deficit (Burn Rate Detected)";
    const whatYouCanDo = `Halt discretionary spending immediately to stabilize monthly cash flow and stop the -${fcfStr}/mo liquid drawdown.`;
    const whatItChanges = `Goal allocations for "${destinationTitle}" are paused while liquid reserves (${liquidStr}) cover fixed living obligations.`;
    const toStayOnTrack = `Reclaim +${fcfStr}/mo through spending reduction or income expansion to restore baseline equilibrium.`;
    const strategicRead = `Liquid reserves of ${liquidStr} provide approximately ${burnRunwayMonths} months of operating runway under current net monthly outflow.`;

    const masterStrategyParagraph = `From a 30-year wealth architecture perspective, your primary objective right now is not aggressive capital accumulation, but structural cash-flow stabilization. Your current monthly mandatory outflows (${outflowStr}) exceed your monthly gross inflows (${inflowStr}), resulting in a net monthly capital contraction of -${fcfStr}/mo. While your current liquid reserve of ${liquidStr} provides an estimated ${burnRunwayMonths}-month operational cushion, continuing at this burn rate without intervention will systematically erode the foundation needed to achieve your "Emergency fund" (${targetAmtStr}). First, execute a line-item audit on living obligations to recover at least +${fcfStr}/mo. Second, insulate 3.0 to 6.0 months of essential living costs into liquid reserves. Third, once net free cash flow turns positive, initiate automated capital allocations toward "${destinationTitle}".`;

    return {
      archetype: "DEFICIT_BURN_RATE",
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      burnRateRunwayMonths: burnRunwayMonths,
      livingBufferMonths,
      executiveDecision: "WAIT",
      confidenceLevel: "HIGH",
    };
  }

  // =========================================================================
  // SCENARIO 2: DECISION PURCHASE EVALUATION
  // =========================================================================
  if (decisionContext && decisionContext.amount > 0) {
    const decAmtStr = formatCurrency(decisionContext.amount, currency);
    const remainingCash = Math.max(0, totalLiquidSavings - (decisionContext.isRecurring ? 0 : decisionContext.amount));
    const remainingCashStr = formatCurrency(remainingCash, currency);
    const postBufferMonths = monthlyOutflow > 0 ? Number((remainingCash / monthlyOutflow).toFixed(1)) : 12;

    if (decision === "GO") {
      const headlineVerdict = "Executive Decision: GO — Plan & Buffer Intact";
      const whatYouCanDo = `You can fund this ${decAmtStr} allocation directly from liquid cash while retaining ${remainingCashStr} (${postBufferMonths} months) in reserves.`;
      const whatItChanges = `Your "${destinationTitle}" arrival remains projected on schedule for ${projDateStr}.`;
      const toStayOnTrack = `Maintain current automated monthly goal allocation of ${fcfStr}/mo.`;
      const strategicRead = `Post-purchase liquid buffer retains ${postBufferMonths} months of essential living defense, satisfying your ${reserveTargetMonths.toFixed(1)}-month target.`;

      const masterStrategyParagraph = `Financial calculations confirm that your monthly free cash flow (${fcfStr}/mo) and liquid reserves (${liquidStr}) can absorb this ${decAmtStr} outlay without breaching your 3.0-month emergency reserve target or delaying "${destinationTitle}" (${targetAmtStr}). Post-purchase liquid reserves (${remainingCashStr}) maintain ${postBufferMonths} months of essential living defense. Safe to proceed as planned.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths: postBufferMonths,
        executiveDecision: "GO",
        confidenceLevel,
      };
    } else if (decision === "ADJUST") {
      const headlineVerdict = `Executive Decision: ADJUST — ${delayInDays > 0 ? `+${delayInDays} Days Delay` : "Reserve Floor Breached"}`;
      const whatYouCanDo = postBufferMonths < reserveTargetMonths
        ? `Physical cash is available, but executing this outlay reduces liquid reserves to ${postBufferMonths} months (below your ${reserveTargetMonths.toFixed(1)}-month target).`
        : `Executing this outlay shifts completion of "${destinationTitle}" back by approximately +${delayInDays} days.`;
      
      const whatItChanges = `Projected arrival moves to ${projDateStr} (+${delayInDays} days delay).`;
      const toStayOnTrack = postBufferMonths < reserveTargetMonths
        ? `Reduce purchase budget or delay purchase by ${Math.ceil((monthlyOutflow * reserveTargetMonths - remainingCash) / Math.max(1, monthlyFreeCashFlow))} months to preserve your 3.0-month reserve floor.`
        : `Increase monthly goal allocation by +${formatCurrency(requiredMonthlySavings, currency)}/mo to neutralize the timeline shift.`;
      
      const strategicRead = `Cash availability does not equal plan availability; reserve floor or timeline protection requires adjustment.`;

      const masterStrategyParagraph = `Evaluating this ${decAmtStr} allocation against your active financial baseline reveals that cash availability does not equal plan availability. Post-purchase reserves (${remainingCashStr}) provide ${postBufferMonths} months of mandatory living buffer. Executing the expenditure shifts "${destinationTitle}" by +${delayInDays} days (Projected: ${projDateStr}). Recommendation: Adjust the purchase budget or save in advance to protect reserve stability.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths: postBufferMonths,
        executiveDecision: "ADJUST",
        confidenceLevel,
      };
    } else {
      const headlineVerdict = "Executive Decision: WAIT — Unacceptable Reserve Risk";
      const whatYouCanDo = `Pause this ${decAmtStr} purchase until dedicated savings are accumulated separately from emergency reserves.`;
      const whatItChanges = `Executing now depletes emergency reserves below safe operating thresholds or creates a monthly deficit.`;
      const toStayOnTrack = `Build dedicated goal funds to ${decAmtStr} while maintaining a full 3.0-month emergency reserve.`;
      const strategicRead = `Liquid reserves are insufficient to absorb this expenditure without creating vulnerability.`;

      const masterStrategyParagraph = `Quantitative evaluation indicates that executing this ${decAmtStr} expenditure presents significant liquidity risk. Post-purchase reserves would drop to ${postBufferMonths} months of mandatory expenses, leaving inadequate protection against income disruption. Recommendation: Wait until dedicated funds are accumulated, preserving your emergency buffer.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths: postBufferMonths,
        executiveDecision: "WAIT",
        confidenceLevel,
      };
    }
  }

  // =========================================================================
  // SCENARIO 3: TIGHT MARGIN SHORTFALL VS BALANCED ACCUMULATION
  // =========================================================================
  const isPaceShortfall = monthlyFreeCashFlow < requiredMonthlySavings;
  const archetype = isPaceShortfall ? "TIGHT_MARGIN_SHORTFALL" : "BALANCED_ACCUMULATION";

  const headlineVerdict = isPaceShortfall
    ? "Pace Adjustment Recommended: Timeline Velocity Shortfall"
    : decision === "GO"
    ? "Executive Decision: GO — On Track for Target Date"
    : decision === "ADJUST"
    ? "Executive Decision: ADJUST — Pace Shortfall Detected"
    : "Executive Decision: WAIT — Reserve Buffer Below Target";

  const whatYouCanDo = `Allocate ${fcfStr}/mo toward "${destinationTitle}" (${targetAmtStr}).`;
  const whatItChanges = `Current projected completion is ${projDateStr}.`;
  const toStayOnTrack = isPaceShortfall
    ? `Bridge the monthly pace gap of ${formatCurrency(Math.max(0, requiredMonthlySavings - monthlyFreeCashFlow), currency)}/mo.`
    : `Maintain current automated savings rate of ${fcfStr}/mo.`;
  
  const strategicRead = `Baseline living cushion provides ${livingBufferMonths} months of mandatory expense protection.`;

  const masterStrategyParagraph = `A comprehensive review reveals a baseline with an actionable velocity gap. You generate ${fcfStr}/mo free cash flow against ${outflowStr} mandatory outlays. Achieving "${destinationTitle}" (${targetAmtStr}) by ${targetDateStr} requires ${reqStr}/mo—leaving a current pacing variance gap. Initiate trajectory acceleration to bridge the shortfall.`;

  return {
    archetype,
    headlineVerdict,
    whatYouCanDo,
    whatItChanges,
    toStayOnTrack,
    strategicRead,
    masterStrategyParagraph,
    livingBufferMonths,
    executiveDecision: decision,
    confidenceLevel,
  };

}
