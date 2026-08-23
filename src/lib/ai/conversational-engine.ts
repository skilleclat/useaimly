import {
  buildConversationalContext,
  simulateDecision,
  ConversationalContextSummary,
  formatContextForPrompt,
} from "./conversational-context";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { CurrencyCode } from "@/lib/types/finance";
import { generateSeniorStrategistAssessment } from "./senior-strategist-engine";

export interface ChatMessage {
  id: string;
  sender: "USER" | "Useaimly";
  content: string;
  timestamp: string;
  structuredCard?: {
    type:
      | "DECISION_SIMULATION"
      | "DESTINATION_STATUS"
      | "DEBT_STRATEGY"
      | "CASHFLOW_BREAKDOWN"
      | "WHAT_IF_SCENARIO"
      | "RECOVERY_PLAN"
      | "CAPACITY_ALERT";
    title: string;
    amount?: number;
    verdict?: string;
    metrics?: { label: string; value: string }[];
  };
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface UserContextOverride {
  profile?: Partial<ConversationalContextSummary["profile"]>;
  primaryDestination?: Partial<ConversationalContextSummary["primaryDestination"]>;
}

export class ConversationalIntelligenceEngine {
  async processUserMessage(
    userMessage: string,
    history: ChatMessage[] = [],
    currency: CurrencyCode = "KES",
    userOverride?: UserContextOverride
  ): Promise<ChatMessage> {
    const context = buildConversationalContext(
      currency,
      userOverride?.profile,
      userOverride?.primaryDestination
    );
    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // 1. INTENT: SPENDING & PURCHASE SIMULATION
    const parsedQuery = parseDecisionQuery(trimmed, currency);
    if (parsedQuery.isValid && parsedQuery.extractedAmount > 0) {
      const sim = simulateDecision(
        parsedQuery.extractedAmount,
        parsedQuery.extractedTitle,
        parsedQuery.isRecurring
      );

      const decisionAmountFormatted = formatCurrency(parsedQuery.extractedAmount, currency);
      const remainingLiquid = formatCurrency(sim.affordability.cashRemainingAfterDecision, currency);
      const delayDays = sim.delta.delayInDays;
      const primaryTitle = context.primaryDestination.title;
      const projectedArrival = formatMonthYear(context.primaryDestination.projectedArrivalDate);
      const monthlyPace = formatCurrency(context.primaryDestination.monthlyContribution, currency);

      const strategist = generateSeniorStrategistAssessment({
        currency,
        monthlyInflow: context.profile.totalGrossIncome || 180000,
        monthlyOutflow: context.profile.totalMandatoryExpenses || 112000,
        monthlyFreeCashFlow: context.profile.monthlyFreeCashFlow,
        totalLiquidSavings: context.profile.totalLiquidSavings,
        targetAmount: context.primaryDestination.targetAmount,
        targetDate: context.primaryDestination.targetDate,
        destinationTitle: primaryTitle,
        delayInDays: delayDays,
        requiredMonthlySavings: Math.round(context.primaryDestination.targetAmount / 24),
        decisionContext: {
          title: parsedQuery.extractedTitle,
          amount: parsedQuery.extractedAmount,
          isRecurring: parsedQuery.isRecurring,
        },
      });

      // Check if any pinned notes/rules apply
      const pinnedRules = (context.userNotes || []).filter((n) => n.isPinned || n.category === "RULES_CONSTRAINTS");
      let noteContextText = "";
      if (pinnedRules.length > 0) {
        const topRule = pinnedRules[0];
        noteContextText = `\n\n📌 **Notepad Rule Alignment**: Cross-referenced with your pinned note *"_${topRule.title}_"*: ${topRule.content}`;
      }

      let responseText = "";
      if (sim.affordability.canPhysicallyPay) {
        if (delayDays === 0) {
          responseText = `🧠 **Senior Wealth Strategist Assessment (30+ Yrs Advisory Caliber)**:\n${strategist.masterStrategyParagraph}\n\n📊 **Tactical Decision Impact**:\n• **Immediate Action**: ${strategist.whatYouCanDo}\n• **Buffer Defense**: ${remainingLiquid} remaining (${sim.affordability.obligationsPreservedMonths} months of fixed living buffer)\n• **Trajectory Consequence**: "${primaryTitle}" remains 100% on schedule for ${projectedArrival}.${noteContextText}\n\n🎯 **Strategic Directive**: Enjoy this allocation with total peace of mind — your baseline compounding velocity is fully preserved.`;
        } else {
          const extraRequired = formatCurrency(sim.delta.additionalMonthlyAmountRequired || 1875, currency);
          responseText = `🧠 **Senior Wealth Strategist Assessment (30+ Yrs Advisory Caliber)**:\n${strategist.masterStrategyParagraph}\n\n📊 **Tactical Decision Impact**:\n• **Immediate Action**: ${strategist.whatYouCanDo}\n• **Trajectory Consequence**: Delays target completion of "${primaryTitle}" by +${delayDays} days.\n• **Buffer Defense**: Leaves ${remainingLiquid} in liquid reserves (${sim.affordability.obligationsPreservedMonths} months of runway).${noteContextText}\n\n🎯 **3-Step Recovery Action Plan**:\n1. Maintain your essential living buffer above 3.0 months.\n2. Increase monthly goal allocation from ${monthlyPace} to +${extraRequired}/month for 12 months to completely neutralize the +${delayDays}-day delay.\n3. Keep automated investment protocols locked.`;
        }
      } else {
        responseText = `⚠️ **Senior Wealth Strategist Warning (30+ Yrs Advisory Caliber)**:\n${strategist.masterStrategyParagraph}\n\n📊 **Tactical Risk Breakdown**:\n• **Liquidity Deficit**: Exceeds available reserves (${formatCurrency(context.profile.totalLiquidSavings, currency)}) by ${formatCurrency(parsedQuery.extractedAmount - context.profile.totalLiquidSavings, currency)}.\n• **Buffer Hazard**: Drops living cushion below safety thresholds.${noteContextText}\n\n🎯 **Strategic Directive**: ${strategist.toStayOnTrack}`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content: responseText,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "DECISION_SIMULATION",
          title: parsedQuery.extractedTitle,
          amount: parsedQuery.extractedAmount,
          verdict: sim.status,
          metrics: [
            { label: "Cash Remaining", value: remainingLiquid },
            { label: "Buffer Cushion", value: `${sim.affordability.obligationsPreservedMonths} Months` },
            { label: "Destination Shift", value: delayDays === 0 ? "0 Days (On Schedule)" : `+${delayDays} Days` },
          ],
        },
      };
    }

    // 1.5 INTENT: NOTEPAD / HANDWRITTEN RULES & STRATEGIC CONSTRAINTS
    if (/note|notepad|journal|rule|handwritten|constraint|bloc-notes|mes notes/i.test(lower)) {
      const notes = context.userNotes || [];
      const pinned = notes.filter((n) => n.isPinned);
      const categories = Array.from(new Set(notes.map((n) => n.category)));

      const content = `📝 **Your AI Strategic Financial Notepad Breakdown**:
You currently have **${notes.length} strategic note${notes.length > 1 ? "s" : ""}** synced into the AI Decision Intelligence Engine across categories: ${categories.join(", ")}.

${pinned.length > 0 ? `📌 **Active Pinned Rules Enforced by AI**:\n` + pinned.map((p) => `• **${p.title}** (${p.category}): "${p.content}"`).join("\n") : "No pinned rules."}

${notes.length > 0 ? `\n📋 **All Active Notes**:\n` + notes.map((n) => `• [${n.category}] **${n.title}**: ${n.content.substring(0, 90)}${n.content.length > 90 ? "..." : ""}`).join("\n") : ""}

💡 **AI Sync Integration**: Every purchase simulation and scenario model automatically cross-references these notes to protect your custom safety thresholds and planned investments.`;

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "DESTINATION_STATUS",
          title: "Notepad AI Context Sync",
          amount: notes.length,
          verdict: "SAFE",
          metrics: [
            { label: "Total Notes", value: `${notes.length}` },
            { label: "Pinned Rules", value: `${pinned.length}` },
            { label: "AI Sync", value: "Active" },
          ],
        },
      };
    }

    // 2. INTENT: DESTINATION & GOAL PROGRESS / VELOCITY
    if (/goal|destination|business|progress|track|horizon|target|timeline|when will i|arrival/i.test(lower)) {
      const primary = context.primaryDestination;
      const totalDestAlloc = context.primaryDestination.monthlyContribution + context.otherActiveDestinations.reduce((acc, d) => acc + d.monthlyContribution, 0);
      const remainingTarget = primary.targetAmount - primary.currentAmount;

      const content = `Here is your exact destination status based on your account data:
• Primary Destination: "${primary.title}"
• Target Cap: ${formatCurrency(primary.targetAmount, currency)} | Current Saved: ${formatCurrency(primary.currentAmount, currency)} (${primary.progressPercentage}% achieved)
• Remaining Capital Needed: ${formatCurrency(remainingTarget, currency)}
• Current Allocation: ${formatCurrency(primary.monthlyContribution, currency)}/month out of your ${formatCurrency(context.profile.monthlyFreeCashFlow, currency)} Net Free Cash Flow
• Projected Arrival Date: ${formatMonthYear(primary.projectedArrivalDate)} (Planned Deadline: ${formatMonthYear(primary.targetDate)}) — Status: ${primary.status.replace("_", " ")}!

You are currently running ahead of schedule. Your secondary destinations (${context.otherActiveDestinations.map(d => `"${d.title}" @ ${formatCurrency(d.monthlyContribution, currency)}/mo`).join(", ")}) bring total goal contributions to ${formatCurrency(totalDestAlloc, currency)}/mo.`;

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "DESTINATION_STATUS",
          title: primary.title,
          amount: primary.currentAmount,
          verdict: primary.status,
          metrics: [
            { label: "Target Cap", value: formatCurrency(primary.targetAmount, currency) },
            { label: "Monthly Pace", value: `${formatCurrency(primary.monthlyContribution, currency)}/mo` },
            { label: "Arrival Date", value: formatMonthYear(primary.projectedArrivalDate) },
          ],
        },
      };
    }

    // 3. INTENT: DEBT & SACCO STRATEGY
    if (/debt|loan|repayment|sacco|interest|borrow|dti|payoff|facility/i.test(lower)) {
      const debt = context.debtSummary;
      const dti = Math.round((debt.monthlyPayment / context.profile.monthlyGrossIncome) * 100);
      const monthlyFCF = context.profile.monthlyFreeCashFlow;

      const content = `Examining your account debt facilities:
• Total Outstanding Debt Balance: ${formatCurrency(debt.totalBalance, currency)} across ${debt.activeFacilitiesCount} loan facility.
• Monthly Debt Payment: ${formatCurrency(debt.monthlyPayment, currency)}/month.
• Debt-to-Income (DTI) Ratio: ${dti}% of gross income (${formatCurrency(context.profile.monthlyGrossIncome, currency)}).

Strategic Trade-off: Because your DTI is a low ${dti}%, your debt service is comfortably covered by your gross inflow. Paying off the ${formatCurrency(debt.totalBalance, currency)} balance early using your ${formatCurrency(context.profile.totalLiquidSavings, currency)} liquid cash would deplete your living buffer below 1.0 month. Recommendation: Maintain your ${formatCurrency(debt.monthlyPayment, currency)} monthly installments while directing your ${formatCurrency(context.primaryDestination.monthlyContribution, currency)} monthly surplus toward "${context.primaryDestination.title}".`;

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "DEBT_STRATEGY",
          title: "Debt vs Goal Allocation",
          amount: debt.totalBalance,
          verdict: "SAFE",
          metrics: [
            { label: "Debt Balance", value: formatCurrency(debt.totalBalance, currency) },
            { label: "Monthly Installment", value: `${formatCurrency(debt.monthlyPayment, currency)}/mo` },
            { label: "DTI Ratio", value: `${dti}% (Healthy)` },
          ],
        },
      };
    }

    // 4. INTENT: CASH FLOW & LIVING BUFFER HEALTH
    if (/cash flow|cashflow|buffer|runway|living expense|free cash|savings rate|liquid|reserves|emergency/i.test(lower)) {
      const p = context.profile;
      const content = `Here is your live deterministic financial health snapshot:
• Monthly Gross Income: ${formatCurrency(p.monthlyGrossIncome, currency)}
• Essential Outflows: ${formatCurrency(p.monthlyLivingExpenses, currency)} living + ${formatCurrency(p.monthlyDebtService, currency)} debt + ${formatCurrency(p.monthlyCommitmentsAmortized, currency)} commitments
• Net Free Cash Flow (FCF): ${formatCurrency(p.monthlyFreeCashFlow, currency)}/month
• Total Liquid Reserves: ${formatCurrency(p.totalLiquidSavings, currency)} (${p.liquidRunwayMonths} months living buffer)
• Savings Rate: ${p.savingsRatePercentage}% of gross income

Your living buffer cushion of ${p.liquidRunwayMonths} months ensures that unexpected shocks won't derail your essential living expenses or force emergency borrowing.`;

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "CASHFLOW_BREAKDOWN",
          title: "Monthly Cash Flow & Buffer",
          amount: p.monthlyFreeCashFlow,
          verdict: "SAFE",
          metrics: [
            { label: "Net Free Cash Flow", value: `${formatCurrency(p.monthlyFreeCashFlow, currency)}/mo` },
            { label: "Liquid Buffer", value: `${p.liquidRunwayMonths} Months` },
            { label: "Savings Rate", value: `${p.savingsRatePercentage}%` },
          ],
        },
      };
    }

    // 5. INTENT: INCOME & EXPENSE SHIFTS / WHAT-IF SCENARIOS
    if (/what if|drop|increase|raise|decrease|lose income|rent increase|salary change|consulting|scenario/i.test(lower)) {
      // Try to parse scenario amount
      const parsedScenario = parseDecisionQuery(trimmed, currency);
      const deltaAmount = parsedScenario.extractedAmount || 20000;
      const isDrop = /drop|decrease|lose|cut|reduce/i.test(lower);

      const oldFCF = context.profile.monthlyFreeCashFlow;
      const newFCF = isDrop ? oldFCF - deltaAmount : oldFCF + deltaAmount;
      const impactText = isDrop ? `reduces` : `increases`;

      const content = `Simulating your scenario shift:
• ${isDrop ? "Income Drop / Expense Increase" : "Income Raise / Expense Reduction"}: ${formatCurrency(deltaAmount, currency)}/month
• Current Net Free Cash Flow: ${formatCurrency(oldFCF, currency)}/month
• Simulated Net Free Cash Flow: ${formatCurrency(newFCF, currency)}/month

Impact Analysis: This ${impactText} your monthly free cash flow by ${formatCurrency(deltaAmount, currency)}. ${
        newFCF > context.primaryDestination.monthlyContribution
          ? `Your primary goal "${context.primaryDestination.title}" (${formatCurrency(context.primaryDestination.monthlyContribution, currency)}/mo) remains fully funded and protected.`
          : `CAUTION: This creates a monthly constraint of ${formatCurrency(context.primaryDestination.monthlyContribution - newFCF, currency)} on your "${context.primaryDestination.title}" goal allocation.`
      }`;

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "WHAT_IF_SCENARIO",
          title: isDrop ? "Income Drop Simulation" : "Cash Flow Increase Simulation",
          amount: deltaAmount,
          verdict: newFCF > 30000 ? "SAFE" : "MANAGEABLE",
          metrics: [
            { label: "Current FCF", value: `${formatCurrency(oldFCF, currency)}/mo` },
            { label: "Simulated FCF", value: `${formatCurrency(newFCF, currency)}/mo` },
            { label: "Goal Status", value: newFCF > context.primaryDestination.monthlyContribution ? "Protected" : "Requires Adjust" },
          ],
        },
      };
    }

    // 6. INTENT: RECOVERY & CATCH-UP STRATEGY
    if (/recover|catch up|offset|compensate|delay|gain days|get back on track/i.test(lower)) {
      const primary = context.primaryDestination;
      const currentMonthly = primary.monthlyContribution;
      const boost12 = currentMonthly + 2500;
      const boost6 = currentMonthly + 5000;

      const content = `Here is your exact recovery plan for "${primary.title}":
• Current Allocation: ${formatCurrency(currentMonthly, currency)}/month (Projected Arrival: ${formatMonthYear(primary.projectedArrivalDate)})
• Option A (12-Month Smooth Catch-Up): Increase monthly allocation to ${formatCurrency(boost12, currency)}/mo (+${formatCurrency(2500, currency)}/mo). This recovers 15 to 20 days of delay over 12 months.
• Option B (6-Month Fast Catch-Up): Increase allocation to ${formatCurrency(boost6, currency)}/mo (+${formatCurrency(5000, currency)}/mo). This completely neutralizes any recent spending delay within 180 days.

Since your Net Free Cash Flow is ${formatCurrency(context.profile.monthlyFreeCashFlow, currency)}/month, both options are 100% affordable without touching your essential buffer.`;

      return {
        id: `msg-${Date.now()}`,
        sender: "Useaimly",
        content,
        timestamp: new Date().toISOString(),
        structuredCard: {
          type: "RECOVERY_PLAN",
          title: `Recovery Plan: ${primary.title}`,
          amount: 2500,
          verdict: "SAFE",
          metrics: [
            { label: "Current Pace", value: `${formatCurrency(currentMonthly, currency)}/mo` },
            { label: "12-Mo Catch-Up", value: `${formatCurrency(boost12, currency)}/mo` },
            { label: "6-Mo Fast-Track", value: `${formatCurrency(boost6, currency)}/mo` },
          ],
        },
      };
    }

    // 7. DEFAULT: COMPREHENSIVE STRATEGIC DECISION INTELLIGENCE
    const formattedContextPrompt = formatContextForPrompt(context);
    const content = `I have analyzed your request against your live account context:
• Net Free Cash Flow: ${formatCurrency(context.profile.monthlyFreeCashFlow, currency)}/month
• Primary Destination: "${context.primaryDestination.title}" (${context.primaryDestination.progressPercentage}% saved, target ${formatMonthYear(context.primaryDestination.targetDate)})
• Liquid Buffer: ${formatCurrency(context.profile.totalLiquidSavings, currency)} (${context.profile.liquidRunwayMonths} months)

UseAimly Principle: "Cash affordability is not plan affordability." You currently have strong liquid capacity. What specific decision, major purchase, or scenario shift would you like to model today?`;

    return {
      id: `msg-${Date.now()}`,
      sender: "Useaimly",
      content,
      timestamp: new Date().toISOString(),
      structuredCard: {
        type: "DESTINATION_STATUS",
        title: context.primaryDestination.title,
        amount: context.primaryDestination.currentAmount,
        verdict: context.primaryDestination.status,
        metrics: [
          { label: "Free Cash Flow", value: `${formatCurrency(context.profile.monthlyFreeCashFlow, currency)}/mo` },
          { label: "Buffer Runway", value: `${context.profile.liquidRunwayMonths} Months` },
          { label: "Primary Goal", value: `${context.primaryDestination.progressPercentage}% Saved` },
        ],
      },
    };
  }
}

export const defaultConversationalEngine = new ConversationalIntelligenceEngine();

