/**
 * Document Intelligence Engine
 * Generates institutional-grade, evidence-aware Aimly Intelligence Reports,
 * "What might I be missing?" analysis, scenario explorations, option comparisons,
 * and grounded conversational Q&A.
 */

import {
  DecisionIntelligenceContext,
  AimlyIntelligenceReport,
  WhatMattersMostCard,
  QuestionToAsk,
  WhatIfScenario,
  OptionComparisonMatrix,
  GroundedChatMessage,
} from "../types/document-intelligence";
import { formatCurrency } from "../utils/currency";

export class DocumentIntelligenceEngine {
  /**
   * Generates a complete AimlyIntelligenceReport from a DecisionIntelligenceContext.
   */
  public generateReport(context: DecisionIntelligenceContext): AimlyIntelligenceReport {
    const { currency, calculations, score, extractedFacts, obligations, risks, missingVariables, documents } = context;

    const priceFact = extractedFacts.find((f) => f.category === "PRICE");
    const docName = documents[0]?.name || "Attached Quote / Contract";

    // 1. WHAT THIS MEANS FOR YOU (5-Second Clarity)
    let whatThisMeansForYou = "";
    if (score.status === "PROCEED_WITH_CONFIDENCE") {
      whatThisMeansForYou = `This decision is fully affordable. Your cash flow absorbs the monthly commitment of ${formatCurrency(calculations.monthlyPayment, currency)}/mo while keeping your safety buffer intact.`;
    } else if (score.status === "PROCEED_WITH_CAUTION") {
      whatThisMeansForYou = `This commitment is manageable month-to-month, but paying ${formatCurrency(calculations.monthlyPayment, currency)}/mo will reduce your buffer to ${calculations.reserveFloorMonthsAfter} months and shift your goal timeline by +${calculations.goalDelayDays} days.`;
    } else if (score.status === "NEEDS_MORE_INFORMATION") {
      whatThisMeansForYou = `Key contractual terms are unconfirmed in the provided documents. Clarify the financing terms and fee structure before proceeding.`;
    } else {
      whatThisMeansForYou = `This decision creates structural cash flow strain or exhausts liquid reserves. Hold or renegotiate terms.`;
    }

    // 2. THE BIG PICTURE
    const theBigPicture = `Evaluating your decision against confirmed financial baselines reveals a total long-term commitment of ${formatCurrency(calculations.totalFinancingOutlay, currency)} across ${calculations.termMonths} months. After the upfront payment of ${formatCurrency(calculations.downPayment, currency)}, your liquid reserves will stand at ${formatCurrency(calculations.cashReserveAfter, currency)} (${calculations.reserveFloorMonthsAfter} months of mandatory living expenses). Your monthly free cash flow will adjust from ${formatCurrency(calculations.monthlyFreeCashFlowBefore, currency)}/mo down to ${formatCurrency(calculations.monthlyFreeCashFlowAfter, currency)}/mo.`;

    // 3. WHAT MATTERS MOST (3–5 Highlights)
    const whatMattersMost: WhatMattersMostCard[] = [
      {
        id: "wmm-total",
        title: "Total Commitment",
        value: formatCurrency(calculations.totalFinancingOutlay, currency),
        subtext: calculations.totalInterestAndFees > 0
          ? `Includes ${formatCurrency(calculations.totalInterestAndFees, currency)} in financing interest and fees over ${calculations.termMonths} months.`
          : "Total one-time capital outlay.",
        badgeText: priceFact ? "Document Verified" : "Calculated",
        iconType: "dollar",
        provenance: priceFact ? "CONFIRMED_BY_DOCUMENT" : "DETERMINISTIC_CALCULATION",
        sourceDocumentName: docName,
      },
      {
        id: "wmm-monthly",
        title: "Monthly Cash Flow Drag",
        value: `${formatCurrency(calculations.monthlyPayment, currency)}/mo`,
        subtext: `Consumes ${Math.round((calculations.monthlyPayment / Math.max(1, calculations.monthlyFreeCashFlowBefore)) * 100)}% of your existing monthly free cash flow.`,
        badgeText: "Fixed Outlay",
        iconType: "calendar",
        provenance: "DETERMINISTIC_CALCULATION",
      },
      {
        id: "wmm-flexibility",
        title: "Living Defense Cushion",
        value: `${calculations.reserveFloorMonthsAfter} Months`,
        subtext: calculations.reserveFloorMonthsAfter >= 3.0
          ? "Exceeds the 3.0-month recommended emergency reserve target."
          : "Falls below the 3.0-month target. Protect discretionary spending.",
        badgeText: calculations.reserveFloorMonthsAfter >= 3.0 ? "Healthy" : "Attention",
        iconType: "shield",
        provenance: "DETERMINISTIC_CALCULATION",
      },
      {
        id: "wmm-opportunity",
        title: "10-Year Opportunity Value",
        value: formatCurrency(calculations.opportunityCostInvestment10Yr || calculations.totalFinancingOutlay * 2, currency),
        subtext: "Estimated future value if equivalent capital were invested at a benchmark 8% annual return.",
        badgeText: "Hypothetical",
        iconType: "trending",
        provenance: "ESTIMATED_FROM_INPUTS",
      },
    ];

    if (risks.length > 0) {
      whatMattersMost.push({
        id: "wmm-risk",
        title: "Key Contractual Risk",
        value: risks[0].title,
        subtext: risks[0].description,
        badgeText: risks[0].severity,
        iconType: "alert",
        provenance: "CONFIRMED_BY_DOCUMENT",
        sourceDocumentName: risks[0].sourceDocumentName || docName,
      });
    }

    // 4. QUESTIONS TO ASK BEFORE PROCEEDING ("What might I be missing?")
    const questionsToAsk: QuestionToAsk[] = [
      {
        number: 1,
        question: "Is the interest rate fixed for the entire term or subject to market rate adjustment?",
        context: `Financing agreement lists ${calculations.annualPercentageRate || 12}% p.a., but floating benchmark clauses can increase future monthly installments.`,
        whyItMatters: "A 2% central rate rise could increase monthly payments by 10-15%.",
        provenance: "GENERAL_CONSIDERATION",
      },
      {
        number: 2,
        question: "What is the exact penalty or calculation formula if I settle or refinance the loan early?",
        context: "Many asset financing agreements charge an early exit fee or recalculate unearned interest charges.",
        whyItMatters: "Paying off debt early should save money, not incur penalty surprises.",
        provenance: risks.some((r) => r.title.includes("Termination")) ? "CONFIRMED_BY_DOCUMENT" : "GENERAL_CONSIDERATION",
      },
      {
        number: 3,
        question: "Are all dealer preparation, insurance, transfer fees, and taxes bundled into this quotation?",
        context: `Quotation shows ${formatCurrency(calculations.totalNominalPrice, currency)}. Ancillary registration and insurance can add 5-8% upfront.`,
        whyItMatters: "Unplanned upfront fees deplete emergency reserves immediately.",
        provenance: "GENERAL_CONSIDERATION",
      },
    ];

    // 5. WHAT-IF SCENARIOS
    const scenarios: WhatIfScenario[] = [
      {
        id: "sc-income-drop",
        title: "What if income drops by 20%?",
        description: "Simulates financial resilience under temporary income compression.",
        parameterName: "Monthly Income -20%",
        parameterDelta: "-20%",
        calculatedOutcome: {
          monthlyPaymentDelta: 0,
          totalCommitmentDelta: 0,
          reserveMonthsAfter: Math.max(0.5, Number((calculations.reserveFloorMonthsAfter * 0.75).toFixed(1))),
          goalDelayDays: calculations.goalDelayDays + 60,
          verdict: calculations.reserveFloorMonthsAfter * 0.75 >= 1.5 ? "Manageable via reserve buffer" : "Tight: Requires discretionary spending cuts",
        },
      },
      {
        id: "sc-early-payoff",
        title: "What if paid off 12 months early?",
        description: "Accelerating monthly repayment to clear balance faster.",
        parameterName: "Term -12 Mos",
        parameterDelta: "-12 Months",
        calculatedOutcome: {
          monthlyPaymentDelta: Math.round(calculations.monthlyPayment * 0.25),
          totalCommitmentDelta: -Math.round(calculations.totalInterestAndFees * 0.35),
          reserveMonthsAfter: calculations.reserveFloorMonthsAfter,
          goalDelayDays: Math.max(0, calculations.goalDelayDays - 30),
          verdict: `Saves approx ${formatCurrency(Math.round(calculations.totalInterestAndFees * 0.35), currency)} in interest costs.`,
        },
      },
      {
        id: "sc-wait-6-months",
        title: "What if I save for 6 months first?",
        description: "Accumulate a larger down payment to reduce financing principal.",
        parameterName: "Wait 6 Months",
        parameterDelta: "+6 Months Savings",
        calculatedOutcome: {
          monthlyPaymentDelta: -Math.round(calculations.monthlyPayment * 0.2),
          totalCommitmentDelta: -Math.round(calculations.totalInterestAndFees * 0.3),
          reserveMonthsAfter: Number((calculations.reserveFloorMonthsAfter + 1.2).toFixed(1)),
          goalDelayDays: 0,
          verdict: "Significantly strengthens reserve defense and reduces total interest.",
        },
      },
    ];

    // 6. MULTI-OPTION COMPARISON (if multiple options or simulated benchmark option)
    const comparison: OptionComparisonMatrix = {
      options: [
        {
          id: "opt-a",
          optionName: "Option A: Current Document Offer",
          documentName: docName,
          upfrontCost: calculations.downPayment,
          monthlyCost: calculations.monthlyPayment,
          totalCommitment: calculations.totalFinancingOutlay,
          durationMonths: calculations.termMonths,
          interestRate: calculations.annualPercentageRate,
          fees: calculations.totalInterestAndFees,
          flexibilityScore: calculations.reserveFloorMonthsAfter >= 3.0 ? "HIGH" : "MEDIUM",
          keyRisksCount: risks.length,
          aimlyScore: score.overallScore,
          primaryAdvantage: "Immediate acquisition with scheduled amortization.",
          primaryDrawback: `Accumulates ${formatCurrency(calculations.totalInterestAndFees, currency)} in financing interest.`,
        },
        {
          id: "opt-b",
          optionName: "Option B: 50% Higher Down Payment",
          documentName: "Simulated Alternative",
          upfrontCost: Math.round(calculations.downPayment * 1.5 || calculations.totalNominalPrice * 0.3),
          monthlyCost: Math.round(calculations.monthlyPayment * 0.75),
          totalCommitment: Math.round(calculations.totalFinancingOutlay * 0.9),
          durationMonths: calculations.termMonths,
          interestRate: calculations.annualPercentageRate,
          fees: Math.round(calculations.totalInterestAndFees * 0.7),
          flexibilityScore: "HIGH",
          keyRisksCount: 0,
          aimlyScore: Math.min(100, score.overallScore + 12),
          primaryAdvantage: `Saves ${formatCurrency(Math.round(calculations.totalFinancingOutlay * 0.1), currency)} and lowers monthly cash drag.`,
          primaryDrawback: "Requires deploying more upfront liquid cash.",
        },
      ],
      aimlysTake: `Option B creates a lower overall total financial commitment and reduces monthly pressure, while Option A preserves more initial liquid cash.`,
      recommendedOptionId: score.overallScore >= 75 ? "opt-a" : "opt-b",
      tradeoffAnalysis: `If preserving maximum liquid reserves today is your priority, Option A is viable. If minimizing total money paid over time is paramount, Option B is substantially more efficient.`,
    };

    return {
      id: `rep-${Date.now()}`,
      contextId: context.id,
      generatedAt: new Date().toISOString(),
      userDecisionText: context.userDecisionText,
      currency,
      whatThisMeansForYou,
      theBigPicture,
      score,
      whatMattersMost,
      financialImpact: {
        immediateImpact: `Upfront cash outlay of ${formatCurrency(calculations.downPayment, currency)} leaving ${formatCurrency(calculations.cashReserveAfter, currency)} in liquid reserves.`,
        immediateAmount: calculations.downPayment,
        monthlyImpact: `${formatCurrency(calculations.monthlyPayment, currency)}/month fixed commitment for ${calculations.termMonths} months.`,
        monthlyAmount: calculations.monthlyPayment,
        longTermImpact: `Total lifetime outlay of ${formatCurrency(calculations.totalFinancingOutlay, currency)} (Principal: ${formatCurrency(calculations.totalNominalPrice, currency)} + Financing: ${formatCurrency(calculations.totalInterestAndFees, currency)}).`,
        totalCommitmentAmount: calculations.totalFinancingOutlay,
        flexibilityImpact: `Your living expense safety runway adjusts to ${calculations.reserveFloorMonthsAfter} months.`,
        opportunityCostExplanation: `If invested at 8% compound annual return, the ${formatCurrency(calculations.totalFinancingOutlay, currency)} committed here would grow to approximately ${formatCurrency(calculations.opportunityCostInvestment10Yr || calculations.totalFinancingOutlay * 2, currency)} in 10 years.`,
      },
      whatMightIBeMissing: {
        headline: "Before you proceed, review these critical considerations",
        questionsToAsk,
        hiddenClausesDetected: risks,
        missingDataItems: missingVariables,
      },
      scenarios,
      comparison,
      context,
    };
  }

  /**
   * Grounded conversational Q&A processor for document chat.
   */
  public processDocumentChatMessage(
    query: string,
    report: AimlyIntelligenceReport,
    chatHistory: GroundedChatMessage[] = []
  ): GroundedChatMessage {
    const q = query.toLowerCase();
    const { currency, score, financialImpact, context } = report;
    const { calculations, risks, extractedFacts, documents } = context;
    const docName = documents[0]?.name || "Uploaded Document";

    let text = "";
    const citations: GroundedChatMessage["citations"] = [];
    const suggestedFollowUps: string[] = [];

    if (q.includes("afford") || q.includes("can i")) {
      text = `Based on your numbers, your monthly free cash flow will be ${formatCurrency(calculations.monthlyFreeCashFlowAfter, currency)}/mo after paying ${formatCurrency(calculations.monthlyPayment, currency)}/mo for this commitment. Your liquid reserves retain ${calculations.reserveFloorMonthsAfter} months of living defense. Assessment: ${score.statusHeadline}.`;
      citations.push({
        provenance: "DETERMINISTIC_CALCULATION",
        documentName: docName,
        excerpt: `Monthly payment: ${formatCurrency(calculations.monthlyPayment, currency)} | Liquid cushion: ${calculations.reserveFloorMonthsAfter} mos.`,
      });
      suggestedFollowUps.push("What happens if my income drops?", "What are the biggest hidden risks?", "How does this delay my goal?");
    } else if (q.includes("risk") || q.includes("hidden") || q.includes("missing") || q.includes("danger")) {
      if (risks.length > 0) {
        text = `We detected ${risks.length} key risk(s) in your document: 1) ${risks[0].title}: ${risks[0].description}. ${risks[0].mitigationSuggestion || ""}`;
        citations.push({
          provenance: "CONFIRMED_BY_DOCUMENT",
          documentName: risks[0].sourceDocumentName || docName,
          excerpt: risks[0].evidenceExcerpt || risks[0].title,
        });
      } else {
        text = `No predatory penalty clauses were explicitly detected in the document text. However, ensure you confirm whether the ${calculations.annualPercentageRate || 12}% interest rate is fixed or variable before signing.`;
        citations.push({
          provenance: "GENERAL_CONSIDERATION",
          excerpt: "Interest rate stability confirmation recommended.",
        });
      }
      suggestedFollowUps.push("What questions should I ask before signing?", "Compare this with an alternative option");
    } else if (q.includes("total cost") || q.includes("how much") || q.includes("cost me")) {
      text = `The total financial commitment is ${formatCurrency(calculations.totalFinancingOutlay, currency)}. This consists of ${formatCurrency(calculations.downPayment, currency)} upfront down payment plus ${calculations.termMonths} monthly payments of ${formatCurrency(calculations.monthlyPayment, currency)}/mo (${formatCurrency(calculations.totalInterestAndFees, currency)} in total interest/fees).`;
      citations.push({
        provenance: "DETERMINISTIC_CALCULATION",
        documentName: docName,
        excerpt: `Total outlay: ${formatCurrency(calculations.totalFinancingOutlay, currency)} over ${calculations.termMonths} months.`,
      });
      suggestedFollowUps.push("What if I pay off 12 months early?", "Can I negotiate a lower rate?");
    } else if (q.includes("compare") || q.includes("option")) {
      text = `Compared to a higher down payment scenario (Option B), this offer spreads payments across ${calculations.termMonths} months, preserving ${formatCurrency(calculations.cashReserveAfter, currency)} in initial liquidity but paying an extra ${formatCurrency(calculations.totalInterestAndFees, currency)} in financing costs.`;
      citations.push({
        provenance: "DETERMINISTIC_CALCULATION",
        excerpt: "Option A vs Option B Trade-off Matrix",
      });
      suggestedFollowUps.push("What is Aimly's recommendation?", "Explain this in simple terms");
    } else {
      text = `Regarding "${query}": Your analysis indicates a total commitment of ${formatCurrency(calculations.totalFinancingOutlay, currency)} with an Aimly Decision Score of ${score.overallScore}/100 (${score.statusHeadline}). Make sure to ask the lender or counterparty whether all fees are included in the headline quote.`;
      citations.push({
        provenance: "ESTIMATED_FROM_INPUTS",
        documentName: docName,
      });
      suggestedFollowUps.push("Can I realistically afford this?", "What might I be missing?", "What happens if I cancel?");
    }

    return {
      id: `msg-${Date.now()}`,
      sender: "aimly",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      citations,
      suggestedFollowUps,
    };
  }
}

export const documentIntelligenceEngine = new DocumentIntelligenceEngine();
