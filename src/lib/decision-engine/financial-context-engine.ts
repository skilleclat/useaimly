/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * STEP 3: FINANCIAL CONTEXT ENGINE (PROMPT 5)
 *
 * Evaluates decisions relative to full financial reality:
 * - Savings Exposure (% of liquid reserves consumed)
 * - Income Exposure (% of monthly inflow)
 * - Liquidity Remaining & Emergency Capacity (ability to absorb shocks)
 * - Monthly Cash-Flow Pressure (FCF burn rate)
 * - Debt Pressure (DTI ratio shifts)
 * - Multi-dimensional Context Confidence (HIGH / MEDIUM / LOW)
 *
 * Rejects simplistic one-variable rules (e.g. "< 1 month income = safe").
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export type ContextConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ContextualMetrics {
  // 1. Savings Exposure
  savingsExposurePercent: number;
  savingsExposureRating: "NEGLIGIBLE" | "MODERATE" | "HIGH" | "CRITICAL" | "INSOLVENT";

  // 2. Income Exposure
  incomeExposurePercent: number;
  incomeExposureRating: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

  // 3. Liquidity Remaining
  liquidityRemainingAmount: number;
  postDecisionRunwayMonths: number;
  runwayMonthsLost: number;

  // 4. Emergency Capacity
  baselineEmergencyCapacityScore: number; // 0 to 100
  postDecisionEmergencyCapacityScore: number; // 0 to 100
  canAbsorbShock1000: boolean;
  canAbsorbShock3000: boolean;
  emergencyCapacityStatus: "ROBUST" | "ACCEPTABLE" | "FRAGILE" | "COMPROMISED";

  // 5. Monthly Cash-Flow Pressure
  baselineFreeCashFlow: number;
  postDecisionFreeCashFlow: number;
  freeCashFlowBurnPercent: number;
  monthlyCashFlowPressureRating: "NONE" | "LOW" | "MODERATE" | "SEVERE" | "DEFICIT";

  // 6. Debt Pressure
  baselineDebtToIncomeRatio: number;
  postDecisionDebtToIncomeRatio: number;
  debtStressLevel: "HEALTHY" | "ELEVATED" | "DISTRESSED";

  // 7. Overall Contextual Recommendation Impact
  contextRiskProfile: "RESILIENT" | "MODERATE_FRICTION" | "HIGH_VULNERABILITY" | "DANGEROUS";
  contextualVerdictAdviceEn: string;
  contextualVerdictAdviceFr: string;
  contextualVerdictAdviceEs: string;
}

export interface ContextConfidenceScore {
  level: ContextConfidenceLevel;
  score: number; // 0 to 100
  knownVariables: string[];
  estimatedVariables: string[];
  missingVariables: string[];
  explanationEn: string;
  explanationFr: string;
  explanationEs: string;
}

export interface FinancialContextEvaluation {
  confidence: ContextConfidenceScore;
  metrics: ContextualMetrics;
  narrativeInsights: {
    titleEn: string;
    titleFr: string;
    titleEs: string;
    bodyEn: string;
    bodyFr: string;
    bodyEs: string;
    severity: "POSITIVE" | "NEUTRAL" | "CAUTION" | "DANGER";
  }[];
}

/**
 * EVALUATE MULTIDIMENSIONAL FINANCIAL CONTEXT
 */
export function evaluateFinancialContext(
  decisionObject: DecisionIntelligenceObject
): FinancialContextEvaluation {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = decisionObject.definition.financial_amount.value || 0;
  const downPayment = decisionObject.economics.down_payment.value || 0;
  const recurringCost = decisionObject.economics.recurring_cost.value || 0;
  const upfrontOutflow = downPayment > 0 ? downPayment : amount;

  const liquidSavings = decisionObject.context.liquid_savings.value || 0;
  const monthlyIncome = decisionObject.context.monthly_income.value || 0;
  const essentialExpenses = decisionObject.context.essential_expenses.value || 0;
  const monthlyDebt = decisionObject.context.monthly_debt_payments.value || 0;
  const incomeStability = decisionObject.context.income_stability.value;

  // ─────────────────────────────────────────────────────────────────────────
  // A. CONTEXT CONFIDENCE CALCULATION
  // ─────────────────────────────────────────────────────────────────────────
  const knownVariables: string[] = [];
  const estimatedVariables: string[] = [];
  const missingVariables: string[] = [];

  // Check critical context variables
  if (decisionObject.context.liquid_savings.classification === "VERIFIED_FACT" || decisionObject.context.liquid_savings.classification === "USER_PROVIDED") {
    knownVariables.push("Liquid Savings Balance");
  } else if (decisionObject.context.liquid_savings.isEstimate) {
    estimatedVariables.push("Liquid Savings Balance");
  } else {
    missingVariables.push("Liquid Savings Balance");
  }

  if (decisionObject.context.monthly_income.classification === "VERIFIED_FACT" || decisionObject.context.monthly_income.classification === "USER_PROVIDED") {
    knownVariables.push("Monthly Net Income");
  } else if (decisionObject.context.monthly_income.isEstimate) {
    estimatedVariables.push("Monthly Net Income");
  } else {
    missingVariables.push("Monthly Net Income");
  }

  if (decisionObject.context.essential_expenses.classification === "VERIFIED_FACT" || decisionObject.context.essential_expenses.classification === "USER_PROVIDED") {
    knownVariables.push("Essential Living Expenses");
  } else if (decisionObject.context.essential_expenses.isEstimate) {
    estimatedVariables.push("Essential Living Expenses");
  } else {
    missingVariables.push("Essential Living Expenses");
  }

  if (decisionObject.context.monthly_debt_payments.classification === "VERIFIED_FACT" || decisionObject.context.monthly_debt_payments.classification === "USER_PROVIDED") {
    knownVariables.push("Existing Debt Obligations");
  } else {
    missingVariables.push("Existing Debt Obligations");
  }

  let confidenceScore = Math.round(
    (knownVariables.length * 25 + estimatedVariables.length * 12) /
      Math.max(1, (knownVariables.length + estimatedVariables.length + missingVariables.length) * 25) *
      100
  );

  let confidenceLevel: ContextConfidenceLevel = "HIGH";
  if (confidenceScore < 50 || missingVariables.includes("Liquid Savings Balance") || missingVariables.includes("Monthly Net Income")) {
    confidenceLevel = "LOW";
  } else if (confidenceScore < 80 || estimatedVariables.length >= 2) {
    confidenceLevel = "MEDIUM";
  }

  const confidenceExplanationEn =
    confidenceLevel === "HIGH"
      ? `High Context Grounding (${confidenceScore}%): verified liquid reserves, regular income, and essential outflows.`
      : confidenceLevel === "MEDIUM"
      ? `Moderate Context Grounding (${confidenceScore}%): some financial variables are estimated; recommendation reflects wider scenario spreads.`
      : `Low Context Grounding (${confidenceScore}%): critical baseline data missing; results must be treated as indicative estimates.`;

  const confidenceExplanationFr =
    confidenceLevel === "HIGH"
      ? `Contexte Hautement Fiabilisé (${confidenceScore}%) : liquidités, revenus et charges de base confirmés.`
      : confidenceLevel === "MEDIUM"
      ? `Contexte Modérément Fiabilisé (${confidenceScore}%) : certaines variables sont estimées ; l'analyse intègre une marge de prudence.`
      : `Faible Fiabilité Contextuelle (${confidenceScore}%) : données de base manquantes ; résultats à titre purement indicatif.`;

  const confidenceExplanationEs =
    confidenceLevel === "HIGH"
      ? `Contexto Altamente Verificado (${confidenceScore}%): ahorros líquidos, ingresos y gastos esenciales confirmados.`
      : confidenceLevel === "MEDIUM"
      ? `Contexto Moderadamente Verificado (${confidenceScore}%): algunas variables son estimadas; la recomendación aplica prudencia.`
      : `Baja Fiabilidad Contextual (${confidenceScore}%): datos de base incompletos; los resultados son estimaciones preliminares.`;

  // ─────────────────────────────────────────────────────────────────────────
  // B. SAVINGS EXPOSURE & LIQUIDITY REMAINING
  // ─────────────────────────────────────────────────────────────────────────
  const savingsExposurePercent = liquidSavings > 0 ? Math.min(100, Math.round((upfrontOutflow / liquidSavings) * 100)) : 100;
  let savingsExposureRating: ContextualMetrics["savingsExposureRating"] = "NEGLIGIBLE";
  if (upfrontOutflow > liquidSavings) savingsExposureRating = "INSOLVENT";
  else if (savingsExposurePercent >= 75) savingsExposureRating = "CRITICAL";
  else if (savingsExposurePercent >= 40) savingsExposureRating = "HIGH";
  else if (savingsExposurePercent >= 15) savingsExposureRating = "MODERATE";

  const liquidityRemainingAmount = Math.max(0, liquidSavings - upfrontOutflow);
  const baselineRunwayMonths = essentialExpenses > 0 ? liquidSavings / essentialExpenses : 6;
  const postDecisionRunwayMonths = essentialExpenses > 0 ? liquidityRemainingAmount / essentialExpenses : 0;
  const runwayMonthsLost = Math.max(0, baselineRunwayMonths - postDecisionRunwayMonths);

  // ─────────────────────────────────────────────────────────────────────────
  // C. INCOME EXPOSURE & MONTHLY PRESSURE
  // ─────────────────────────────────────────────────────────────────────────
  const incomeExposurePercent = monthlyIncome > 0 ? Math.round((amount / monthlyIncome) * 100) : 100;
  let incomeExposureRating: ContextualMetrics["incomeExposureRating"] = "LOW";
  if (incomeExposurePercent >= 200) incomeExposureRating = "VERY_HIGH";
  else if (incomeExposurePercent >= 80) incomeExposureRating = "HIGH";
  else if (incomeExposurePercent >= 30) incomeExposureRating = "MODERATE";

  const baselineFreeCashFlow = Math.max(0, monthlyIncome - essentialExpenses - monthlyDebt);
  const newMonthlyCommitment = recurringCost > 0 ? recurringCost : 0;
  const postDecisionFreeCashFlow = Math.max(0, monthlyIncome - essentialExpenses - monthlyDebt - newMonthlyCommitment);
  const deltaFreeCashFlow = postDecisionFreeCashFlow - baselineFreeCashFlow;
  const freeCashFlowBurnPercent = baselineFreeCashFlow > 0 ? Math.round((Math.abs(deltaFreeCashFlow) / baselineFreeCashFlow) * 100) : 0;

  let monthlyCashFlowPressureRating: ContextualMetrics["monthlyCashFlowPressureRating"] = "NONE";
  if (postDecisionFreeCashFlow <= 0 && baselineFreeCashFlow > 0) monthlyCashFlowPressureRating = "DEFICIT";
  else if (freeCashFlowBurnPercent >= 50) monthlyCashFlowPressureRating = "SEVERE";
  else if (freeCashFlowBurnPercent >= 20) monthlyCashFlowPressureRating = "MODERATE";
  else if (freeCashFlowBurnPercent > 0) monthlyCashFlowPressureRating = "LOW";

  // ─────────────────────────────────────────────────────────────────────────
  // D. EMERGENCY CAPACITY
  // ─────────────────────────────────────────────────────────────────────────
  const baselineEmergencyCapacityScore = Math.min(100, Math.round((baselineRunwayMonths / 6) * 100));
  const postDecisionEmergencyCapacityScore = Math.min(100, Math.round((postDecisionRunwayMonths / 6) * 100));
  const canAbsorbShock1000 = liquidityRemainingAmount >= 1000;
  const canAbsorbShock3000 = liquidityRemainingAmount >= 3000;

  let emergencyCapacityStatus: ContextualMetrics["emergencyCapacityStatus"] = "ROBUST";
  if (postDecisionRunwayMonths < 1.0) emergencyCapacityStatus = "COMPROMISED";
  else if (postDecisionRunwayMonths < 3.0) emergencyCapacityStatus = "FRAGILE";
  else if (postDecisionRunwayMonths < 4.5) emergencyCapacityStatus = "ACCEPTABLE";

  // ─────────────────────────────────────────────────────────────────────────
  // E. DEBT PRESSURE (DTI)
  // ─────────────────────────────────────────────────────────────────────────
  const baselineDebtToIncomeRatio = monthlyIncome > 0 ? Math.round((monthlyDebt / monthlyIncome) * 100) : 0;
  const postDecisionDebtToIncomeRatio = monthlyIncome > 0 ? Math.round(((monthlyDebt + newMonthlyCommitment) / monthlyIncome) * 100) : 0;
  let debtStressLevel: ContextualMetrics["debtStressLevel"] = "HEALTHY";
  if (postDecisionDebtToIncomeRatio >= 45) debtStressLevel = "DISTRESSED";
  else if (postDecisionDebtToIncomeRatio >= 30) debtStressLevel = "ELEVATED";

  // ─────────────────────────────────────────────────────────────────────────
  // F. OVERALL CONTEXTUAL RISK PROFILE & VERDICT ADVICE
  // ─────────────────────────────────────────────────────────────────────────
  let contextRiskProfile: ContextualMetrics["contextRiskProfile"] = "RESILIENT";
  if (savingsExposureRating === "INSOLVENT" || emergencyCapacityStatus === "COMPROMISED") {
    contextRiskProfile = "DANGEROUS";
  } else if (savingsExposureRating === "CRITICAL" || emergencyCapacityStatus === "FRAGILE" || debtStressLevel === "DISTRESSED") {
    contextRiskProfile = "HIGH_VULNERABILITY";
  } else if (savingsExposureRating === "HIGH" || incomeExposureRating === "HIGH" || incomeStability === "VARIABLE") {
    contextRiskProfile = "MODERATE_FRICTION";
  }

  const contextualVerdictAdviceEn =
    contextRiskProfile === "DANGEROUS"
      ? "Decision depletes critical safety reserves below survival thresholds. Requires downscaling or delaying until reserves are rebuilt."
      : contextRiskProfile === "HIGH_VULNERABILITY"
      ? "Leaves tight liquidity buffers. Recommended to execute with strict installment pacing or retain a minimum emergency cushion."
      : contextRiskProfile === "MODERATE_FRICTION"
      ? "Financially absorbable with disciplined cash management. Noticeable reduction in monthly surplus."
      : "High contextual resilience. Decision easily absorbed by existing liquid buffer and steady cash flow.";

  const contextualVerdictAdviceFr =
    contextRiskProfile === "DANGEROUS"
      ? "Cette décision entame votre trésorerie sous le seuil d'urgence critique. Nécessite un report ou une réduction du montant."
      : contextRiskProfile === "HIGH_VULNERABILITY"
      ? "Laisse un matelas de sécurité très tendu. Privilégier un étalement prudent ou conserver une réserve incompressible."
      : contextRiskProfile === "MODERATE_FRICTION"
      ? "Financièrement soutenable avec une gestion rigoureuse. Ralentit temporairement l'accumulation de surplus."
      : "Excellente résilience contextuelle. La décision est parfaitement absorbée par votre épargne et vos revenus.";

  const contextualVerdictAdviceEs =
    contextRiskProfile === "DANGEROUS"
      ? "La decisión reduce la reserva líquida por debajo del umbral de supervivencia. Requiere aplazamiento o reducción del importe."
      : contextRiskProfile === "HIGH_VULNERABILITY"
      ? "Deja un margen de seguridad ajustado. Se recomienda fraccionamiento prudente o mantener una reserva mínima."
      : contextRiskProfile === "MODERATE_FRICTION"
      ? "Financieramente asumible con disciplina. Ralentiza temporalmente la generación de excedente mensual."
      : "Excelente resiliencia contextual. Decisión fácilmente absorbida por los ahorros líquidos y el flujo de caja.";

  // ─────────────────────────────────────────────────────────────────────────
  // G. NARRATIVE CONTEXT INSIGHTS
  // ─────────────────────────────────────────────────────────────────────────
  const narrativeInsights: FinancialContextEvaluation["narrativeInsights"] = [];

  // Insight 1: Savings exposure
  narrativeInsights.push({
    titleEn: `Savings Exposure: ${savingsExposurePercent}% Consumed`,
    titleFr: `Exposition de l'Épargne : ${savingsExposurePercent}% Consommé`,
    titleEs: `Exposición del Ahorro: ${savingsExposurePercent}% Consumido`,
    bodyEn: `Consumes ${fmt(upfrontOutflow)} of your ${fmt(liquidSavings)} liquid reserves, leaving ${fmt(liquidityRemainingAmount)} (${postDecisionRunwayMonths.toFixed(1)} months runway).`,
    bodyFr: `Consomme ${fmt(upfrontOutflow)} sur vos ${fmt(liquidSavings)} d'épargne disponible, laissant ${fmt(liquidityRemainingAmount)} (${postDecisionRunwayMonths.toFixed(1)} mois de subsistance).`,
    bodyEs: `Consume ${fmt(upfrontOutflow)} de sus ${fmt(liquidSavings)} de reserva líquida, dejando ${fmt(liquidityRemainingAmount)} (${postDecisionRunwayMonths.toFixed(1)} meses de autonomía).`,
    severity: savingsExposurePercent >= 60 ? "DANGER" : savingsExposurePercent >= 35 ? "CAUTION" : "POSITIVE",
  });

  // Insight 2: Income context
  narrativeInsights.push({
    titleEn: `Income Proportion: ${incomeExposurePercent}% of Monthly Earnings`,
    titleFr: `Poids sur les Revenus : ${incomeExposurePercent}% du Salaire Mensuel`,
    titleEs: `Proporción sobre Ingresos: ${incomeExposurePercent}% del Ingreso Mensual`,
    bodyEn: `The total expenditure represents ${incomeExposurePercent}% of monthly net income with ${incomeStability.toLowerCase()} cash flow stability.`,
    bodyFr: `La dépense totale équivaut à ${incomeExposurePercent}% de votre revenu net mensuel avec un profil de régularité ${incomeStability.toLowerCase()}.`,
    bodyEs: `El gasto total equivale al ${incomeExposurePercent}% de sus ingresos netos mensuales con estabilidad ${incomeStability.toLowerCase()}.`,
    severity: incomeExposurePercent >= 100 ? "CAUTION" : "NEUTRAL",
  });

  return {
    confidence: {
      level: confidenceLevel,
      score: confidenceScore,
      knownVariables,
      estimatedVariables,
      missingVariables,
      explanationEn: confidenceExplanationEn,
      explanationFr: confidenceExplanationFr,
      explanationEs: confidenceExplanationEs,
    },
    metrics: {
      savingsExposurePercent,
      savingsExposureRating,
      incomeExposurePercent,
      incomeExposureRating,
      liquidityRemainingAmount,
      postDecisionRunwayMonths,
      runwayMonthsLost,
      baselineEmergencyCapacityScore,
      postDecisionEmergencyCapacityScore,
      canAbsorbShock1000,
      canAbsorbShock3000,
      emergencyCapacityStatus,
      baselineFreeCashFlow,
      postDecisionFreeCashFlow,
      freeCashFlowBurnPercent,
      monthlyCashFlowPressureRating,
      baselineDebtToIncomeRatio,
      postDecisionDebtToIncomeRatio,
      debtStressLevel,
      contextRiskProfile,
      contextualVerdictAdviceEn,
      contextualVerdictAdviceFr,
      contextualVerdictAdviceEs,
    },
    narrativeInsights,
  };
}
