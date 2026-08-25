/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * STEP 4: PRIORITIES & TRADE-OFF ENGINE (PROMPT 6)
 *
 * Implements a transparent weighted preference framework that:
 * 1. Honors user preferences across 10 strategic dimensions
 * 2. Detects and surfaces explicit priority conflicts (e.g. Lowest Monthly vs Lowest Total Cost)
 * 3. Enforces strict separation between USER PREFERENCE and INVIOLABLE FINANCIAL CONSTRAINTS
 * 4. Refuses to allow aggressive preferences (e.g. Growth/Return) to mask catastrophic insolvency risks
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import {
  DecisionIntelligenceObject,
  DecisionPriorities,
} from "./master-decision-model";

export interface PriorityTradeOffConflict {
  id: string;
  priorityA: string;
  priorityB: string;
  headlineEn: string;
  headlineFr: string;
  headlineEs: string;
  conflictExplanationEn: string;
  conflictExplanationFr: string;
  conflictExplanationEs: string;
  realWorldTradeOffEn: string;
  realWorldTradeOffFr: string;
  realWorldTradeOffEs: string;
}

export interface FinancialConstraintCheck {
  id: string;
  nameEn: string;
  nameFr: string;
  nameEs: string;
  passed: boolean;
  actualValue: string;
  thresholdLimit: string;
  isCatastrophicIfFailed: boolean;
  failureMessageEn: string;
  failureMessageFr: string;
  failureMessageEs: string;
}

export interface PreferenceTradeOffEvaluation {
  userPrioritiesSummary: {
    primaryFocus: string;
    topThreeWeights: { key: string; labelEn: string; labelFr: string; labelEs: string; weight: number }[];
  };
  detectedConflicts: PriorityTradeOffConflict[];
  primaryTradeOffHighlight: {
    titleEn: string;
    titleFr: string;
    titleEs: string;
    coreDilemmaEn: string;
    coreDilemmaFr: string;
    coreDilemmaEs: string;
  } | null;
  constraintsEvaluation: {
    allPassed: boolean;
    safetyOverrideTriggered: boolean;
    checks: FinancialConstraintCheck[];
    safetyOverrideNoticeEn?: string;
    safetyOverrideNoticeFr?: string;
    safetyOverrideNoticeEs?: string;
  };
  scenarioWeightScores: {
    scenarioCode: "OPTION_A" | "OPTION_B" | "OPTION_C";
    preferenceFitScore: number; // 0 to 100
    constraintPenalty: number;  // 0 to 100
    finalAdjustedScore: number; // 0 to 100
    isViable: boolean;
  }[];
}

/**
 * EVALUATE PRIORITIES, DETECT CONFLICTS & ENFORCE INVIOLABLE CONSTRAINTS
 */
export function evaluatePreferencesAndTradeOffs(
  decisionObject: DecisionIntelligenceObject
): PreferenceTradeOffEvaluation {
  const p = decisionObject.priorities;
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = decisionObject.definition.financial_amount.value || 0;
  const downPayment = decisionObject.economics.down_payment.value || 0;
  const liquidCash = decisionObject.context.liquid_savings.value || 0;
  const monthlyIncome = decisionObject.context.monthly_income.value || 0;
  const essentialExpenses = decisionObject.context.essential_expenses.value || 0;
  const monthlyDebt = decisionObject.context.monthly_debt_payments.value || 0;
  const postCash = Math.max(0, liquidCash - (downPayment > 0 ? downPayment : amount));
  const postRunwayMonths = essentialExpenses > 0 ? postCash / essentialExpenses : 0;
  const baselineFCF = Math.max(0, monthlyIncome - essentialExpenses - monthlyDebt);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. TOP WEIGHTS EXTRACTION
  // ─────────────────────────────────────────────────────────────────────────
  const weightsList: { key: string; labelEn: string; labelFr: string; labelEs: string; weight: number }[] = [
    { key: "liquidity_preservation", labelEn: "Preserving Cash & Reserves", labelFr: "Préservation des Liquidités", labelEs: "Preservación de Liquidez", weight: p.liquidity_preservation },
    { key: "downside_protection", labelEn: "Minimizing Downside Risk", labelFr: "Protection contre les Risques", labelEs: "Protección ante Riesgos", weight: p.downside_protection },
    { key: "lowest_total_cost", labelEn: "Lowest Total Lifetime Cost", labelFr: "Coût Global le Plus Bas", labelEs: "Menor Coste Total", weight: p.lowest_total_cost },
    { key: "lowest_monthly_payment", labelEn: "Lowest Monthly Payment", labelFr: "Mensualité la Plus Faible", labelEs: "Cuota Mensual Mínima", weight: p.lowest_monthly_payment },
    { key: "maximum_return", labelEn: "Maximizing Financial Return", labelFr: "Maximisation du Rendement", labelEs: "Máximo Retorno Financiero", weight: p.maximum_return },
    { key: "growth", labelEn: "Accelerating Wealth & Growth", labelFr: "Accélération de la Croissance", labelEs: "Crecimiento Patrimonial", weight: p.growth },
    { key: "flexibility", labelEn: "Retaining Freedom & Flexibility", labelFr: "Flexibilité et Liberté d'Action", labelEs: "Flexibilidad Financiera", weight: p.flexibility },
    { key: "speed", labelEn: "Immediate Execution & Speed", labelFr: "Rapidité d'Exécution", labelEs: "Rapidez de Ejecución", weight: p.speed },
    { key: "stability", labelEn: "Long-Term Predictability & Stability", labelFr: "Stabilité et Prévisibilité", labelEs: "Estabilidad y Previsibilidad", weight: p.stability },
    { key: "certainty", labelEn: "Guaranteed Outcomes & Certainty", labelFr: "Certitude des Résultats", labelEs: "Certeza de Resultados", weight: p.certainty },
  ];

  weightsList.sort((a, b) => b.weight - a.weight);
  const topThree = weightsList.slice(0, 3);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CONFLICT DETECTION ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  const detectedConflicts: PriorityTradeOffConflict[] = [];

  // Conflict 1: Lowest Monthly Payment vs Lowest Total Cost
  if (p.lowest_monthly_payment >= 0.6 && p.lowest_total_cost >= 0.6) {
    detectedConflicts.push({
      id: "conflict_monthly_vs_total_cost",
      priorityA: "Lowest Monthly Payment",
      priorityB: "Lowest Total Cost",
      headlineEn: "Monthly Payment Minimization vs Total Lifetime Cost",
      headlineFr: "Mensualité Minimale vs Coût Total de Revient",
      headlineEs: "Cuota Mínima vs Coste Total Acumulado",
      conflictExplanationEn: "Stretching a purchase over longer loan tenures reduces monthly payments, but compounds cumulative interest costs.",
      conflictExplanationFr: "Allonger la durée d'un crédit allège la mensualité, mais augmente significativement les intérêts totaux payés.",
      conflictExplanationEs: "Alargar el plazo de financiación reduce la cuota mensual, pero incrementa notablemente los intereses totales.",
      realWorldTradeOffEn: "You cannot simultaneously minimize monthly cash outflow and pay the minimum total price.",
      realWorldTradeOffFr: "Vous ne pouvez pas minimiser la mensualité et payer le prix total minimal en même temps.",
      realWorldTradeOffEs: "No es posible minimizar la cuota mensual y pagar el precio total mínimo simultáneamente.",
    });
  }

  // Conflict 2: Maximum Growth vs Maximum Liquidity Preservation
  if ((p.growth >= 0.6 || p.maximum_return >= 0.6) && p.liquidity_preservation >= 0.6) {
    detectedConflicts.push({
      id: "conflict_growth_vs_liquidity",
      priorityA: "Maximum Growth / Return",
      priorityB: "Liquidity Preservation",
      headlineEn: "Growth Acceleration vs Cash Buffer Preservation",
      headlineFr: "Accélération de la Croissance vs Préservation des Réserves",
      headlineEs: "Crecimiento Patrimonial vs Preservación de Reservas",
      conflictExplanationEn: "Deploying capital into growth or business ventures immobilizes liquid cash, reducing emergency cushion.",
      conflictExplanationFr: "Investir son capital dans la croissance ou un business immobilise des liquidités et entame la sécurité.",
      conflictExplanationEs: "Invertir capital en crecimiento o negocios inmoviliza liquidez y reduce el fondo de emergencia.",
      realWorldTradeOffEn: "High growth demands capital commitment; maximum liquidity requires keeping cash idle.",
      realWorldTradeOffFr: "La croissance exige d'engager du capital ; la liquidité maximale exige de garder du cash dormant.",
      realWorldTradeOffEs: "El crecimiento exige comprometer capital; la liquidez máxima exige mantener efectivo ocioso.",
    });
  }

  // Conflict 3: Maximum Return vs Minimum Downside / Stability
  if (p.maximum_return >= 0.6 && (p.downside_protection >= 0.6 || p.stability >= 0.6)) {
    detectedConflicts.push({
      id: "conflict_return_vs_downside",
      priorityA: "Maximum Return",
      priorityB: "Downside Protection",
      headlineEn: "Upside Maximization vs Downside Protection",
      headlineFr: "Maximisation du Rendement vs Protection contre les Pertes",
      headlineEs: "Máximo Retorno vs Protección contra Pérdidas",
      conflictExplanationEn: "Seeking higher returns inevitably involves outcome variability or potential capital lockup.",
      conflictExplanationFr: "Rechercher un rendement élevé implique inévitablement de la volatilité ou un risque d'illiquidité.",
      conflictExplanationEs: "Buscar mayor rentabilidad implica inevitablemente volatilidad o riesgo de iliquidez.",
      realWorldTradeOffEn: "Risk-free high return does not exist in financial markets.",
      realWorldTradeOffFr: "Le rendement élevé sans risque n'existe pas sur les marchés financiers.",
      realWorldTradeOffEs: "La alta rentabilidad sin riesgo no existe en los mercados financieros.",
    });
  }

  // Conflict 4: Speed vs Flexibility / Lowest Cost
  if (p.speed >= 0.7 && (p.flexibility >= 0.6 || p.lowest_total_cost >= 0.6)) {
    detectedConflicts.push({
      id: "conflict_speed_vs_deliberation",
      priorityA: "Immediate Speed",
      priorityB: "Flexibility & Lowest Cost",
      headlineEn: "Immediate Speed vs Patient Optimization",
      headlineFr: "Vitesse d'Exécution Immédiate vs Optimisation Patiente",
      headlineEs: "Rapidez Inmediata vs Optimización Paciente",
      conflictExplanationEn: "Executing immediately deprives you of time to negotiate, compare secondary markets, or save in advance.",
      conflictExplanationFr: "Acheter immédiatement supprime le temps de négociation et la possibilité d'épargner au préalable.",
      conflictExplanationEs: "Comprar de inmediato elimina el tiempo para negociar y la opción de ahorrar previamente.",
      realWorldTradeOffEn: "Speed comes at a convenience premium; patient saving is mathematically cheaper.",
      realWorldTradeOffFr: "La rapidité a un coût ; l'épargne progressive préalable est mathématiquement moins chère.",
      realWorldTradeOffEs: "La inmediatez tiene un sobrecoste; el ahorro previo planificado es más económico.",
    });
  }

  // Primary Dilemma
  const primaryTradeOffHighlight =
    detectedConflicts.length > 0
      ? {
          titleEn: detectedConflicts[0].headlineEn,
          titleFr: detectedConflicts[0].headlineFr,
          titleEs: detectedConflicts[0].headlineEs,
          coreDilemmaEn: detectedConflicts[0].realWorldTradeOffEn,
          coreDilemmaFr: detectedConflicts[0].realWorldTradeOffFr,
          coreDilemmaEs: detectedConflicts[0].realWorldTradeOffEs,
        }
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  // 3. INVIOLABLE FINANCIAL CONSTRAINTS CHECK
  // ─────────────────────────────────────────────────────────────────────────
  const constraintChecks: FinancialConstraintCheck[] = [];

  // Constraint 1: Absolute Cash Insolvency
  const cashInsolvencyPassed = amount <= liquidCash || downPayment <= liquidCash;
  constraintChecks.push({
    id: "constraint_cash_solvency",
    nameEn: "Upfront Cash Solvency",
    nameFr: "Solvabilité Immédiate en Trésorerie",
    nameEs: "Solvabilidad Inmediata de Tesorería",
    passed: cashInsolvencyPassed,
    actualValue: fmt(liquidCash),
    thresholdLimit: fmt(downPayment > 0 ? downPayment : amount),
    isCatastrophicIfFailed: true,
    failureMessageEn: `Proposed upfront payment (${fmt(downPayment > 0 ? downPayment : amount)}) exceeds total available cash (${fmt(liquidCash)}).`,
    failureMessageFr: `L'apport ou paiement immédiat (${fmt(downPayment > 0 ? downPayment : amount)}) dépasse votre épargne totale (${fmt(liquidCash)}).`,
    failureMessageEs: `El pago inmediato (${fmt(downPayment > 0 ? downPayment : amount)}) supera su efectivo disponible (${fmt(liquidCash)}).`,
  });

  // Constraint 2: Emergency Runway Survival Floor (>= 1.0 Month)
  const runwaySurvivalPassed = postRunwayMonths >= 1.0;
  constraintChecks.push({
    id: "constraint_emergency_runway_floor",
    nameEn: "Emergency Runway Survival Floor (>= 1.0 Mo)",
    nameFr: "Plancher de Survie de Sécurité (>= 1,0 Mois)",
    nameEs: "Suelo de Supervivencia de Emergencia (>= 1,0 Mes)",
    passed: runwaySurvivalPassed,
    actualValue: `${postRunwayMonths.toFixed(1)} mo`,
    thresholdLimit: "1.0 mo minimum",
    isCatastrophicIfFailed: true,
    failureMessageEn: `Leaves only ${postRunwayMonths.toFixed(1)} months of living expenses. A single shock will force default.`,
    failureMessageFr: `Ne laisse que ${postRunwayMonths.toFixed(1)} mois de charges. Le moindre imprévu provoquera un défaut de paiement.`,
    failureMessageEs: `Deja solo ${postRunwayMonths.toFixed(1)} meses de gastos. Cualquier imprevisto provocará impagos.`,
  });

  // Constraint 3: Free Cash Flow Solvency
  const fcfSolvencyPassed = baselineFCF >= (decisionObject.economics.recurring_cost.value || 0);
  constraintChecks.push({
    id: "constraint_monthly_fcf_solvency",
    nameEn: "Monthly Free Cash Flow Solvency",
    nameFr: "Solvabilité du Flux de Trésorerie Mensuel",
    nameEs: "Solvabilidad del Flujo de Caja Mensual",
    passed: fcfSolvencyPassed,
    actualValue: fmt(baselineFCF),
    thresholdLimit: fmt(decisionObject.economics.recurring_cost.value || 0),
    isCatastrophicIfFailed: true,
    failureMessageEn: "New monthly recurring obligation exceeds monthly free cash flow, creating structural monthly deficits.",
    failureMessageFr: "Le nouvel engagement mensuel dépasse votre cash-flow libre, créant un déficit structurel mensuel.",
    failureMessageEs: "El nuevo compromiso mensual supera su flujo de caja libre, generando un déficit mensual estructural.",
  });

  const allConstraintsPassed = constraintChecks.every((c) => c.passed);
  const safetyOverrideTriggered = !allConstraintsPassed;

  let safetyOverrideNoticeEn: string | undefined;
  let safetyOverrideNoticeFr: string | undefined;
  let safetyOverrideNoticeEs: string | undefined;

  if (safetyOverrideTriggered) {
    safetyOverrideNoticeEn =
      "SAFETY OVERRIDE ACTIVATED: Your selected priorities cannot override inviolable financial survival constraints. A catastrophic insolvency risk was detected.";
    safetyOverrideNoticeFr =
      "SÉCURITÉ PRIORITAIRE ACTIVÉE : Vos préférences personnelles ne peuvent pas masquer une rupture de solvabilité. Un risque financier critique a été détecté.";
    safetyOverrideNoticeEs =
      "CONTROL DE SEGURIDAD ACTIVADO: Sus preferencias no pueden anular los límites de supervivencia financiera. Se detectó un riesgo crítico de insolvencia.";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. SCENARIO WEIGHTED SCORES
  // ─────────────────────────────────────────────────────────────────────────
  // Option A (Cash): High on Lowest Total Cost & Speed; Low if Liquidity Preservation is high
  const scoreA = Math.round(
    p.lowest_total_cost * 35 +
      p.speed * 25 +
      (1 - p.liquidity_preservation) * 20 +
      p.stability * 20
  );

  // Option B (Financing / Spread): High on Lowest Monthly Payment & Liquidity Preservation
  const scoreB = Math.round(
    p.lowest_monthly_payment * 40 +
      p.liquidity_preservation * 30 +
      p.flexibility * 20 +
      (1 - p.lowest_total_cost) * 10
  );

  // Option C (Save & Delay): High on Downside Protection, Liquidity, & Certainty
  const scoreC = Math.round(
    p.downside_protection * 35 +
      p.liquidity_preservation * 25 +
      p.lowest_total_cost * 20 +
      p.certainty * 20
  );

  const penaltyA = !cashInsolvencyPassed || !runwaySurvivalPassed ? 70 : 0;
  const penaltyB = !fcfSolvencyPassed ? 60 : 0;
  const penaltyC = 0; // Save & Delay is universally safe

  const scenarioWeightScores = [
    {
      scenarioCode: "OPTION_A" as const,
      preferenceFitScore: scoreA,
      constraintPenalty: penaltyA,
      finalAdjustedScore: Math.max(0, scoreA - penaltyA),
      isViable: penaltyA === 0,
    },
    {
      scenarioCode: "OPTION_B" as const,
      preferenceFitScore: scoreB,
      constraintPenalty: penaltyB,
      finalAdjustedScore: Math.max(0, scoreB - penaltyB),
      isViable: penaltyB === 0,
    },
    {
      scenarioCode: "OPTION_C" as const,
      preferenceFitScore: scoreC,
      constraintPenalty: penaltyC,
      finalAdjustedScore: Math.max(0, scoreC - penaltyC),
      isViable: true,
    },
  ];

  return {
    userPrioritiesSummary: {
      primaryFocus: topThree[0]?.labelEn || "Balanced Strategy",
      topThreeWeights: topThree,
    },
    detectedConflicts,
    primaryTradeOffHighlight,
    constraintsEvaluation: {
      allPassed: allConstraintsPassed,
      safetyOverrideTriggered,
      checks: constraintChecks,
      safetyOverrideNoticeEn,
      safetyOverrideNoticeFr,
      safetyOverrideNoticeEs,
    },
    scenarioWeightScores,
  };
}
