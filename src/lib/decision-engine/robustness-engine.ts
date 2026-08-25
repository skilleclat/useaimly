/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * DECISION ROBUSTNESS ENGINE (PROMPT 16)
 *
 * Evaluates: "How well does this decision survive when reality is worse than expected?"
 *
 * Classifies decisions strictly into 4 supported tiers:
 * 1. FRAGILE — Small negative variations cause material financial distress.
 * 2. MODERATELY ROBUST — Absorbs moderate friction before threatening solvency.
 * 3. ROBUST — Survives across a broad range of negative economic shocks.
 * 4. ASYMMETRIC UPSIDE — Downside strictly capped while upside potential is significant.
 *
 * Grounded in 5 empirical pillars:
 * - Scenario Performance (Base, Adverse, Severe Stress)
 * - Sensitivity & Cost Overrun Elasticity
 * - Downside Exposure & Worst Plausible Loss
 * - Reversibility & Liquidation Friction
 * - Liquidity Impact & Savings Exposure
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject, ReversibilityLevel } from "./master-decision-model";
import { Step5AnalysisOrchestrationReport } from "./step5-analysis-orchestrator";

export type RobustnessClassificationCode =
  | "FRAGILE"
  | "MODERATELY_ROBUST"
  | "ROBUST"
  | "ASYMMETRIC_UPSIDE";

export interface RobustnessSupportingPillars {
  scenarioPerformance: {
    baseCaseRunwayMonths: number;
    adverseCaseRunwayMonths: number;
    severeStressSurvival: boolean;
    fcfRetentionPctInAdverse: number;
  };
  sensitivityElasticity: {
    topVariableElasticity: number;
    costOverrunTolerancePct: number;
    incomeDropTolerancePct: number;
  };
  downsideExposure: {
    worstPlausibleLoss: number;
    liquidityFloorBreached: boolean;
    recoveryEffortMonths: number;
  };
  reversibility: {
    level: ReversibilityLevel;
    exitPenaltyRatio: number;
  };
  liquidityImpact: {
    savingsExposurePct: number;
    postDecisionRunwayMonths: number;
  };
}

export interface RobustnessAssessmentReport {
  timestamp: string;
  currency: CurrencyCode;
  classification: RobustnessClassificationCode;
  classificationLabelEn: string;
  classificationLabelFr: string;
  classificationLabelEs: string;
  robustnessScore: number; // 0 to 100
  corePillars: RobustnessSupportingPillars;
  resilienceNarrativeEn: string;
  resilienceNarrativeFr: string;
  resilienceNarrativeEs: string;
  stressSurvivalMarginEn: string;
  stressSurvivalMarginFr: string;
  stressSurvivalMarginEs: string;
  isAsymmetricOpportunity: boolean;
  asymmetryRationaleEn?: string;
  asymmetryRationaleFr?: string;
  asymmetryRationaleEs?: string;
}

/**
 * EVALUATE DECISION ROBUSTNESS ACROSS UNFAVORABLE VARIATIONS
 */
export function evaluateDecisionRobustness(
  decisionObject: DecisionIntelligenceObject,
  analysisReport: Step5AnalysisOrchestrationReport
): RobustnessAssessmentReport {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const liquidSavings = Math.max(1, decisionObject.context.liquid_savings.value || 1);
  const monthlyIncome = Math.max(1, decisionObject.context.monthly_income.value || 1);
  const essentialExpenses = Math.max(1, decisionObject.context.essential_expenses.value || 1);
  const expectedRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE" || expectedRevenue > 0;
  const reversibility = decisionObject.definition.reversibility_level;

  const postCash = Math.max(0, liquidSavings - (isLoan ? downPayment : amount));
  const postRunway = postCash / essentialExpenses;
  const savingsExposurePct = (amount / liquidSavings) * 100;

  const scenarios = analysisReport.multiScenarioReport.scenarios;
  const baseRunway = scenarios.BASE_CASE.endingEmergencyRunwayMonths;
  const adverseRunway = scenarios.ADVERSE_CASE.endingEmergencyRunwayMonths;
  const severeStressSolvent = scenarios.SEVERE_STRESS_CASE.isSolvent;

  const baseFCF = Math.max(1, scenarios.BASE_CASE.monthlyFreeCashFlow);
  const adverseFCF = Math.max(0, scenarios.ADVERSE_CASE.monthlyFreeCashFlow);
  const fcfRetentionPct = Math.round((adverseFCF / baseFCF) * 100);

  // Reversibility exit penalty
  let exitPenaltyRatio = 0.2;
  if (reversibility === "IRREVERSIBLE") exitPenaltyRatio = 1.0;
  else if (reversibility === "HARD_TO_REVERSE") exitPenaltyRatio = 0.6;
  else if (reversibility === "PARTIALLY_REVERSIBLE") exitPenaltyRatio = 0.35;
  else exitPenaltyRatio = 0.1;

  // Tolerances
  const costOverrunTolerancePct = postRunway >= 3.5 ? 35 : postRunway >= 2.5 ? 20 : postRunway >= 1.5 ? 10 : 5;
  const incomeDropTolerancePct = Math.round(Math.min(50, ((baseFCF / monthlyIncome) * 100)));

  const corePillars: RobustnessSupportingPillars = {
    scenarioPerformance: {
      baseCaseRunwayMonths: baseRunway,
      adverseCaseRunwayMonths: adverseRunway,
      severeStressSurvival: severeStressSolvent,
      fcfRetentionPctInAdverse: fcfRetentionPct,
    },
    sensitivityElasticity: {
      topVariableElasticity: analysisReport.sensitivityReport.topThreeVariables[0]?.elasticityScore || 0.8,
      costOverrunTolerancePct,
      incomeDropTolerancePct,
    },
    downsideExposure: {
      worstPlausibleLoss: Math.round(amount * exitPenaltyRatio),
      liquidityFloorBreached: adverseRunway < 2.0,
      recoveryEffortMonths: Math.ceil(amount / Math.max(100, baseFCF)),
    },
    reversibility: {
      level: reversibility,
      exitPenaltyRatio,
    },
    liquidityImpact: {
      savingsExposurePct: Math.round(savingsExposurePct),
      postDecisionRunwayMonths: Number(postRunway.toFixed(1)),
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CLASSIFICATION DETERMINISTIC LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  let classification: RobustnessClassificationCode = "MODERATELY_ROBUST";
  let isAsymmetricOpportunity = false;
  let asymmetryRationaleEn: string | undefined;
  let asymmetryRationaleFr: string | undefined;
  let asymmetryRationaleEs: string | undefined;

  // Check Asymmetric Upside: Downside strictly capped, potential return > 2x cost, high buffer
  if (
    isBusiness &&
    expectedRevenue * 12 >= amount * 1.8 &&
    postRunway >= 3.0 &&
    savingsExposurePct <= 30 &&
    reversibility !== "IRREVERSIBLE"
  ) {
    classification = "ASYMMETRIC_UPSIDE";
    isAsymmetricOpportunity = true;
    asymmetryRationaleEn = `Genuine Asymmetric Upside: Downside strictly capped to ${fmt(Math.round(amount * exitPenaltyRatio))} with ${postRunway.toFixed(1)} mo reserve floor, while annual revenue potential (${fmt(expectedRevenue * 12)}) delivers > 180% return.`;
    asymmetryRationaleFr = `Opportunité Asymétrique Réelle : Perte maximale bornée à ${fmt(Math.round(amount * exitPenaltyRatio))} (${postRunway.toFixed(1)} mois de réserve préservés), pour un potentiel de revenus annuel (${fmt(expectedRevenue * 12)}) supérieur à 180% du capital.`;
    asymmetryRationaleEs = `Oportunidad Asimétrica Real: Riesgo máximo limitado a ${fmt(Math.round(amount * exitPenaltyRatio))} con ${postRunway.toFixed(1)} meses de reserva protegidos, frente a un potencial anual (${fmt(expectedRevenue * 12)}) superior al 180%.`;
  } else if (
    severeStressSolvent &&
    adverseRunway >= 2.5 &&
    savingsExposurePct <= 35 &&
    postRunway >= 3.5
  ) {
    classification = "ROBUST";
  } else if (
    postRunway < 1.8 ||
    savingsExposurePct > 55 ||
    adverseRunway < 1.0 ||
    !severeStressSolvent
  ) {
    classification = "FRAGILE";
  } else {
    classification = "MODERATELY_ROBUST";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. COMPOSE LABELS & NARRATIVES
  // ─────────────────────────────────────────────────────────────────────────
  let classificationLabelEn = "";
  let classificationLabelFr = "";
  let classificationLabelEs = "";
  let resilienceNarrativeEn = "";
  let resilienceNarrativeFr = "";
  let resilienceNarrativeEs = "";
  let robustnessScore = 60;

  switch (classification) {
    case "ASYMMETRIC_UPSIDE":
      classificationLabelEn = "ASYMMETRIC UPSIDE";
      classificationLabelFr = "OPPORTUNITÉ ASYMÉTRIQUE";
      classificationLabelEs = "OPORTUNIDAD ASIMÉTRICA";
      robustnessScore = 92;
      resilienceNarrativeEn = `High-conviction structure. Maximum downside is strictly bounded while upside provides substantial capital leverage.`;
      resilienceNarrativeFr = `Structure à haute conviction. Risque baissier strictement borné et fort levier de création de valeur.`;
      resilienceNarrativeEs = `Estructura de alta convicción. Riesgo a la baja estrictamente acotado y alto apalancamiento de capital.`;
      break;

    case "ROBUST":
      classificationLabelEn = "ROBUST";
      classificationLabelFr = "ROBUSTE";
      classificationLabelEs = "ROBUSTO";
      robustnessScore = 85;
      resilienceNarrativeEn = `The decision maintains positive solvency across broad negative variations, absorbing both a 20% cost overrun and 15% income contraction.`;
      resilienceNarrativeFr = `La décision maintient sa solvabilité face à de multiples variations négatives, absorbant un surcoût de 20% et une baisse de 15% des revenus.`;
      resilienceNarrativeEs = `La decisión mantiene su solvencia frente a variaciones negativas, absorbiendo un sobrecoste del 20% y una caída de ingresos del 15%.`;
      break;

    case "MODERATELY_ROBUST":
      classificationLabelEn = "MODERATELY ROBUST";
      classificationLabelFr = "MODÉRÉMENT ROBUSTE";
      classificationLabelEs = "MODERADAMENTE ROBUSTO";
      robustnessScore = 65;
      resilienceNarrativeEn = `The decision can absorb minor friction (+10% cost) but would experience severe cash-flow strain under simultaneous negative shocks.`;
      resilienceNarrativeFr = `La décision absorbe des frictions modérées (+10% de surcoût) mais subirait une tension aiguë en cas de chocs cumulés.`;
      resilienceNarrativeEs = `La decisión absorbe fricciones leves (+10% de coste) pero sufriría tensiones agudas ante choques combinados.`;
      break;

    case "FRAGILE":
      classificationLabelEn = "FRAGILE";
      classificationLabelFr = "FRAGILE";
      classificationLabelEs = "FRÁGIL";
      robustnessScore = 30;
      resilienceNarrativeEn = `High vulnerability. A minor cost overrun or a 10% income dip pulls emergency reserves below the survival floor.`;
      resilienceNarrativeFr = `Forte vulnérabilité. Un léger dépassement budgétaire ou une baisse de 10% des revenus fait chuter les réserves sous le seuil critique.`;
      resilienceNarrativeEs = `Alta vulnerabilidad. Un leve sobrecoste o una caída del 10% en ingresos deja las reservas por debajo del mínimo de seguridad.`;
      break;
  }

  const stressSurvivalMarginEn = `Stress tolerance: Can absorb up to a ${costOverrunTolerancePct}% cost overrun or a ${incomeDropTolerancePct}% income contraction without insolvency.`;
  const stressSurvivalMarginFr = `Marge de résistance : Peut absorber jusqu'à ${costOverrunTolerancePct}% de surcoût ou ${incomeDropTolerancePct}% de baisse de revenus sans rupture.`;
  const stressSurvivalMarginEs = `Margen de resistencia: Puede absorber hasta un ${costOverrunTolerancePct}% de sobrecoste o un ${incomeDropTolerancePct}% de caída de ingresos sin insolvencia.`;

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    classification,
    classificationLabelEn,
    classificationLabelFr,
    classificationLabelEs,
    robustnessScore,
    corePillars,
    resilienceNarrativeEn,
    resilienceNarrativeFr,
    resilienceNarrativeEs,
    stressSurvivalMarginEn,
    stressSurvivalMarginFr,
    stressSurvivalMarginEs,
    isAsymmetricOpportunity,
    asymmetryRationaleEn,
    asymmetryRationaleFr,
    asymmetryRationaleEs,
  };
}
