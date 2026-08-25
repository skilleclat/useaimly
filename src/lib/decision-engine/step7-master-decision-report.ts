/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * STEP 7: MASTER AIMLY DECISION REPORT GENERATOR (PROMPT 17)
 *
 * Transforms the analytical pipeline into a definitive, 12-section decision document.
 * Perfectly balances plain-language clarity with rigorous quantitative depth.
 *
 * 12 Master Sections:
 * 1. AIMLY VERDICT (Verdict, One-sentence why, Biggest risk, Key condition, Recommended next action)
 * 2. THE DECISION (Action, category, problem/goal, time horizon, reversibility)
 * 3. WHAT AIMLY KNOWS (Epistemic separation: Facts, Estimates, Assumptions, Unknowns)
 * 4. FINANCIAL IMPACT (Upfront, recurring, lifetime, runway delta, FCF delta, opportunity cost)
 * 5. WHAT HAPPENS NEXT? (Chronological timeline: Today, 30-90 Days, 1 Year, Long Term)
 * 6. SCENARIOS (5 Plausible Futures: Base, Favorable, Cautious, Adverse, Severe Stress)
 * 7. THE 3 NUMBERS THAT MATTER MOST (Sensitivity elasticity & controlling variables)
 * 8. WHAT COULD CHANGE THE ANSWER? (Exact flip thresholds for price, income, and timing)
 * 9. RED FLAGS (Categorized: CRITICAL, IMPORTANT, WATCH)
 * 10. IF THIS DECISION FAILS, WHY? (12-Month Pre-Mortem Autopsy)
 * 11. BETTER ALTERNATIVES (6 strategic paths & optimal structure verdict)
 * 12. AIMLY ACTION PLAN (Concrete pre-commitment checklist)
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";
import { runStep5MasterAnalysis, Step5AnalysisOrchestrationReport } from "./step5-analysis-orchestrator";
import { synthesizeDecisionVerdict, DecisionVerdictFramework, CanonicalDecisionVerdictCode } from "./decision-verdict-system";
import { runStep6VerificationGate, Step6VerificationReport } from "./step6-verification-engine";
import { evaluateDecisionRobustness, RobustnessAssessmentReport } from "./robustness-engine";
import { PlausibleScenarioResult } from "./multi-scenario-simulation-engine";
import { CriticalSensitivityVariable } from "./sensitivity-analysis-engine";

export interface MasterDecisionReportPayload {
  reportId: string;
  generatedAt: string;
  currency: CurrencyCode;
  locale: "en" | "fr" | "es";

  // 1. AIMLY VERDICT
  section1_verdict: {
    verdictCode: CanonicalDecisionVerdictCode;
    verdictLabel: string;
    oneSentenceExplanation: string;
    biggestRisk: {
      title: string;
      description: string;
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    };
    keyCondition: {
      title: string;
      actionableRequirement: string;
    };
    recommendedNextAction: string;
  };

  // 2. THE DECISION
  section2_theDecision: {
    actionTitle: string;
    category: string;
    timeHorizonMonths: number;
    reversibility: string;
    underlyingProblemOrGoal: string;
    financialCommitmentSummary: string;
  };

  // 3. WHAT AIMLY KNOWS (EPISTEMIC GROUNDING)
  section3_whatAimlyKnows: {
    facts: string[];
    estimates: string[];
    assumptions: string[];
    unknowns: string[];
    epistemicConfidenceScore: number;
  };

  // 4. FINANCIAL IMPACT
  section4_financialImpact: {
    upfrontImpactFormatted: string;
    recurringImpactFormatted: string;
    totalLifetimeCostFormatted: string;
    timeHorizonFormatted: string;
    opportunityCostHeadline: string;
    liquidRunwayBeforeVsAfter: string;
    freeCashFlowBeforeVsAfter: string;
  };

  // 5. WHAT HAPPENS NEXT? (CHRONOLOGICAL TIMELINE)
  section5_futureTimeline: {
    today: string;
    next30To90Days: string;
    year1: string;
    longTerm: string;
  };

  // 6. SCENARIOS (5 PLAUSIBLE FUTURES)
  section6_scenarios: {
    favorable: PlausibleScenarioResult;
    base: PlausibleScenarioResult;
    cautious: PlausibleScenarioResult;
    adverse: PlausibleScenarioResult;
    severeStress: PlausibleScenarioResult;
  };

  // 7. THE 3 NUMBERS THAT MATTER MOST
  section7_threeNumbersThatMatterMost: [
    CriticalSensitivityVariable,
    CriticalSensitivityVariable,
    CriticalSensitivityVariable
  ];

  // 8. WHAT COULD CHANGE THE ANSWER?
  section8_whatCouldChangeTheAnswer: {
    costThresholdFlip: string;
    incomeThresholdFlip: string;
    timingThresholdFlip: string;
    evidenceThresholdFlip: string;
  };

  // 9. RED FLAGS (CRITICAL / IMPORTANT / WATCH)
  section9_redFlags: {
    critical: string[];
    important: string[];
    watch: string[];
    hasCriticalRedFlags: boolean;
  };

  // 10. IF THIS DECISION FAILS, WHY? (PRE-MORTEM)
  section10_preMortemAutopsy: {
    premise: string;
    topFailureModes: {
      category: string;
      description: string;
      likelihood: string;
      impact: string;
      earlyWarning: string;
      mitigation: string;
    }[];
  };

  // 11. BETTER ALTERNATIVES
  section11_betterAlternatives: {
    isCurrentProposalOptimal: boolean;
    optimalStructureVerdict: string;
    topAlternatives: {
      code: string;
      title: string;
      summary: string;
      cost: string;
      efficiencyScore: number;
      isRecommended: boolean;
    }[];
  };

  // 12. AIMLY ACTION PLAN
  section12_actionPlan: {
    mandatoryPreCommitmentSteps: string[];
    suggestedDecisionDeadline: string;
    coolingOffPeriodRecommended: boolean;
  };

  // METADATA & 4 INDICATORS
  verification: Step6VerificationReport;
  robustness: RobustnessAssessmentReport;
}

/**
 * GENERATE COMPLETE 12-SECTION MASTER AIMLY DECISION REPORT
 */
export function generateMasterAimlyDecisionReport(
  decisionObject: DecisionIntelligenceObject
): MasterDecisionReportPayload {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const locale = decisionObject.metadata?.locale || "en";
  const fmt = (n: number) => formatCurrency(n, curr);

  // 1. Run Pipeline
  const analysisReport = runStep5MasterAnalysis(decisionObject);
  const verdict = synthesizeDecisionVerdict(decisionObject, analysisReport);
  const verification = runStep6VerificationGate(decisionObject, analysisReport, verdict);
  const robustness = evaluateDecisionRobustness(decisionObject, analysisReport);

  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const recurringUpkeep = Math.max(0, decisionObject.economics.recurring_cost.value || 0);
  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const monthlyDebt = Math.max(0, decisionObject.context.monthly_debt_payments.value || 0);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);

  const upfrontCost = isLoan ? downPayment : amount;
  const baseRunway = essentialExpenses > 0 ? liquidSavings / essentialExpenses : 6;
  const postCash = Math.max(0, liquidSavings - upfrontCost);
  const postRunway = essentialExpenses > 0 ? postCash / essentialExpenses : 0;
  const baseFCF = Math.max(0, monthlyIncome - essentialExpenses - monthlyDebt);
  const postFCF = analysisReport.coreFinancialReport.cashFlowAnalysis.output.postDecisionMonthlyFCF;

  // ── SECTION 1: AIMLY VERDICT ─────────────────────────────────────────────
  const section1_verdict = {
    verdictCode: verdict.verdictCode,
    verdictLabel: locale === "fr" ? verdict.verdictLabelFr : locale === "es" ? verdict.verdictLabelEs : verdict.verdictLabelEn,
    oneSentenceExplanation: locale === "fr" ? verdict.verdictSummaryFr : locale === "es" ? verdict.verdictSummaryEs : verdict.verdictSummaryEn,
    biggestRisk: {
      title: locale === "fr" ? verdict.biggestRisk.titleFr : locale === "es" ? verdict.biggestRisk.titleEs : verdict.biggestRisk.titleEn,
      description: locale === "fr" ? verdict.biggestRisk.descriptionFr : locale === "es" ? verdict.biggestRisk.descriptionEs : verdict.biggestRisk.descriptionEn,
      severity: verdict.biggestRisk.severity,
    },
    keyCondition: {
      title: locale === "fr" ? verdict.keyCondition.titleFr : locale === "es" ? verdict.keyCondition.titleEs : verdict.keyCondition.titleEn,
      actionableRequirement: locale === "fr" ? verdict.keyCondition.actionableRequirementFr : locale === "es" ? verdict.keyCondition.actionableRequirementEs : verdict.keyCondition.actionableRequirementEn,
    },
    recommendedNextAction:
      verdict.verdictCode === "STRONG_GO"
        ? (locale === "fr" ? "Procéder selon le calendrier prévu tout en respectant le budget alloué." : "Proceed on planned schedule while respecting strict budget ceiling.")
        : verdict.verdictCode === "CONDITIONAL_GO"
        ? (locale === "fr" ? "Vérifier le respect du seuil plancher d'épargne avant de confirmer le paiement." : "Verify liquid reserve floor before confirming purchase.")
        : verdict.verdictCode === "WAIT"
        ? (locale === "fr" ? "Activer un plan d'épargne dédié de 60 jours avant d'engager les fonds." : "Activate a 60-day pre-saving schedule before committing.")
        : verdict.verdictCode === "MODIFY"
        ? (locale === "fr" ? "Restructurer le financement ou opter pour une alternative reconditionnée." : "Restructure financing terms or explore certified refurbished alternatives.")
        : (locale === "fr" ? "Suspendre l'engagement et reconstituer en priorité le matelas de sécurité." : "Halt commitment and prioritize rebuilding the emergency cushion."),
  };

  // ── SECTION 2: THE DECISION ──────────────────────────────────────────────
  const section2_theDecision = {
    actionTitle: decisionObject.definition.proposed_action,
    category: decisionObject.definition.decision_category.replace(/_/g, " "),
    timeHorizonMonths: decisionObject.definition.decision_time_horizon.value || 36,
    reversibility: decisionObject.definition.reversibility_level.replace(/_/g, " "),
    underlyingProblemOrGoal: decisionObject.definition.underlying_goal || decisionObject.definition.underlying_problem || "Capital allocation & asset acquisition",
    financialCommitmentSummary: `${fmt(amount)} total commitment (${fmt(upfrontCost)} upfront${recurringUpkeep > 0 ? `, +${fmt(recurringUpkeep)}/mo upkeep` : ""})`,
  };

  // ── SECTION 3: WHAT AIMLY KNOWS ──────────────────────────────────────────
  const facts: string[] = [];
  const estimates: string[] = [];
  const assumptions: string[] = [];
  const unknowns: string[] = [];

  const inspectField = (label: string, field: any, formattedVal: string) => {
    const src = field?.source || field?.classification || "UNKNOWN";
    if (src === "VERIFIED_FACT") facts.push(`${label}: ${formattedVal} (Verified)`);
    else if (src === "USER_PROVIDED") facts.push(`${label}: ${formattedVal} (Declared by user)`);
    else if (src === "USER_ESTIMATE") estimates.push(`${label}: ~${formattedVal} (User Estimate)`);
    else if (src === "ASSUMPTION") assumptions.push(`${label}: ${formattedVal} (Aimly Assumption)`);
    else unknowns.push(`${label} (Unstated / Not declared)`);
  };

  inspectField("Purchase Amount", decisionObject.definition.financial_amount, fmt(amount));
  inspectField("Monthly Take-Home Income", decisionObject.context.monthly_income, fmt(monthlyIncome));
  inspectField("Liquid Cash Savings", decisionObject.context.liquid_savings, fmt(liquidSavings));
  inspectField("Essential Expenses", decisionObject.context.essential_expenses, fmt(essentialExpenses));
  if (recurringUpkeep > 0) inspectField("Recurring Upkeep", decisionObject.economics.recurring_cost, fmt(recurringUpkeep));
  if (decisionObject.economics.expected_revenue.value) inspectField("Projected Client Revenue", decisionObject.economics.expected_revenue, fmt(decisionObject.economics.expected_revenue.value));

  const section3_whatAimlyKnows = {
    facts,
    estimates,
    assumptions,
    unknowns,
    epistemicConfidenceScore: verification.fourIndicators.dataCompleteness.score,
  };

  // ── SECTION 4: FINANCIAL IMPACT ──────────────────────────────────────────
  const section4_financialImpact = {
    upfrontImpactFormatted: fmt(upfrontCost),
    recurringImpactFormatted: recurringUpkeep > 0 ? `${fmt(recurringUpkeep)}/mo` : "None",
    totalLifetimeCostFormatted: fmt(analysisReport.coreFinancialReport.tcoAnalysis?.output.trueLifetimeNetCost || amount),
    timeHorizonFormatted: `${decisionObject.definition.decision_time_horizon.value || 36} months`,
    opportunityCostHeadline: analysisReport.coreFinancialReport.opportunityCostAnalysis.output.primaryGoalTradeoffHeadline,
    liquidRunwayBeforeVsAfter: `${baseRunway.toFixed(1)} mo → ${postRunway.toFixed(1)} mo (${postRunway >= 3.0 ? "Safe" : "Compressed"})`,
    freeCashFlowBeforeVsAfter: `${fmt(baseFCF)}/mo → ${fmt(postFCF)}/mo`,
  };

  // ── SECTION 5: WHAT HAPPENS NEXT? ────────────────────────────────────────
  const delayDays = Math.round((amount / Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350)) * 30);
  const section5_futureTimeline = {
    today: `Day 0: Liquid reserves decrease by ${fmt(upfrontCost)}, leaving ${fmt(postCash)} in bank. Emergency runway stands at ${postRunway.toFixed(1)} months.`,
    next30To90Days: `Months 1–3: Monthly cash flow absorbs any recurring upkeep (${fmt(recurringUpkeep)}/mo). Priority goal milestone "${decisionObject.context.primary_goal?.title || "Goal"}" paused for ~${delayDays} days.`,
    year1: `Month 12: Cumulative capital outlay reaches ${fmt(upfrontCost + recurringUpkeep * 12)}. Asset value depreciates to ~${fmt(Math.round(amount * 0.7))}.`,
    longTerm: `3–5 Years: Full lifecycle cost reaches ${fmt(analysisReport.coreFinancialReport.tcoAnalysis?.output.trueLifetimeNetCost || amount)}. Terminal liquidation value settles at ~${fmt(Math.round(amount * 0.3))}.`,
  };

  // ── SECTION 6: SCENARIOS ─────────────────────────────────────────────────
  const section6_scenarios = {
    favorable: analysisReport.multiScenarioReport.scenarios.FAVORABLE_CASE,
    base: analysisReport.multiScenarioReport.scenarios.BASE_CASE,
    cautious: analysisReport.multiScenarioReport.scenarios.CAUTIOUS_CASE,
    adverse: analysisReport.multiScenarioReport.scenarios.ADVERSE_CASE,
    severeStress: analysisReport.multiScenarioReport.scenarios.SEVERE_STRESS_CASE,
  };

  // ── SECTION 7: THE 3 NUMBERS THAT MATTER MOST ────────────────────────────
  const section7_threeNumbersThatMatterMost = analysisReport.sensitivityReport.topThreeVariables;

  // ── SECTION 8: WHAT COULD CHANGE THE ANSWER? ─────────────────────────────
  const section8_whatCouldChangeTheAnswer = {
    costThresholdFlip: locale === "fr" ? verdict.whatWouldChangeTheAnswer.costThresholdFlipFr : verdict.whatWouldChangeTheAnswer.costThresholdFlipEn,
    incomeThresholdFlip: locale === "fr" ? verdict.whatWouldChangeTheAnswer.incomeThresholdFlipFr : verdict.whatWouldChangeTheAnswer.incomeThresholdFlipEn,
    timingThresholdFlip: locale === "fr" ? verdict.whatWouldChangeTheAnswer.timingThresholdFlipFr : verdict.whatWouldChangeTheAnswer.timingThresholdFlipEn,
    evidenceThresholdFlip: locale === "fr" ? verdict.whatWouldChangeTheAnswer.evidenceThresholdFlipFr : verdict.whatWouldChangeTheAnswer.evidenceThresholdFlipEn,
  };

  // ── SECTION 9: RED FLAGS ─────────────────────────────────────────────────
  const criticalFlags: string[] = [];
  const importantFlags: string[] = [];
  const watchFlags: string[] = [];

  if (postRunway < 1.0) criticalFlags.push(`CRITICAL: Liquid emergency runway falls below 1.0 month (${postRunway.toFixed(1)} mo remaining).`);
  if (analysisReport.redTeamReport.fatalFlawsCount > 0) criticalFlags.push("CRITICAL: Red Team identified catastrophic liquidity insolvency flaw.");
  if (postRunway >= 1.0 && postRunway < 3.0) importantFlags.push(`IMPORTANT: Reserve buffer is below canonical 3.0-month safety threshold (${postRunway.toFixed(1)} mo).`);
  if (isLoan && (decisionObject.economics.interest_rate.value || 0) >= 12.0) importantFlags.push(`IMPORTANT: High borrowing APR (${decisionObject.economics.interest_rate.value}%) creates persistent interest drag.`);
  if (recurringUpkeep === 0 && decisionObject.definition.decision_category === "BUY_A_CAR") watchFlags.push("WATCH: Zero maintenance & insurance upkeep budgeted for vehicle.");
  if (decisionObject.context.monthly_income.source === "ASSUMPTION") watchFlags.push("WATCH: Monthly income based on default assumption, not verified paystub.");

  const section9_redFlags = {
    critical: criticalFlags,
    important: importantFlags,
    watch: watchFlags,
    hasCriticalRedFlags: criticalFlags.length > 0,
  };

  // ── SECTION 10: PRE-MORTEM AUTOPSY ───────────────────────────────────────
  const section10_preMortemAutopsy = {
    premise: locale === "fr" ? analysisReport.preMortemReport.preMortemPremiseFr : analysisReport.preMortemReport.preMortemPremiseEn,
    topFailureModes: analysisReport.preMortemReport.identifiedFailureModes.slice(0, 3).map((fm) => ({
      category: fm.category.replace(/_/g, " "),
      description: locale === "fr" ? fm.failureDescriptionFr : fm.failureDescriptionEn,
      likelihood: fm.likelihood,
      impact: fm.financialImpact,
      earlyWarning: locale === "fr" ? fm.earlyWarningSignalFr : fm.earlyWarningSignalEn,
      mitigation: locale === "fr" ? fm.preventativeMitigationFr : fm.preventativeMitigationEn,
    })),
  };

  // ── SECTION 11: BETTER ALTERNATIVES ──────────────────────────────────────
  const section11_betterAlternatives = {
    isCurrentProposalOptimal: analysisReport.alternativesReport.isCurrentProposalOptimal,
    optimalStructureVerdict: locale === "fr" ? analysisReport.alternativesReport.optimalStructureVerdictFr : analysisReport.alternativesReport.optimalStructureVerdictEn,
    topAlternatives: analysisReport.alternativesReport.evaluatedAlternatives.slice(0, 3).map((alt) => ({
      code: alt.code,
      title: locale === "fr" ? alt.titleFr : alt.titleEn,
      summary: locale === "fr" ? alt.actionSummaryFr : alt.actionSummaryEn,
      cost: fmt(alt.immediateCost),
      efficiencyScore: alt.strategicEfficiencyScore,
      isRecommended: alt.isRecommendedAlternative,
    })),
  };

  // ── SECTION 12: AIMLY ACTION PLAN ────────────────────────────────────────
  const actionPlanSteps: string[] = [];
  if (postRunway < 3.0) actionPlanSteps.push(`1. Accumulate a pre-saving buffer of ${fmt(Math.round(amount * 0.4))} before ordering.`);
  actionPlanSteps.push(`2. Set a strict all-inclusive purchase cap of ${fmt(amount)} (refuse optional warranties/accessories).`);
  actionPlanSteps.push(`3. Confirm net monthly income and bank balance in Aimly to increase confidence to 95%.`);
  if (isLoan) actionPlanSteps.push(`4. Shop lender quotes to lock in fixed borrowing APR < 9.0%.`);

  const section12_actionPlan = {
    mandatoryPreCommitmentSteps: actionPlanSteps,
    suggestedDecisionDeadline: "7-day cooling-off recommended",
    coolingOffPeriodRecommended: true,
  };

  return {
    reportId: `aimly-rpt-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    currency: curr,
    locale,
    section1_verdict,
    section2_theDecision,
    section3_whatAimlyKnows,
    section4_financialImpact,
    section5_futureTimeline,
    section6_scenarios,
    section7_threeNumbersThatMatterMost,
    section8_whatCouldChangeTheAnswer,
    section9_redFlags,
    section10_preMortemAutopsy,
    section11_betterAlternatives,
    section12_actionPlan,
    verification,
    robustness,
  };
}
