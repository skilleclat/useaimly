/**
 * Mock AI Provider
 * High-fidelity, deterministic narrative synthesis.
 * Generates the 4 signature Useaimly sections in calm, neutral language without guilt or fear.
 */

import { DecisionExplanationPayload, AIExplanationResult } from "../../types/ai";
import { formatCurrency } from "../../utils/currency";
import { formatMonthYear } from "../../utils/date";
import { AIProvider } from "../provider-interface";

export class MockAIProvider implements AIProvider {
  readonly providerName = "mock" as const;

  async generateDecisionExplanation(
    payload: DecisionExplanationPayload
  ): Promise<AIExplanationResult> {
    const { simulation, profileSummary, goalSummary } = payload;
    const currency = (profileSummary.currency || "KES") as any;
    const primary = simulation.primaryGoalImpact;
    const isDelayed = primary.delayInMonths > 0;
    const cashAffordable = simulation.cashAffordable;
    const decisionAmount = simulation.decision.amount;

    // SECTION 1: WHAT YOU CAN DO
    let whatYouCanDo = "";
    if (cashAffordable) {
      whatYouCanDo = `You can technically make this payment from your current liquid reserves of ${formatCurrency(simulation.availableCashBefore, currency)}, which leaves ${formatCurrency(simulation.availableCashAfter, currency)} in your buffer.`;
    } else {
      whatYouCanDo = `You do not currently have sufficient liquid cash for this purchase without overdraft or borrowing. Your available reserves are ${formatCurrency(simulation.availableCashBefore, currency)}, leaving a shortfall of ${formatCurrency(Math.abs(simulation.availableCashAfter), currency)}.`;
    }

    // SECTION 2: WHAT IT CHANGES
    let whatItChanges = "";
    if (!cashAffordable) {
      whatItChanges = `Executing this expense immediately derails your monthly cash flow and depletes your essential liquidity cushion.`;
    } else if (isDelayed) {
      const baseDateFormatted = formatMonthYear(primary.baselineCompletionDate);
      const simDateFormatted = formatMonthYear(primary.simulatedCompletionDate);
      whatItChanges = `Your "${goalSummary.title}" goal completion moves from ${baseDateFormatted} to ${simDateFormatted} (a delay of ${primary.delayInMonths} month${primary.delayInMonths > 1 ? "s" : ""}).`;
    } else {
      whatItChanges = `Your primary destination timeline remains unchanged for ${formatMonthYear(goalSummary.targetDate)}. This expense is absorbed by your current cash flow buffer.`;
    }

    // SECTION 3: TO STAY ON TRACK
    let toStayOnTrack = "";
    if (primary.additionalMonthlySavingsRequired > 0) {
      toStayOnTrack = `You would need to save ${formatCurrency(primary.additionalMonthlySavingsRequired, currency)} more each month to maintain your original arrival date.`;
    } else if (!cashAffordable) {
      toStayOnTrack = `Pause this decision until your liquid buffer reaches at least ${formatCurrency(decisionAmount * 1.5, currency)} to protect essential living commitments.`;
    } else {
      toStayOnTrack = `No additional monthly savings are required. Your current monthly free cash flow of ${formatCurrency(profileSummary.monthlyFreeCashFlow, currency)} covers this without adjustment.`;
    }

    // SECTION 4: Useaimly'S READ (Concise, neutral, respectful, zero guilt)
    let UseaimlysRead = "";
    if (!cashAffordable) {
      UseaimlysRead = `This decision exceeds your current liquidity buffer and introduces risk to your upcoming commitments.`;
    } else if (isDelayed && primary.delayInMonths >= 3) {
      UseaimlysRead = `This decision puts significant pressure on your current plan, deferring your destination by a full quarter.`;
    } else if (isDelayed) {
      UseaimlysRead = `This is manageable within your existing buffer, but requires increasing monthly savings to preserve your target date.`;
    } else {
      UseaimlysRead = `This decision is fully aligned with your plan and keeps your primary destination on schedule.`;
    }

    // Build headline
    const headline = cashAffordable
      ? isDelayed
        ? `Cash Affordable, but Shifts "${goalSummary.title}" Timeline`
        : `Fully Affordable — Zero Goal Delay`
      : `Cash Deficit Warning: Exceeds Liquid Reserves`;

    return {
      whatYouCanDo,
      whatItChanges,
      toStayOnTrack,
      UseaimlysRead,
      headline,
      directAnswer: whatYouCanDo,
      cashAffordabilityVerdict: whatYouCanDo,
      planAffordabilityVerdict: whatItChanges,
      tradeoffAnalysis: UseaimlysRead,
      actionableRecommendation: toStayOnTrack,
      recoveryGuidance: simulation.recoveryPlan?.explanation,
      confidenceScore: 0.98,
      providerUsed: "mock",
      generatedAt: new Date().toISOString(),
    };
  }
}
