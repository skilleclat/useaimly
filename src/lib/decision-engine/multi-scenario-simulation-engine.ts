/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * MULTI-SCENARIO SIMULATION ENGINE (PROMPT 8)
 *
 * Evaluates decisions across 5 Plausible Economic Futures:
 * 1. BASE CASE — Most reasonable, baseline grounded assumptions.
 * 2. FAVORABLE CASE — Variables develop better than expected (Never labeled "expected").
 * 3. CAUTIOUS CASE — Assumptions perform moderately below expectations (+10% cost, slight interest uptick).
 * 4. ADVERSE CASE — Several realistic negative shocks occur (-15% income/revenue, cost overruns).
 * 5. SEVERE STRESS CASE — Difficult but economically plausible compounded shocks (-25% income, +20% cost, +200bps rate).
 *
 * Computes exact financial outcome, cash-flow effect, liquidity effect, main assumption, main risk, and recoverability.
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export type PlausibleFutureCode =
  | "BASE_CASE"
  | "FAVORABLE_CASE"
  | "CAUTIOUS_CASE"
  | "ADVERSE_CASE"
  | "SEVERE_STRESS_CASE";

export interface PlausibleScenarioResult {
  code: PlausibleFutureCode;
  labelEn: string;
  labelFr: string;
  labelEs: string;
  narrativeDescriptionEn: string;
  narrativeDescriptionFr: string;
  narrativeDescriptionEs: string;

  // Financial Outcomes
  totalCostOutcome: number;
  monthlyFreeCashFlow: number;
  deltaFreeCashFlow: number;
  endingLiquidCash: number;
  endingEmergencyRunwayMonths: number;
  goalDelayDays: number;
  goalDelayMonths: number;

  // Core Pillars
  mainAssumptionEn: string;
  mainAssumptionFr: string;
  mainAssumptionEs: string;
  mainRiskEn: string;
  mainRiskFr: string;
  mainRiskEs: string;
  recoverabilityEn: string;
  recoverabilityFr: string;
  recoverabilityEs: string;

  // Status & Solvency
  isSolvent: boolean;
  solvencyStatus: "HEALTHY" | "TIGHT" | "STRESSED" | "INSOLVENT";
  recoveryEffortPerMonthRequired: number;
}

export interface MultiScenarioSimulationReport {
  timestamp: string;
  currency: CurrencyCode;
  scenarios: Record<PlausibleFutureCode, PlausibleScenarioResult>;
  orderedScenarios: PlausibleScenarioResult[];
  comparativeSummary: {
    bestPlausibleOutcomeSummaryEn: string;
    bestPlausibleOutcomeSummaryFr: string;
    bestPlausibleOutcomeSummaryEs: string;
    mostLikelyOutcomeSummaryEn: string;
    mostLikelyOutcomeSummaryFr: string;
    mostLikelyOutcomeSummaryEs: string;
    difficultPlausibleOutcomeSummaryEn: string;
    difficultPlausibleOutcomeSummaryFr: string;
    difficultPlausibleOutcomeSummaryEs: string;
    multipleCompoundedShocksSummaryEn: string;
    multipleCompoundedShocksSummaryFr: string;
    multipleCompoundedShocksSummaryEs: string;
  };
  downsideSurvivalThresholdMonths: number;
  maximumRecoveryEffortPerMonth: number;
}

/**
 * EXECUTE 5-FUTURES MULTI-SCENARIO SIMULATION
 */
export function runMultiScenarioSimulation(
  decisionObject: DecisionIntelligenceObject
): MultiScenarioSimulationReport {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const baseAmount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const baseDownPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const baseDuration = Math.max(1, decisionObject.economics.loan_duration.value || 36);
  const baseInterestRate = Math.max(0, decisionObject.economics.interest_rate.value || 8.5);
  const baseRecurring = Math.max(0, decisionObject.economics.recurring_cost.value || 0);
  const baseRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);

  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const monthlyDebt = Math.max(0, decisionObject.context.monthly_debt_payments.value || 0);
  const goalAllocation = Math.max(50, decisionObject.context.primary_goal?.monthlyAllocation || 350);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (baseDownPayment > 0 && baseDownPayment < baseAmount);
  const isRecurringExpense =
    decisionObject.definition.decision_category === "MOVE_HOME" ||
    decisionObject.definition.decision_category === "SUBSCRIPTION_OR_SERVICE" ||
    decisionObject.definition.is_recurring?.value === true;

  // Helper to compute loan payment
  const computeMonthlyPayment = (principal: number, annualRate: number, months: number) => {
    if (principal <= 0) return 0;
    const r = annualRate / 100 / 12;
    if (r <= 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENARIO 1: BASE CASE (MOST LIKELY)
  // ─────────────────────────────────────────────────────────────────────────
  const principalBase = isLoan ? Math.max(0, baseAmount - baseDownPayment) : 0;
  const monthlyLoanPmtBase = isLoan ? computeMonthlyPayment(principalBase, baseInterestRate, baseDuration) : 0;
  const upfrontBase = isLoan || isRecurringExpense ? baseDownPayment : baseAmount;
  const endingCashBase = Math.max(0, liquidSavings - upfrontBase);
  const postExpensesBase = essentialExpenses + baseRecurring;
  const postDebtBase = monthlyDebt + monthlyLoanPmtBase;
  const fcfBase = Math.max(0, monthlyIncome + baseRevenue - postExpensesBase - postDebtBase);
  const runwayBase = postExpensesBase > 0 ? endingCashBase / postExpensesBase : 0;
  const delayDaysBase = isRecurringExpense ? 0 : Math.round((baseAmount / goalAllocation) * 30);
  const totalInterestBase = Math.max(0, monthlyLoanPmtBase * baseDuration - principalBase);
  const totalCostBase = isRecurringExpense ? baseDownPayment + baseRecurring * 12 : baseAmount + totalInterestBase;

  const baseCase: PlausibleScenarioResult = {
    code: "BASE_CASE",
    labelEn: "Base Case (Most Likely)",
    labelFr: "Scénario Central (Le Plus Probable)",
    labelEs: "Escenario Base (Más Probable)",
    narrativeDescriptionEn: "Standard execution based on verified baseline figures and stated terms.",
    narrativeDescriptionFr: "Exécution nominale basée sur vos chiffres de référence et les conditions déclarées.",
    narrativeDescriptionEs: "Ejecución nominal basada en sus datos de referencia y términos declarados.",
    totalCostOutcome: Math.round(totalCostBase),
    monthlyFreeCashFlow: Math.round(fcfBase),
    deltaFreeCashFlow: Math.round(fcfBase - (monthlyIncome - essentialExpenses - monthlyDebt)),
    endingLiquidCash: Math.round(endingCashBase),
    endingEmergencyRunwayMonths: Number(runwayBase.toFixed(1)),
    goalDelayDays: delayDaysBase,
    goalDelayMonths: Number((delayDaysBase / 30).toFixed(1)),
    mainAssumptionEn: `Stable income at ${fmt(monthlyIncome)} and fixed interest rate of ${baseInterestRate}%.`,
    mainAssumptionFr: `Revenus stables à ${fmt(monthlyIncome)} et taux d'intérêt fixe de ${baseInterestRate}%.`,
    mainAssumptionEs: `Ingresos estables en ${fmt(monthlyIncome)} y tasa de interés fija del ${baseInterestRate}%.`,
    mainRiskEn: "Minor unbudgeted accessories or maintenance costs.",
    mainRiskFr: "Légers surcoûts d'accessoires ou d'entretien imprévus.",
    mainRiskEs: "Pequeños sobrecostes de accesorios o mantenimiento no previstos.",
    recoverabilityEn: "Easily manageable within existing cash-flow margins.",
    recoverabilityFr: "Parfaitement absorbable avec vos marges de trésorerie actuelles.",
    recoverabilityEs: "Completamente manejable con sus márgenes actuales.",
    isSolvent: endingCashBase > 0 && runwayBase >= 1.0,
    solvencyStatus: runwayBase >= 3.0 ? "HEALTHY" : runwayBase >= 1.0 ? "TIGHT" : "INSOLVENT",
    recoveryEffortPerMonthRequired: Math.round(baseAmount / Math.max(1, baseDuration)),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENARIO 2: FAVORABLE CASE (BEST PLAUSIBLE)
  //  // ─────────────────────────────────────────────────────────────────────────
  // SCENARIO 2: FAVORABLE CASE (BEST PLAUSIBLE)
  // ─────────────────────────────────────────────────────────────────────────
  const incomeFav = monthlyIncome * 1.08;
  const costDiscountFav = baseAmount * 0.94; // 6% negotiated discount
  const rateFav = Math.max(2.0, baseInterestRate - 1.0);
  const revenueFav = baseRevenue * 1.2;
  const principalFav = isLoan ? Math.max(0, costDiscountFav - baseDownPayment) : 0;
  const monthlyLoanPmtFav = isLoan ? computeMonthlyPayment(principalFav, rateFav, baseDuration) : 0;
  const upfrontFav = isLoan || isRecurringExpense ? baseDownPayment : costDiscountFav;
  const endingCashFav = Math.max(0, liquidSavings - upfrontFav);
  const fcfFav = Math.max(0, incomeFav + revenueFav - postExpensesBase - (monthlyDebt + monthlyLoanPmtFav));
  const runwayFav = postExpensesBase > 0 ? endingCashFav / postExpensesBase : 0;
  const delayDaysFav = isRecurringExpense ? 0 : Math.round((costDiscountFav / goalAllocation) * 30 * 0.85);
  const totalCostFav = isRecurringExpense
    ? baseDownPayment + baseRecurring * 0.94 * 12
    : costDiscountFav + Math.max(0, monthlyLoanPmtFav * baseDuration - principalFav);

  const favorableCase: PlausibleScenarioResult = {
    code: "FAVORABLE_CASE",
    labelEn: "Favorable Case (Upside Plausible)",
    labelFr: "Scénario Favorable (Optimiste Réaliste)",
    labelEs: "Escenario Favorable (Optimista Realista)",
    narrativeDescriptionEn: "Slight income expansion, negotiated pricing discount, or favorable borrowing APR.",
    narrativeDescriptionFr: "Légère hausse des revenus, remise négociée ou taux d'emprunt avantageux.",
    narrativeDescriptionEs: "Ligero aumento de ingresos, descuento negociado o mejor tasa de financiación.",
    totalCostOutcome: Math.round(totalCostFav),
    monthlyFreeCashFlow: Math.round(fcfFav),
    deltaFreeCashFlow: Math.round(fcfFav - (monthlyIncome - essentialExpenses - monthlyDebt)),
    endingLiquidCash: Math.round(endingCashFav),
    endingEmergencyRunwayMonths: Number(runwayFav.toFixed(1)),
    goalDelayDays: delayDaysFav,
    goalDelayMonths: Number((delayDaysFav / 30).toFixed(1)),
    mainAssumptionEn: "6% purchase discount achieved and income expands by 8%.",
    mainAssumptionFr: "Remise de 6% obtenue et hausse des revenus de 8%.",
    mainAssumptionEs: "Descuento del 6% obtenido e ingresos aumentan un 8%.",
    mainRiskEn: "Relying on optimistic discounts that may not materialize.",
    mainRiskFr: "Trop compter sur des remises qui pourraient ne pas se concrétiser.",
    mainRiskEs: "Confiar en descuentos optimistas que podrían no concretarse.",
    recoverabilityEn: "Immediate capital recovery and accelerated goal pacing.",
    recoverabilityFr: "Rétablissement immédiat et accélération des objectifs.",
    recoverabilityEs: "Recuperación inmediata y aceleración de metas.",
    isSolvent: true,
    solvencyStatus: "HEALTHY",
    recoveryEffortPerMonthRequired: 0,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENARIO 3: CAUTIOUS CASE (SLIGHT DRAG)
  // ─────────────────────────────────────────────────────────────────────────
  const costCautious = baseAmount * 1.1; // 10% ancillary / taxes / accessories overrun
  const rateCautious = baseInterestRate + 1.0;
  const principalCautious = isLoan ? Math.max(0, costCautious - baseDownPayment) : 0;
  const monthlyLoanPmtCautious = isLoan ? computeMonthlyPayment(principalCautious, rateCautious, baseDuration) : 0;
  const upfrontCautious = isLoan || isRecurringExpense ? baseDownPayment : costCautious;
  const endingCashCautious = Math.max(0, liquidSavings - upfrontCautious);
  const postExpensesCautious = essentialExpenses + baseRecurring * 1.15;
  const fcfCautious = Math.max(0, monthlyIncome - postExpensesCautious - (monthlyDebt + monthlyLoanPmtCautious));
  const runwayCautious = postExpensesCautious > 0 ? endingCashCautious / postExpensesCautious : 0;
  const delayDaysCautious = isRecurringExpense ? 0 : Math.round((costCautious / goalAllocation) * 30);
  const totalCostCautious = isRecurringExpense
    ? baseDownPayment + baseRecurring * 1.15 * 12
    : costCautious + Math.max(0, monthlyLoanPmtCautious * baseDuration - principalCautious);

  const cautiousCase: PlausibleScenarioResult = {
    code: "CAUTIOUS_CASE",
    labelEn: "Cautious Case (Moderate Friction)",
    labelFr: "Scénario Prudent (Friction Modérée)",
    labelEs: "Escenario Prudente (Fricción Moderada)",
    narrativeDescriptionEn: "10% ancillary cost overrun, slight interest rate increase, or higher maintenance friction.",
    narrativeDescriptionFr: "Surcoût de 10% (accessoires/frais), taux relevé de 1% et entretien plus élevé.",
    narrativeDescriptionEs: "Sobrecoste del 10% (accesorios/tasas), interés +1% y mayor mantenimiento.",
    totalCostOutcome: Math.round(totalCostCautious),
    monthlyFreeCashFlow: Math.round(fcfCautious),
    deltaFreeCashFlow: Math.round(fcfCautious - (monthlyIncome - essentialExpenses - monthlyDebt)),
    endingLiquidCash: Math.round(endingCashCautious),
    endingEmergencyRunwayMonths: Number(runwayCautious.toFixed(1)),
    goalDelayDays: delayDaysCautious,
    goalDelayMonths: Number((delayDaysCautious / 30).toFixed(1)),
    mainAssumptionEn: "10% ancillary setup overrun and 15% higher recurring upkeep.",
    mainAssumptionFr: "Dépassement de 10% à l'achat et charges récurrentes supérieures de 15%.",
    mainAssumptionEs: "Desvío del 10% en la compra y gastos recurrentes un 15% superiores.",
    mainRiskEn: "Creeping expenses slowly eroding monthly surplus.",
    mainRiskFr: "Érosion insidieuse du surplus mensuel par des frais annexes.",
    mainRiskEs: "Erosión progresiva del excedente mensual por costes secundarios.",
    recoverabilityEn: "Requires 1-2 months of minor discretionary expense containment.",
    recoverabilityFr: "Nécessite 1 à 2 mois de modération sur les dépenses discrétionnaires.",
    recoverabilityEs: "Requiere 1-2 meses de contención en gastos discrecionales.",
    isSolvent: endingCashCautious > 0 && runwayCautious >= 1.0,
    solvencyStatus: runwayCautious >= 3.0 ? "HEALTHY" : runwayCautious >= 1.0 ? "TIGHT" : "INSOLVENT",
    recoveryEffortPerMonthRequired: Math.round((costCautious - baseAmount) / 6),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENARIO 4: ADVERSE CASE (DIFFICULT BUT PLAUSIBLE)
  // ─────────────────────────────────────────────────────────────────────────
  const incomeAdverse = monthlyIncome * 0.85; // 15% income dip
  const costAdverse = baseAmount * 1.15;
  const rateAdverse = baseInterestRate + 2.0;
  const principalAdverse = isLoan ? Math.max(0, costAdverse - baseDownPayment) : 0;
  const monthlyLoanPmtAdverse = isLoan ? computeMonthlyPayment(principalAdverse, rateAdverse, baseDuration) : 0;
  const upfrontAdverse = isLoan || isRecurringExpense ? baseDownPayment : costAdverse;
  const endingCashAdverse = Math.max(0, liquidSavings - upfrontAdverse);
  const postExpensesAdverse = essentialExpenses * 1.05 + baseRecurring * 1.25;
  const fcfAdverse = Math.max(0, incomeAdverse - postExpensesAdverse - (monthlyDebt + monthlyLoanPmtAdverse));
  const runwayAdverse = postExpensesAdverse > 0 ? endingCashAdverse / postExpensesAdverse : 0;
  const delayDaysAdverse = isRecurringExpense ? 0 : Math.round((costAdverse / Math.max(30, goalAllocation * 0.75)) * 30);
  const totalCostAdverse = isRecurringExpense
    ? baseDownPayment + baseRecurring * 1.25 * 12
    : costAdverse + Math.max(0, monthlyLoanPmtAdverse * baseDuration - principalAdverse);

  const adverseCase: PlausibleScenarioResult = {
    code: "ADVERSE_CASE",
    labelEn: "Adverse Case (Difficult But Plausible)",
    labelFr: "Scénario Défavorable (Éprouvant mais Plausible)",
    labelEs: "Escenario Desfavorable (Difícil pero Plausible)",
    narrativeDescriptionEn: "15% income temporary dip combined with 15% cost overrun and tighter cash flow.",
    narrativeDescriptionFr: "Baisse de 15% des revenus cumulée à 15% de surcoût et trésorerie tendue.",
    narrativeDescriptionEs: "Caída del 15% en ingresos junto a un 15% de sobrecoste y liquidez ajustada.",
    totalCostOutcome: Math.round(totalCostAdverse),
    monthlyFreeCashFlow: Math.round(fcfAdverse),
    deltaFreeCashFlow: Math.round(fcfAdverse - (monthlyIncome - essentialExpenses - monthlyDebt)),
    endingLiquidCash: Math.round(endingCashAdverse),
    endingEmergencyRunwayMonths: Number(runwayAdverse.toFixed(1)),
    goalDelayDays: delayDaysAdverse,
    goalDelayMonths: Number((delayDaysAdverse / 30).toFixed(1)),
    mainAssumptionEn: "Income dips by 15% for 6 months while setup costs overrun by 15%.",
    mainAssumptionFr: "Baisse de revenus de 15% pendant 6 mois et surcoût initial de 15%.",
    mainAssumptionEs: "Caída de ingresos del 15% durante 6 meses y sobrecoste inicial del 15%.",
    mainRiskEn: "Severely compressed emergency cushion and halted goal contributions.",
    mainRiskFr: "Compression sévère de la réserve d'urgence et gel temporaire des projets.",
    mainRiskEs: "Compresión severa del fondo de emergencia y pausa en objetivos.",
    recoverabilityEn: "Requires formal 6-month budget freeze and possible secondary income bridge.",
    recoverabilityFr: "Exige un gel budgétaire de 6 mois et un apport d'appoint temporaire.",
    recoverabilityEs: "Requiere contención presupuestaria de 6 meses o ingresos adicionales.",
    isSolvent: endingCashAdverse > 0 && runwayAdverse >= 1.0,
    solvencyStatus: runwayAdverse >= 2.5 ? "TIGHT" : runwayAdverse >= 1.0 ? "STRESSED" : "INSOLVENT",
    recoveryEffortPerMonthRequired: Math.round((baseAmount * 0.25) / 6),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCENARIO 5: SEVERE STRESS CASE (COMPOUNDED SHOCKS)
  // ─────────────────────────────────────────────────────────────────────────
  const incomeStress = monthlyIncome * 0.75; // 25% severe shock
  const costStress = baseAmount * 1.25;      // 25% inflation/fees overrun
  const rateStress = baseInterestRate + 3.5;
  const principalStress = isLoan ? Math.max(0, costStress - baseDownPayment) : 0;
  const monthlyLoanPmtStress = isLoan ? computeMonthlyPayment(principalStress, rateStress, baseDuration) : 0;
  const upfrontStress = isLoan || isRecurringExpense ? baseDownPayment : costStress;
  const endingCashStress = Math.max(0, liquidSavings - upfrontStress);
  const postExpensesStress = essentialExpenses * 1.1 + baseRecurring * 1.35;
  const fcfStress = Math.max(0, incomeStress - postExpensesStress - (monthlyDebt + monthlyLoanPmtStress));
  const runwayStress = postExpensesStress > 0 ? endingCashStress / postExpensesStress : 0;
  const delayDaysStress = isRecurringExpense ? 0 : Math.round((costStress / Math.max(25, goalAllocation * 0.5)) * 30);
  const totalCostStress = isRecurringExpense
    ? baseDownPayment + baseRecurring * 1.35 * 12
    : costStress + Math.max(0, monthlyLoanPmtStress * baseDuration - principalStress);

  const severeStressCase: PlausibleScenarioResult = {
    code: "SEVERE_STRESS_CASE",
    labelEn: "Severe Stress Case (Compounded Shocks)",
    labelFr: "Scénario de Stress Sévère (Chocs Cumulés)",
    labelEs: "Escenario de Estrés Severo (Choques Múltiples)",
    narrativeDescriptionEn: "Simultaneous 25% income contraction, 25% cost overrun, and 350 bps borrowing rate spike.",
    narrativeDescriptionFr: "Choc cumulé : -25% de revenus, +25% de surcoût d'achat et taux d'intérêt majoré de 3,5%.",
    narrativeDescriptionEs: "Choque combinado: -25% de ingresos, +25% de sobrecoste y tasa de interés +3,5%.",
    totalCostOutcome: Math.round(totalCostStress),
    monthlyFreeCashFlow: Math.round(fcfStress),
    deltaFreeCashFlow: Math.round(fcfStress - (monthlyIncome - essentialExpenses - monthlyDebt)),
    endingLiquidCash: Math.round(endingCashStress),
    endingEmergencyRunwayMonths: Number(runwayStress.toFixed(1)),
    goalDelayDays: delayDaysStress,
    goalDelayMonths: Number((delayDaysStress / 30).toFixed(1)),
    mainAssumptionEn: "Severe simultaneous economic downturn and equipment depreciation.",
    mainAssumptionFr: "Détérioration économique sévère simultanée et dépréciation accélérée.",
    mainAssumptionEs: "Deterioro económico severo simultáneo y depreciación acelerada.",
    mainRiskEn: "Liquidity exhaustion and debt default if emergency runway breaches 0.",
    mainRiskFr: "Épuisement total des liquidités et impayé si l'autonomie tombe à 0.",
    mainRiskEs: "Agotamiento de liquidez e impago si la autonomía cae a 0.",
    recoverabilityEn: "Demands immediate asset liquidation or emergency credit line deployment.",
    recoverabilityFr: "Exige la revente de l'actif ou le recours à une ligne de secours.",
    recoverabilityEs: "Exige venta rápida del activo o activación de línea de emergencia.",
    isSolvent: endingCashStress > 0 && runwayStress >= 0.8,
    solvencyStatus: runwayStress >= 1.5 ? "STRESSED" : "INSOLVENT",
    recoveryEffortPerMonthRequired: Math.round((baseAmount * 0.4) / 6),
  };

  const scenarios: Record<PlausibleFutureCode, PlausibleScenarioResult> = {
    BASE_CASE: baseCase,
    FAVORABLE_CASE: favorableCase,
    CAUTIOUS_CASE: cautiousCase,
    ADVERSE_CASE: adverseCase,
    SEVERE_STRESS_CASE: severeStressCase,
  };

  const orderedScenarios = [baseCase, favorableCase, cautiousCase, adverseCase, severeStressCase];

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    scenarios,
    orderedScenarios,
    comparativeSummary: {
      bestPlausibleOutcomeSummaryEn: `Best plausible outcome: Total net cost of ${fmt(totalCostFav)} with ${runwayFav.toFixed(1)} months reserve cushion.`,
      bestPlausibleOutcomeSummaryFr: `Meilleur scénario plausible : Coût net de ${fmt(totalCostFav)} et ${runwayFav.toFixed(1)} mois de matelas.`,
      bestPlausibleOutcomeSummaryEs: `Mejor escenario plausible: Coste neto de ${fmt(totalCostFav)} y ${runwayFav.toFixed(1)} meses de reserva.`,
      mostLikelyOutcomeSummaryEn: `Most likely outcome: Total cost of ${fmt(totalCostBase)}, retaining ${runwayBase.toFixed(1)} months runway.`,
      mostLikelyOutcomeSummaryFr: `Scénario le plus probable : Coût total de ${fmt(totalCostBase)}, conservant ${runwayBase.toFixed(1)} mois d'autonomie.`,
      mostLikelyOutcomeSummaryEs: `Escenario más probable: Coste total de ${fmt(totalCostBase)}, manteniendo ${runwayBase.toFixed(1)} meses de autonomía.`,
      difficultPlausibleOutcomeSummaryEn: `Difficult plausible outcome: Free cash flow drops to ${fmt(fcfAdverse)}/mo with ${runwayAdverse.toFixed(1)} months runway.`,
      difficultPlausibleOutcomeSummaryFr: `Scénario difficile plausible : Le cash-flow libre tombe à ${fmt(fcfAdverse)}/mois avec ${runwayAdverse.toFixed(1)} mois de réserve.`,
      difficultPlausibleOutcomeSummaryEs: `Escenario difícil plausible: El flujo de caja cae a ${fmt(fcfAdverse)}/mes con ${runwayAdverse.toFixed(1)} meses de reserva.`,
      multipleCompoundedShocksSummaryEn: `Severe stress outcome: Leaves ${fmt(endingCashStress)} cash (${runwayStress.toFixed(1)} mo runway). ${severeStressCase.isSolvent ? "Solvency holds." : "Insolvency risk triggered."}`,
      multipleCompoundedShocksSummaryFr: `Stress sévère : Laisse ${fmt(endingCashStress)} de trésorerie (${runwayStress.toFixed(1)} mois). ${severeStressCase.isSolvent ? "Solvabilité préservée." : "Rupture de trésorerie."}`,
      multipleCompoundedShocksSummaryEs: `Estrés severo: Deja ${fmt(endingCashStress)} en efectivo (${runwayStress.toFixed(1)} meses). ${severeStressCase.isSolvent ? "Solvabilidad preservada." : "Ruptura de tesorería."}`,
    },
    downsideSurvivalThresholdMonths: Number(runwayStress.toFixed(1)),
    maximumRecoveryEffortPerMonth: severeStressCase.recoveryEffortPerMonthRequired,
  };
}
