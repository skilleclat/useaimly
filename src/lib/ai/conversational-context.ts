import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { simulateDecision as runDeterministicSimulation, BaselineFinancialProfile } from "@/lib/finance";
import { INITIAL_DESTINATIONS } from "@/lib/destinations/destinations-data";
import { CurrencyCode } from "@/lib/types/finance";

export interface ConversationalContextSummary {
  profile: {
    currency: CurrencyCode;
    monthlyGrossIncome: number;
    monthlyLivingExpenses: number;
    monthlyDebtService: number;
    monthlyCommitmentsAmortized: number;
    monthlyFreeCashFlow: number;
    totalLiquidSavings: number;
    liquidRunwayMonths: number;
    savingsRatePercentage: number;
  };
  primaryDestination: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    projectedArrivalDate: string;
    monthlyContribution: number;
    status: string;
    progressPercentage: number;
  };
  otherActiveDestinations: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    status: string;
  }[];
  debtSummary: {
    totalBalance: number;
    monthlyPayment: number;
    activeFacilitiesCount: number;
  };
  upcomingCommitments: {
    title: string;
    amount: number;
    timing: string;
  }[];
  recentDecisions: {
    title: string;
    amount: number;
    impact: string;
    result: string;
  }[];
  goalCapacity: {
    totalAllocated: number;
    availableCapacity: number;
    hasConflict: boolean;
    shortfall: number;
  };
}

export function getFinancialSummary(currency: CurrencyCode = "KES") {
  return {
    currency,
    monthlyGrossIncome: 180000,
    monthlyLivingExpenses: 97000,
    monthlyDebtService: 10000,
    monthlyCommitmentsAmortized: 3750,
    monthlyFreeCashFlow: 69250,
    totalLiquidSavings: 240000,
    liquidRunwayMonths: 2.2,
    savingsRatePercentage: 38,
  };
}

export function getDestinationStatus() {
  const primary = INITIAL_DESTINATIONS[0];
  const others = INITIAL_DESTINATIONS.slice(1);

  return {
    primary: {
      title: primary.name,
      targetAmount: primary.targetAmount,
      currentAmount: primary.currentAmount,
      targetDate: primary.targetDate,
      projectedArrivalDate: primary.projectedCompletionDate,
      monthlyContribution: primary.monthlyContribution,
      status: primary.status,
      progressPercentage: Math.round((primary.currentAmount / primary.targetAmount) * 100),
    },
    others: others.map((o) => ({
      title: o.name,
      targetAmount: o.targetAmount,
      currentAmount: o.currentAmount,
      monthlyContribution: o.monthlyContribution,
      status: o.status,
    })),
  };
}

export function getDebtSummary() {
  return {
    totalBalance: 120000,
    monthlyPayment: 10000,
    activeFacilitiesCount: 1,
  };
}

export function getUpcomingCommitments() {
  return [
    { title: "Comprehensive Motor Insurance", amount: 45000, timing: "Due in 45 days (Oct 5)" },
  ];
}

export function getRecentDecisions() {
  return [
    { title: "Ergonomic Studio Workstation", amount: 35000, impact: "+12 days arrival shift", result: "SAFE" },
    { title: "Annual Cloud Workspace License", amount: 18000, impact: "0 days arrival shift", result: "SAFE" },
    { title: "Weekend Safari Retreat", amount: 45000, impact: "+28 days arrival shift", result: "MANAGEABLE" },
  ];
}

export function getGoalConflicts() {
  const totalAllocated = INITIAL_DESTINATIONS.reduce((sum, d) => sum + d.monthlyContribution, 0);
  const availableCapacity = 68000;
  return {
    totalAllocated,
    availableCapacity,
    hasConflict: totalAllocated > availableCapacity,
    shortfall: Math.max(0, totalAllocated - availableCapacity),
  };
}

export function simulateDecision(
  amount: number,
  title: string = "Proposed Spending",
  isRecurring: boolean = false
) {
  const baseline: BaselineFinancialProfile = {
    liquidSavings: 240000,
    incomes: [{ name: "Salary & Retainer", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true }],
    expenses: [{ name: "Living Outflows", amount: 110750, frequency: "MONTHLY", isFixed: true }],
    debts: [],
    commitments: [],
    goals: [
      {
        id: "primary-dest",
        title: "Start my business",
        targetAmount: 500000,
        currentAmount: 180000,
        targetDate: "2027-12-31",
        priority: "HIGH",
      },
    ],
  };

  return runDeterministicSimulation(baseline, {
    decisionTitle: title,
    amount,
    isRecurring,
    recurringFrequency: isRecurring ? "MONTHLY" : undefined,
  });
}

/**
 * Builds clean, structured conversational context for the AI layer.
 * Strictly prevents dumping raw database tables.
 */
export function buildConversationalContext(
  currency: CurrencyCode = "KES",
  overrideProfile?: Partial<ConversationalContextSummary["profile"]>,
  overridePrimaryDest?: Partial<ConversationalContextSummary["primaryDestination"]>
): ConversationalContextSummary {
  const finSummary = {
    ...getFinancialSummary(currency),
    ...overrideProfile,
  };
  const destStatus = getDestinationStatus();
  if (overridePrimaryDest) {
    destStatus.primary = {
      ...destStatus.primary,
      ...overridePrimaryDest,
    };
  }
  const debts = getDebtSummary();
  const commitments = getUpcomingCommitments();
  const recentDecisions = getRecentDecisions();
  const conflicts = getGoalConflicts();

  return {
    profile: finSummary,
    primaryDestination: destStatus.primary,
    otherActiveDestinations: destStatus.others,
    debtSummary: debts,
    upcomingCommitments: commitments,
    recentDecisions,
    goalCapacity: conflicts,
  };
}

/**
 * Formats the conversational context into a crisp, high-density system prompt text block
 * for LLM providers (Gemini / OpenAI).
 */
export function formatContextForPrompt(context: ConversationalContextSummary): string {
  const p = context.profile;
  const dest = context.primaryDestination;
  const d = context.debtSummary;

  return `
USER ACCOUNT FINANCIAL REALITY:
- Currency: ${p.currency}
- Gross Monthly Inflow: ${formatCurrency(p.monthlyGrossIncome, p.currency)}
- Fixed Living Outflows: ${formatCurrency(p.monthlyLivingExpenses, p.currency)}
- Monthly Debt Service: ${formatCurrency(p.monthlyDebtService, p.currency)} (DTI: ${Math.round((p.monthlyDebtService / p.monthlyGrossIncome) * 100)}%)
- Amortized Annual Commitments: ${formatCurrency(p.monthlyCommitmentsAmortized, p.currency)}
- Net Free Cash Flow (FCF): ${formatCurrency(p.monthlyFreeCashFlow, p.currency)}/month
- Total Liquid Savings: ${formatCurrency(p.totalLiquidSavings, p.currency)}
- Living Buffer Runway: ${p.liquidRunwayMonths} Months of essential expenses
- Savings Rate: ${p.savingsRatePercentage}%

PRIMARY DESTINATION:
- Name: "${dest.title}"
- Target Cap: ${formatCurrency(dest.targetAmount, p.currency)}
- Currently Accumulated: ${formatCurrency(dest.currentAmount, p.currency)} (${dest.progressPercentage}% complete)
- Target Date: ${formatMonthYear(dest.targetDate)}
- Projected Arrival Date: ${formatMonthYear(dest.projectedArrivalDate)} (Status: ${dest.status})
- Monthly Allocation: ${formatCurrency(dest.monthlyContribution, p.currency)}/month

OTHER DESTINATIONS:
${context.otherActiveDestinations.map(o => `- "${o.title}": ${formatCurrency(o.currentAmount, p.currency)} / ${formatCurrency(o.targetAmount, p.currency)} (${formatCurrency(o.monthlyContribution, p.currency)}/mo, ${o.status})`).join('\n')}

ACTIVE DEBT FACILITIES:
- Total Outstanding Balance: ${formatCurrency(d.totalBalance, p.currency)} across ${d.activeFacilitiesCount} facility
- Monthly Installment: ${formatCurrency(d.monthlyPayment, p.currency)}

UPCOMING COMMITMENTS:
${context.upcomingCommitments.map(c => `- ${c.title}: ${formatCurrency(c.amount, p.currency)} (${c.timing})`).join('\n')}

RECENT SIMULATED DECISIONS:
${context.recentDecisions.map(r => `- "${r.title}" (${formatCurrency(r.amount, p.currency)}): ${r.impact} [Verdict: ${r.result}]`).join('\n')}
`.trim();
}

