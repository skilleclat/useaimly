import { CurrencyCode } from "@/lib/types/finance";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";

export type InsightSeverity = "INFO" | "NOTICE" | "WARNING" | "CRITICAL";

export interface ProactiveInsightItem {
  id: string;
  title: string;
  explanation: string;
  severity: InsightSeverity;
  category: "PACE" | "COMMITMENT" | "DEBT" | "CONFLICT" | "VELOCITY" | "CUMULATIVE_DRAG";
  relatedGoalTitle?: string;
  relatedGoalId?: string;
  suggestedAction: {
    label: string;
    href: string;
  };
  isRead?: boolean;
  isDismissed?: boolean;
  detectedAt: string;
}

export interface InsightEngineInput {
  currency: CurrencyCode;
  monthlyGrossIncome: number;
  monthlyLivingExpenses: number;
  monthlyDebtService: number;
  monthlyFreeCashFlow: number;
  totalLiquidSavings: number;
  primaryGoal: {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    requiredMonthlyContribution: number;
    targetDate: string;
    projectedArrivalDate: string;
    monthsAheadOrBehind: number; // positive = ahead, negative = behind
  };
  activeGoalsCount: number;
  totalGoalsAllocated: number;
  upcomingCommitmentDueInDays?: {
    title: string;
    amount: number;
    dueInDays: number;
  };
  recentDecisionsDelayWeeks: number;
}

/**
 * Deterministic Proactive Insight Rules Engine.
 * Evaluates core financial indicators without spam or AI hallucinations.
 */
export function generateProactiveInsights(input: InsightEngineInput): ProactiveInsightItem[] {
  const insights: ProactiveInsightItem[] = [];
  const { currency } = input;

  // 1. RULE: Pace Shortfall Check
  if (input.primaryGoal.requiredMonthlyContribution > input.primaryGoal.monthlyContribution) {
    const monthlyShortfall = input.primaryGoal.requiredMonthlyContribution - input.primaryGoal.monthlyContribution;
    insights.push({
      id: "ins-pace-shortfall",
      title: `You need ${formatCurrency(monthlyShortfall, currency)} more per month to stay on your target date.`,
      explanation: `To reach your ${formatCurrency(input.primaryGoal.targetAmount, currency)} destination by ${formatMonthYear(input.primaryGoal.targetDate)}, your monthly pace must increase from ${formatCurrency(input.primaryGoal.monthlyContribution, currency)}/mo to ${formatCurrency(input.primaryGoal.requiredMonthlyContribution, currency)}/mo.`,
      severity: "WARNING",
      category: "PACE",
      relatedGoalTitle: input.primaryGoal.title,
      relatedGoalId: input.primaryGoal.id,
      suggestedAction: {
        label: "Simulate Monthly Pace in What If?",
        href: "/app/what-if",
      },
      detectedAt: new Date().toISOString(),
    });
  }

  // 2. RULE: Ahead of Schedule Velocity
  if (input.primaryGoal.monthsAheadOrBehind >= 1) {
    insights.push({
      id: "ins-ahead-velocity",
      title: `Your current savings rate puts you ${input.primaryGoal.monthsAheadOrBehind} month${input.primaryGoal.monthsAheadOrBehind > 1 ? "s" : ""} ahead of schedule.`,
      explanation: `At your steady pace of ${formatCurrency(input.primaryGoal.monthlyContribution, currency)}/month, you will complete "${input.primaryGoal.title}" in ${formatMonthYear(input.primaryGoal.projectedArrivalDate)}, comfortably ahead of your ${formatMonthYear(input.primaryGoal.targetDate)} deadline.`,
      severity: "INFO",
      category: "VELOCITY",
      relatedGoalTitle: input.primaryGoal.title,
      relatedGoalId: input.primaryGoal.id,
      suggestedAction: {
        label: "View Destination Trajectory",
        href: `/app/goals/${input.primaryGoal.id}`,
      },
      detectedAt: new Date().toISOString(),
    });
  }

  // 3. RULE: Upcoming Commitments Spike
  if (input.upcomingCommitmentDueInDays && input.upcomingCommitmentDueInDays.dueInDays <= 60) {
    const comm = input.upcomingCommitmentDueInDays;
    insights.push({
      id: "ins-upcoming-commitment",
      title: "Your upcoming commitments are unusually high this month.",
      explanation: `"${comm.title}" (${formatCurrency(comm.amount, currency)}) is scheduled in ${comm.dueInDays} days. Ensure this allowance remains isolated in your sinking fund to prevent dipping into your primary destination savings.`,
      severity: "NOTICE",
      category: "COMMITMENT",
      suggestedAction: {
        label: "Review Commitments in Money",
        href: "/app/money",
      },
      detectedAt: new Date().toISOString(),
    });
  }

  // 4. RULE: High Debt-to-Income / Debt Load Check
  const debtRatio = input.monthlyGrossIncome > 0 ? input.monthlyDebtService / input.monthlyGrossIncome : 0;
  if (debtRatio >= 0.3) {
    const debtPercent = Math.round(debtRatio * 100);
    insights.push({
      id: "ins-debt-burden",
      title: `Your debt payments consume ${debtPercent}% of monthly income.`,
      explanation: `Allocating ${formatCurrency(input.monthlyDebtService, currency)} of ${formatCurrency(input.monthlyGrossIncome, currency)} to loan service reduces your available capital for long-term destinations. Accelerating payoff would unlock significant monthly cash flow.`,
      severity: "CRITICAL",
      category: "DEBT",
      suggestedAction: {
        label: "Simulate Debt Acceleration",
        href: "/app/what-if",
      },
      detectedAt: new Date().toISOString(),
    });
  }

  // 5. RULE: Multi-Destination Capacity Conflict
  if (input.totalGoalsAllocated > input.monthlyFreeCashFlow) {
    const overAllocated = input.totalGoalsAllocated - input.monthlyFreeCashFlow;
    insights.push({
      id: "ins-goal-conflict",
      title: "One of your destinations is competing with another for the same savings capacity.",
      explanation: `You have allocated ${formatCurrency(input.totalGoalsAllocated, currency)} across ${input.activeGoalsCount} destinations, exceeding your available free cash flow of ${formatCurrency(input.monthlyFreeCashFlow, currency)} by ${formatCurrency(overAllocated, currency)}/mo. Lower-priority destinations will experience delayed arrival dates.`,
      severity: "WARNING",
      category: "CONFLICT",
      suggestedAction: {
        label: "Rebalance Destinations Capacity",
        href: "/app/goals",
      },
      detectedAt: new Date().toISOString(),
    });
  }

  // 6. RULE: Cumulative Decision Drag
  if (input.recentDecisionsDelayWeeks >= 3) {
    insights.push({
      id: "ins-cumulative-drag",
      title: `Your last three decisions collectively delayed your primary destination by ${input.recentDecisionsDelayWeeks} weeks.`,
      explanation: `Discretionary purchases and lifestyle expenditures over the past 60 days have pushed your "${input.primaryGoal.title}" milestone back. Evaluating future decisions with Useaimly before purchasing will safeguard your timeline.`,
      severity: "NOTICE",
      category: "CUMULATIVE_DRAG",
      relatedGoalTitle: input.primaryGoal.title,
      suggestedAction: {
        label: "Evaluate Next Spending in Decide",
        href: "/app/decide",
      },
      detectedAt: new Date().toISOString(),
    });
  }

  // Sort by severity: CRITICAL -> WARNING -> NOTICE -> INFO
  const severityRank: Record<InsightSeverity, number> = {
    CRITICAL: 4,
    WARNING: 3,
    NOTICE: 2,
    INFO: 1,
  };

  return insights.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}

export const INITIAL_PROACTIVE_INSIGHTS: ProactiveInsightItem[] = [
  {
    id: "ins-1",
    title: "Your current savings rate puts you 2 months ahead of schedule.",
    explanation:
      "At your steady pace of KES 45,000/month, you will complete 'Start my business' in November 2027, comfortably ahead of your planned December 2027 deadline.",
    severity: "INFO",
    category: "VELOCITY",
    relatedGoalTitle: "Start my business",
    suggestedAction: {
      label: "View Destination Hub",
      href: "/app/goals/dest-1",
    },
    detectedAt: "2026-08-20T00:00:00Z",
  },
  {
    id: "ins-2",
    title: "Your upcoming commitments are unusually high this month.",
    explanation:
      "Comprehensive Motor Insurance (KES 45,000) is due in 45 days. Ensure this allowance remains in your sinking fund to prevent dipping into your primary goal capital.",
    severity: "NOTICE",
    category: "COMMITMENT",
    suggestedAction: {
      label: "Review Commitments in Money",
      href: "/app/money",
    },
    detectedAt: "2026-08-19T14:30:00Z",
  },
  {
    id: "ins-3",
    title: "You need KES 4,500 more per month to stay on your target date.",
    explanation:
      "For your 'Vehicle Upgrade' destination, increasing your monthly allocation from KES 8,000/mo to KES 12,500/mo restores your original June 2028 target horizon.",
    severity: "WARNING",
    category: "PACE",
    relatedGoalTitle: "Vehicle Upgrade",
    suggestedAction: {
      label: "Simulate in What If?",
      href: "/app/what-if",
    },
    detectedAt: "2026-08-18T09:00:00Z",
  },
  {
    id: "ins-4",
    title: "Your last three decisions collectively delayed your primary destination by 7 weeks.",
    explanation:
      "Discretionary workstation and leisure spending over the past 45 days shifted your arrival date. Before committing to upcoming expenses above KES 15,000, test them in Decide first.",
    severity: "NOTICE",
    category: "CUMULATIVE_DRAG",
    relatedGoalTitle: "Start my business",
    suggestedAction: {
      label: "Evaluate in Decide",
      href: "/app/decide",
    },
    detectedAt: "2026-08-17T11:20:00Z",
  },
];
