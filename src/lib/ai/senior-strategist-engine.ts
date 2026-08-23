/**
 * Senior Wealth Strategist Intelligence Engine
 * Emulates a 30+ year private wealth strategist and financial trajectory architect.
 * Produces institutional-grade, highly articulate master strategic assessments
 * and deterministic tactical action pillars across any financial profile.
 */

import { formatCurrency } from "../utils/currency";
import { formatMonthYear } from "../utils/date";
import { CurrencyCode } from "../types/finance";

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
    decisionContext,
  } = context;

  const livingBufferMonths =
    monthlyOutflow > 0
      ? Number((totalLiquidSavings / monthlyOutflow).toFixed(1))
      : 12;

  const isDeficit = monthlyFreeCashFlow < 0;
  const isAhead = !isDeficit && monthlyFreeCashFlow >= requiredMonthlySavings * 1.25;
  const isOnTrack = !isDeficit && monthlyFreeCashFlow >= requiredMonthlySavings;
  const isPaceShortfall = !isDeficit && monthlyFreeCashFlow < requiredMonthlySavings;

  const targetDateStr = formatMonthYear(targetDate);
  const targetAmtStr = formatCurrency(targetAmount, currency);
  const liquidStr = formatCurrency(totalLiquidSavings, currency);
  const inflowStr = formatCurrency(monthlyInflow, currency);
  const outflowStr = formatCurrency(monthlyOutflow, currency);
  const fcfStr = formatCurrency(Math.abs(monthlyFreeCashFlow), currency);
  const reqStr = formatCurrency(requiredMonthlySavings, currency);

  // =========================================================================
  // SCENARIO 1: CAPITAL DEFICIT / BURN RATE (Inflows < Outflows)
  // =========================================================================
  if (isDeficit) {
    const monthlyBurn = Math.abs(monthlyFreeCashFlow);
    const burnRunwayMonths =
      monthlyBurn > 0
        ? Number((totalLiquidSavings / monthlyBurn).toFixed(1))
        : 0;

    const headlineVerdict = "Critical Burn Rate: Structural Deficit Detected";
    const whatYouCanDo = `Halt discretionary outlays immediately; stabilize monthly cash balance to stop the -${fcfStr}/mo capital drain.`;
    const whatItChanges = `Goal trajectory is temporarily paused while liquid reserves (${liquidStr}) absorb fixed living obligations.`;
    const toStayOnTrack = `Reclaim +${fcfStr}/mo in fixed spending or secondary income to restore baseline equilibrium before funding the goal.`;
    const strategicRead = `Your ${liquidStr} in liquid reserves provides an estimated ${burnRunwayMonths} months of operating runway under current burn.`;

    const masterStrategyParagraph = `From a 30-year wealth architecture perspective, your primary objective right now is not aggressive capital accumulation, but structural cash-flow stabilization. Your current monthly mandatory outflows (${outflowStr}) exceed your monthly gross inflows (${inflowStr}), resulting in a net monthly capital contraction of -${fcfStr}/mo. While your current liquid reserve of ${liquidStr} provides an estimated ${burnRunwayMonths}-month operational cushion, continuing at this burn rate without intervention will systematically erode the foundation needed to achieve your "${destinationTitle}" (${targetAmtStr}). The optimal three-phase strategy: First, execute an immediate 30-day line-item audit on recurring living obligations and debt servicing to recover at least +${fcfStr}/mo and bring your baseline to break-even. Second, insulate 3.0 to 6.0 months of essential living costs into a high-liquidity yield instrument. Third, once your net free cash flow turns positive and reaches the required target pace of ${reqStr}/mo, initiate automated capital allocations toward "${destinationTitle}". Restructuring cash flow now transforms a temporary burn-rate challenge into an enduring, high-velocity wealth machine.`;

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
    };
  }

  // =========================================================================
  // SCENARIO 2: DECISION PURCHASE SIMULATION (Specific purchase evaluation)
  // =========================================================================
  if (decisionContext && decisionContext.amount > 0) {
    const decAmtStr = formatCurrency(decisionContext.amount, currency);
    const remainingCash = Math.max(0, totalLiquidSavings - (decisionContext.isRecurring ? 0 : decisionContext.amount));
    const remainingCashStr = formatCurrency(remainingCash, currency);
    const extraPerMonth = Math.round(decisionContext.amount / Math.max(1, 12));
    const extraPerMonthStr = formatCurrency(extraPerMonth, currency);

    if (delayInDays <= 0) {
      const headlineVerdict = "Safe Execution: Zero Trajectory Disruption";
      const whatYouCanDo = `You can fund this ${decAmtStr} expenditure directly while maintaining ${remainingCashStr} in liquid reserves.`;
      const whatItChanges = `Your "${destinationTitle}" arrival remains locked on schedule for ${targetDateStr}.`;
      const toStayOnTrack = `Maintain your current automated monthly contribution of ${formatCurrency(monthlyFreeCashFlow, currency)}/mo.`;
      const strategicRead = `Your liquid cushion retains ${livingBufferMonths} months of living defense with zero compromise to life goals.`;

      const masterStrategyParagraph = `Evaluating this ${decAmtStr} allocation through the lens of private wealth engineering, your balance sheet demonstrates robust elasticity. Your net monthly surplus of ${formatCurrency(monthlyFreeCashFlow, currency)}/mo combined with ${liquidStr} in liquid reserves allows you to absorb this capital outlay without introducing drag on your anchor destination "${destinationTitle}" (${targetAmtStr}). Crucially, your post-decision liquid reserves (${remainingCashStr}) preserve ${livingBufferMonths} months of essential living defense, which exceeds our institutional safety threshold. You can proceed with full strategic confidence, keeping your automated savings protocols entirely uninterrupted.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths,
      };
    } else {
      const headlineVerdict = `Manageable Shift: +${delayInDays} Days Delay`;
      const whatYouCanDo = `Cash is physically available in reserves, but diverts ${decAmtStr} from primary capital velocity.`;
      const whatItChanges = `Shifts completion date of "${destinationTitle}" back by approximately +${delayInDays} days.`;
      const toStayOnTrack = `Boost monthly savings by +${extraPerMonthStr}/mo over the next 12 months to completely neutralize the delay.`;
      const strategicRead = `Cash availability does not equal plan availability; recovery requires deliberate pacing adjustment.`;

      const masterStrategyParagraph = `In thirty years of advising on capital preservation, the fundamental distinction between amateurs and disciplined wealth builders is simple: cash availability does not equal plan availability. You possess the ${decAmtStr} in physical liquid cash today, but executing this expenditure creates an opportunity cost of +${delayInDays} days on your "${destinationTitle}" milestone (${targetAmtStr}). If this outlay is a high-conviction priority, the institutional protocol to neutralize this delay is straightforward: temporarily increase your monthly allocation by +${extraPerMonthStr}/mo for the next 12 months, or spread the outflow over a 90-day tranche to preserve your baseline trajectory. This protects both your living cushion and your long-term wealth compounding velocity.`;

      return {
        archetype: "DECISION_PURCHASE_IMPACT",
        headlineVerdict,
        whatYouCanDo,
        whatItChanges,
        toStayOnTrack,
        strategicRead,
        masterStrategyParagraph,
        livingBufferMonths,
      };
    }
  }

  // =========================================================================
  // SCENARIO 3: TIGHT MARGIN / PACE SHORTFALL
  // =========================================================================
  if (isPaceShortfall) {
    const paceGap = requiredMonthlySavings - monthlyFreeCashFlow;
    const paceGapStr = formatCurrency(paceGap, currency);
    const currPaceStr = formatCurrency(monthlyFreeCashFlow, currency);

    const headlineVerdict = "Pace Adjustment Recommended: Timeline Extension Risk";
    const whatYouCanDo = `Allocate your full current free cash flow of ${currPaceStr}/mo directly toward "${destinationTitle}".`;
    const whatItChanges = `At current velocity (${currPaceStr}/mo), target completion will trail target date (${targetDateStr}).`;
    const toStayOnTrack = `Bridge the ${paceGapStr}/mo monthly gap via expense optimization or top-line income expansion.`;
    const strategicRead = `Your ${livingBufferMonths} months of liquid cushion provides stability while you accelerate cash flow velocity.`;

    const masterStrategyParagraph = `A comprehensive review of your financial trajectory reveals a sound foundational baseline, paired with an actionable velocity gap. You are generating a steady positive free cash flow of ${currPaceStr}/mo against ${outflowStr} in mandatory living commitments, backed by ${liquidStr} in liquid reserves (${livingBufferMonths} months of operational runway). However, achieving your "${destinationTitle}" goal of ${targetAmtStr} by ${targetDateStr} requires a dedicated monthly savings rate of ${reqStr}/mo—leaving a current pacing variance of ${paceGapStr}/mo. To close this gap without straining your lifestyle, execute a two-pronged trajectory acceleration: First, capture high-hanging discretionary micro-leaks (subscriptions, unoptimized recurring utility contracts) to reclaim an estimated 40–50% of the shortfall. Second, direct any variable windfalls, quarterly bonuses, or auxiliary revenue streams exclusively toward the goal's dedicated capital account. By calibrating this ${paceGapStr}/mo margin today, you convert a potential timeline delay into a guaranteed, on-schedule arrival.`;

    return {
      archetype: "TIGHT_MARGIN_SHORTFALL",
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      livingBufferMonths,
    };
  }

  // =========================================================================
  // SCENARIO 4: HIGH-VELOCITY ACCELERATOR / AHEAD
  // =========================================================================
  if (isAhead) {
    const currPaceStr = formatCurrency(monthlyFreeCashFlow, currency);
    const surplusPace = monthlyFreeCashFlow - requiredMonthlySavings;
    const surplusPaceStr = formatCurrency(surplusPace, currency);

    const headlineVerdict = "Elite Momentum: Ahead of Trajectory Schedule";
    const whatYouCanDo = `Continue automated allocation of ${currPaceStr}/mo; capital velocity exceeds benchmark by +${surplusPaceStr}/mo.`;
    const whatItChanges = `Projected to reach "${destinationTitle}" ahead of ${targetDateStr} with maximum resilience.`;
    const toStayOnTrack = `Lock surplus into compounding yield instruments while establishing secondary destination buckets.`;
    const strategicRead = `Exceptional cash flow efficiency (${livingBufferMonths} months of living defense and +${surplusPaceStr}/mo velocity surplus).`;

    const masterStrategyParagraph = `Your current balance sheet dynamics reflect exceptional discipline and top-tier wealth generation velocity. With a monthly net free cash flow of ${currPaceStr}/mo comfortably outperforming the required ${reqStr}/mo benchmark for "${destinationTitle}" (${targetAmtStr}), your capital trajectory is compounding ahead of schedule. Your ${liquidStr} in liquid reserves provides an impregnable ${livingBufferMonths} months of baseline living security. The senior strategist recommendation at this stage is strategic capital optimization: lock your required monthly pace into automated, high-yield goal tranches, and redirect the +${surplusPaceStr}/mo surplus into an opportunity reserve or a secondary long-term wealth bucket. You have achieved an institutional-grade financial posture where your money works with deterministic certainty toward your life ambitions.`;

    return {
      archetype: "HIGH_VELOCITY_ACCELERATOR",
      headlineVerdict,
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      strategicRead,
      masterStrategyParagraph,
      livingBufferMonths,
    };
  }

  // =========================================================================
  // SCENARIO 5: BALANCED ACCUMULATION / ON TRACK
  // =========================================================================
  const currPaceStr = formatCurrency(monthlyFreeCashFlow, currency);
  const headlineVerdict = "Fully On Track: Preserves Trajectory & Buffer";
  const whatYouCanDo = `Maintain current automated monthly savings of ${currPaceStr}/mo toward "${destinationTitle}".`;
  const whatItChanges = `Arrival timeline remains firmly on schedule for ${targetDateStr}.`;
  const toStayOnTrack = `Keep living expenses bounded within ${outflowStr}/mo to protect free cash flow consistency.`;
  const strategicRead = `Your financial foundation is robust, with ${livingBufferMonths} months of living cushion protecting your goal path.`;

  const masterStrategyParagraph = `Your deterministic financial model confirms that you are operating in an optimal state of equilibrium. Your gross inflows of ${inflowStr}/mo reliably service your ${outflowStr}/mo in living obligations while generating a dedicated free cash flow of ${currPaceStr}/mo—perfectly covering the ${reqStr}/mo needed to achieve "${destinationTitle}" (${targetAmtStr}) by ${targetDateStr}. Furthermore, your ${liquidStr} in liquid savings provides a healthy ${livingBufferMonths}-month emergency cushion against macro volatility. The strategic mandate now is strict execution fidelity: protect your savings automation from discretionary creep, review annual commitments quarterly, and allow the power of disciplined monthly compounding to deliver your destination exactly as modeled.`;

  return {
    archetype: "BALANCED_ACCUMULATION",
    headlineVerdict,
    whatYouCanDo,
    whatItChanges,
    toStayOnTrack,
    strategicRead,
    masterStrategyParagraph,
    livingBufferMonths,
  };
}
