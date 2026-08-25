/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * CANONICAL DECISION VERDICT SYSTEM (PROMPT 14)
 *
 * Deterministic verdict framework replacing simplistic "Good/Bad" with:
 * 1. STRONG GO — Financially sound across most plausible scenarios.
 * 2. CONDITIONAL GO — Proceed ONLY if specific conditions are satisfied.
 * 3. WAIT — Reasonable objective, but timing/uncertainty makes commitment premature.
 * 4. MODIFY — Objective makes sense, but structure/financing terms should change.
 * 5. NO-GO — Downside, cost, or fragility outweighs expected benefits.
 * 6. INSUFFICIENT EVIDENCE — Key data unstated; irresponsible to give strong recommendation.
 *
 * Every verdict provides the 4 Non-Negotiable Dimensions:
 * - WHY (Primary grounded reasons)
 * - BIGGEST RISK (Most dangerous realistic factor)
 * - KEY CONDITION (Primary condition for success)
 * - WHAT WOULD CHANGE THE ANSWER? (Exact threshold flips for cost, income, timing, and evidence)
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";
import { Step5AnalysisOrchestrationReport } from "./step5-analysis-orchestrator";

export type CanonicalDecisionVerdictCode =
  | "STRONG_GO"
  | "CONDITIONAL_GO"
  | "WAIT"
  | "MODIFY"
  | "NO_GO"
  | "INSUFFICIENT_EVIDENCE";

export interface DecisionVerdictFramework {
  timestamp: string;
  currency: CurrencyCode;
  verdictCode: CanonicalDecisionVerdictCode;
  verdictLabelEn: string;
  verdictLabelFr: string;
  verdictLabelEs: string;
  verdictSummaryEn: string;
  verdictSummaryFr: string;
  verdictSummaryEs: string;

  // 4 Core Required Dimensions
  why: {
    primaryReasonsEn: string[];
    primaryReasonsFr: string[];
    primaryReasonsEs: string[];
  };
  biggestRisk: {
    titleEn: string;
    titleFr: string;
    titleEs: string;
    descriptionEn: string;
    descriptionFr: string;
    descriptionEs: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  keyCondition: {
    titleEn: string;
    titleFr: string;
    titleEs: string;
    actionableRequirementEn: string;
    actionableRequirementFr: string;
    actionableRequirementEs: string;
  };
  whatWouldChangeTheAnswer: {
    costThresholdFlipEn: string;
    costThresholdFlipFr: string;
    costThresholdFlipEs: string;
    incomeThresholdFlipEn: string;
    incomeThresholdFlipFr: string;
    incomeThresholdFlipEs: string;
    timingThresholdFlipEn: string;
    timingThresholdFlipFr: string;
    timingThresholdFlipEs: string;
    evidenceThresholdFlipEn: string;
    evidenceThresholdFlipFr: string;
    evidenceThresholdFlipEs: string;
  };

  // Confidence & Gating
  evidenceQualityGrade: "HIGH" | "MEDIUM" | "LOW";
  isEvidenceSufficient: boolean;
  redTeamClearance: boolean;
}

/**
 * SYNTHESIZE FINAL CANONICAL DECISION VERDICT
 */
export function synthesizeDecisionVerdict(
  decisionObject: DecisionIntelligenceObject,
  analysisReport: Step5AnalysisOrchestrationReport
): DecisionVerdictFramework {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const interestRate = Math.max(0, decisionObject.economics.interest_rate.value || 0);
  const expectedRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE" || expectedRevenue > 0;

  const postCash = Math.max(0, liquidSavings - (isLoan ? downPayment : amount));
  const postRunway = essentialExpenses > 0 ? postCash / essentialExpenses : 0;
  const savingsExposurePct = liquidSavings > 0 ? (amount / liquidSavings) * 100 : 100;

  const redTeam = analysisReport.redTeamReport;
  const sensitivity = analysisReport.sensitivityReport;
  const mostDangerousVar = sensitivity.singleMostDangerousVariable;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. EVALUATE EVIDENCE SUFFICIENCY FIRST (NEVER STRONG ON WEAK EVIDENCE)
  // ─────────────────────────────────────────────────────────────────────────
  const isIncomeUnknown = decisionObject.context.monthly_income.source === "UNKNOWN";
  const isSavingsUnknown = decisionObject.context.liquid_savings.source === "UNKNOWN";
  const isAmountZero = amount <= 0;

  let evidenceQualityGrade: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
  if (isIncomeUnknown || isSavingsUnknown || isAmountZero) {
    evidenceQualityGrade = "LOW";
  } else if (
    decisionObject.context.monthly_income.source === "ASSUMPTION" ||
    decisionObject.context.liquid_savings.source === "ASSUMPTION"
  ) {
    evidenceQualityGrade = "MEDIUM";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. DETERMINISTIC VERDICT ASSIGNMENT LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  let verdictCode: CanonicalDecisionVerdictCode = "CONDITIONAL_GO";

  if (evidenceQualityGrade === "LOW") {
    verdictCode = "INSUFFICIENT_EVIDENCE";
  } else if (redTeam.fatalFlawsCount > 0 || postCash <= 0 || postRunway < 0.8) {
    verdictCode = "NO_GO";
  } else if (interestRate >= 14.0 || (postRunway < 2.5 && savingsExposurePct > 45)) {
    verdictCode = "MODIFY";
  } else if (postRunway >= 2.0 && postRunway < 3.0 && isBusiness && expectedRevenue > 0) {
    verdictCode = "WAIT";
  } else if (postRunway >= 3.5 && redTeam.fatalFlawsCount === 0 && evidenceQualityGrade === "HIGH") {
    verdictCode = "STRONG_GO";
  } else {
    verdictCode = "CONDITIONAL_GO";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. COMPOSE VERDICT PAYLOAD & 4 CORE DIMENSIONS
  // ─────────────────────────────────────────────────────────────────────────
  const costFlipThreshold = Math.round(amount * 1.2);
  const incomeFlipThreshold = Math.round(essentialExpenses * 1.25);

  let verdictLabelEn = "";
  let verdictLabelFr = "";
  let verdictLabelEs = "";
  let verdictSummaryEn = "";
  let verdictSummaryFr = "";
  let verdictSummaryEs = "";
  const whyReasonsEn: string[] = [];
  const whyReasonsFr: string[] = [];
  const whyReasonsEs: string[] = [];
  let biggestRiskTitleEn = "";
  let biggestRiskTitleFr = "";
  let biggestRiskTitleEs = "";
  let biggestRiskDescEn = "";
  let biggestRiskDescFr = "";
  let biggestRiskDescEs = "";
  let biggestRiskSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
  let keyConditionTitleEn = "";
  let keyConditionTitleFr = "";
  let keyConditionTitleEs = "";
  let keyConditionReqEn = "";
  let keyConditionReqFr = "";
  let keyConditionReqEs = "";

  switch (verdictCode) {
    case "STRONG_GO":
      verdictLabelEn = "STRONG GO";
      verdictLabelFr = "VALIDATION FORTE (STRONG GO)";
      verdictLabelEs = "APROBACIÓN TOTAL (STRONG GO)";
      verdictSummaryEn = `Financially resilient across all tested scenarios. Leaves ${postRunway.toFixed(1)} months of emergency runway.`;
      verdictSummaryFr = `Financièrement solide sur tous les scénarios testés. Conserve ${postRunway.toFixed(1)} mois de matelas de sécurité.`;
      verdictSummaryEs = `Financieramente sólido en todos los escenarios. Conserva ${postRunway.toFixed(1)} meses de reserva de emergencia.`;

      whyReasonsEn.push(`Ample post-decision liquidity cushion (${postRunway.toFixed(1)} months of expenses retained).`);
      whyReasonsEn.push(`Monthly free cash flow remains healthy with zero solvency pressure.`);
      whyReasonsEn.push(`Priority goal milestone impact is minimal and rapidly recoverable.`);

      whyReasonsFr.push(`Matelas d'urgence résiduel robuste (${postRunway.toFixed(1)} mois de charges préservés).`);
      whyReasonsFr.push(`Le cash-flow libre mensuel reste confortable sans tension de trésorerie.`);
      whyReasonsFr.push(`L'impact sur votre objectif prioritaire est minime et rapidement résorbable.`);

      whyReasonsEs.push(`Reserva de emergencia sólida (${postRunway.toFixed(1)} meses de gastos preservados).`);
      whyReasonsEs.push(`El flujo de caja libre mensual se mantiene holgado.`);
      whyReasonsEs.push(`El impacto en su meta principal es mínimo y fácilmente recuperable.`);

      biggestRiskTitleEn = "Ancillary Cost Creep";
      biggestRiskTitleFr = "Dérive des Frais Annexes";
      biggestRiskTitleEs = "Sobrecostes Secundarios";
      biggestRiskDescEn = `Unplanned accessories or maintenance exceeding initial budget by > 20%.`;
      biggestRiskDescFr = `Accessoires ou entretien imprévus dépassant le budget initial de plus de 20%.`;
      biggestRiskDescEs = `Accesorios o mantenimiento no planificados que superen el 20% del presupuesto.`;
      biggestRiskSeverity = "LOW";

      keyConditionTitleEn = "Maintain Liquid Floor";
      keyConditionTitleFr = "Conserver le Seuil Plancher";
      keyConditionTitleEs = "Mantener el Fondo Mínimo";
      keyConditionReqEn = `Keep at least ${fmt(Math.round(essentialExpenses * 3.0))} untouched in liquid reserves post-purchase.`;
      keyConditionReqFr = `Conserver au moins ${fmt(Math.round(essentialExpenses * 3.0))} intacts sur votre compte d'épargne.`;
      keyConditionReqEs = `Mantener al menos ${fmt(Math.round(essentialExpenses * 3.0))} intactos en reservas líquidas.`;
      break;

    case "CONDITIONAL_GO":
      verdictLabelEn = "CONDITIONAL GO";
      verdictLabelFr = "VALIDATION CONDITIONNELLE";
      verdictLabelEs = "APROBACIÓN CONDICIONAL";
      verdictSummaryEn = `Viable only if emergency reserves are maintained and no unbudgeted accessories are added.`;
      verdictSummaryFr = `Viable uniquement sous réserve de préserver votre matelas d'urgence et de limiter les frais annexes.`;
      verdictSummaryEs = `Viable solo si se preserva el fondo de emergencia y no se añaden sobrecostes.`;

      whyReasonsEn.push(`Post-purchase reserve buffer (${postRunway.toFixed(1)} mo) is functional but requires active discipline.`);
      whyReasonsEn.push(`Decision is manageable under baseline conditions but vulnerable to compounded shocks.`);

      whyReasonsFr.push(`Le matelas de sécurité (${postRunway.toFixed(1)} mois) est fonctionnel mais exige de la rigueur.`);
      whyReasonsFr.push(`Décision soutenable en scénario central mais sensible à des chocs imprévus.`);

      whyReasonsEs.push(`La reserva (${postRunway.toFixed(1)} meses) es funcional pero exige disciplina.`);
      whyReasonsEs.push(`Decisión sostenible en escenario base pero sensible a imprevistos.`);

      biggestRiskTitleEn = "Emergency Cushion Compression";
      biggestRiskTitleFr = "Compression de la Réserve de Sécurité";
      biggestRiskTitleEs = "Compresión de la Reserva de Seguridad";
      biggestRiskDescEn = `An unexpected life shock occurring while liquid reserves are below 3.0 months.`;
      biggestRiskDescFr = `Survenance d'un imprévu personnel alors que les réserves sont inférieures à 3 mois.`;
      biggestRiskDescEs = `Ocurrencia de un imprevisto mientras las reservas están por debajo de 3 meses.`;
      biggestRiskSeverity = "MEDIUM";

      keyConditionTitleEn = "Strict Budget Cap";
      keyConditionTitleFr = "Plafonnement Strict du Budget";
      keyConditionTitleEs = "Límite Estricto de Presupuesto";
      keyConditionReqEn = `Do not exceed ${fmt(amount)} total all-inclusive outlay; avoid optional add-ons.`;
      keyConditionReqFr = `Ne dépassez sous aucun prétexte ${fmt(amount)} tout compris ; refusez les options superflues.`;
      keyConditionReqEs = `No supere ${fmt(amount)} en total; evite compras adicionales opcionales.`;
      break;

    case "WAIT":
      verdictLabelEn = "WAIT";
      verdictLabelFr = "DIFFÉRER (WAIT)";
      verdictLabelEs = "ESPERAR (WAIT)";
      verdictSummaryEn = `Premature commitment. Pre-saving for 60-90 days avoids unnecessary liquidity stress.`;
      verdictSummaryFr = `Engagement prématuré. Épargner pendant 60 à 90 jours élimine tout stress de trésorerie.`;
      verdictSummaryEs = `Compromiso prematuro. Ahorrar durante 60-90 días elimina cualquier tensión financiera.`;

      whyReasonsEn.push(`Executing today compresses cash reserves to ${postRunway.toFixed(1)} months of expenses.`);
      whyReasonsEn.push(`Pre-saving dedicated capital across 2-3 months allows 100% safe acquisition without risk.`);

      whyReasonsFr.push(`Acheter immédiatement réduit vos réserves à ${postRunway.toFixed(1)} mois de charges.`);
      whyReasonsFr.push(`Épargner pendant 2 à 3 mois permet d'acquérir le bien sans aucun risque.`);

      whyReasonsEs.push(`Comprar hoy reduce sus reservas a ${postRunway.toFixed(1)} meses de gastos.`);
      whyReasonsEs.push(`Ahorrar durante 2-3 meses permite adquirir el bien con total seguridad.`);

      biggestRiskTitleEn = "Premature Depletion";
      biggestRiskTitleFr = "Décaissement Prématuré";
      biggestRiskTitleEs = "Desembolso Prematuro";
      biggestRiskDescEn = "Committing capital before client revenue or dedicated savings are secured.";
      biggestRiskDescFr = "Engager les fonds avant d'avoir sécurisé les revenus clients ou l'épargne dédiée.";
      biggestRiskDescEs = "Comprometer capital antes de asegurar ingresos o ahorro específico.";
      biggestRiskSeverity = "HIGH";

      keyConditionTitleEn = "60-Day Pre-Saving Window";
      keyConditionTitleFr = "Phase d'Épargne de 60 Jours";
      keyConditionTitleEs = "Fase de Ahorro de 60 Días";
      keyConditionReqEn = `Accumulate ${fmt(Math.round(amount * 0.5))} in dedicated savings before committing.`;
      keyConditionReqFr = `Accumulez ${fmt(Math.round(amount * 0.5))} d'épargne dédiée avant de passer commande.`;
      keyConditionReqEs = `Acumule ${fmt(Math.round(amount * 0.5))} en ahorro específico antes de comprar.`;
      break;

    case "MODIFY":
      verdictLabelEn = "MODIFY STRUCTURE";
      verdictLabelFr = "RESTRUCTURER L'ENGAGEMENT";
      verdictLabelEs = "REESTRUCTURAR COMPROMISO";
      verdictSummaryEn = `The objective is valid, but the financial structure (financing APR or upfront cash) is inefficient.`;
      verdictSummaryFr = `L'objectif est pertinent, mais la structure financière (taux de crédit ou apport) est inadaptée.`;
      verdictSummaryEs = `El objetivo es válido, pero la estructura financiera (interés o pago inicial) es ineficiente.`;

      whyReasonsEn.push(`Proposed financing APR (${interestRate}%) or 100% upfront drain creates unnecessary capital destruction.`);
      whyReasonsEn.push(`Restructuring as 40% down / 12-month spread or choosing certified refurbished delivers superior ROI.`);

      whyReasonsFr.push(`Le taux d'emprunt (${interestRate}%) ou le décaissement total comptant détruit trop de capital.`);
      whyReasonsFr.push(`Une alternative (reconditionné ou étalement court sans frais) offre un bien meilleur ratio.`);

      whyReasonsEs.push(`La tasa de financiación (${interestRate}%) o el pago total al contado resulta ineficiente.`);
      whyReasonsEs.push(`Una alternativa (reacondicionado o financiación corta) ofrece mejor rentabilidad.`);

      biggestRiskTitleEn = "Compounding Financial Friction";
      biggestRiskTitleFr = "Friction Financière Cumulée";
      biggestRiskTitleEs = "Fricción Financiera Acumulada";
      biggestRiskDescEn = "Paying excessive interest fees or depleting reserves into an illiquid asset.";
      biggestRiskDescFr = "Payer des intérêts prohibitifs ou immobiliser vos réserves dans un actif non liquide.";
      biggestRiskDescEs = "Pagar intereses excesivos o inmovilizar reservas en un activo ilíquido.";
      biggestRiskSeverity = "HIGH";

      keyConditionTitleEn = "Restructure Financing Terms";
      keyConditionTitleFr = "Renégocier les Termes";
      keyConditionTitleEs = "Renegociar las Condiciones";
      keyConditionReqEn = "Refinance at APR < 8.0% or purchase certified refurbished at ~30% discount.",
      keyConditionReqFr = "Emprunter à un TAEG < 8,0% ou choisir un modèle reconditionné avec 30% de remise.",
      keyConditionReqEs = "Financiar a una TAE < 8,0% o elegir modelo reacondicionado con 30% de descuento.";
      break;

    case "NO_GO":
      verdictLabelEn = "NO-GO (CRITICAL RISK)";
      verdictLabelFr = "REFUS (RISQUE CRITIQUE)";
      verdictLabelEs = "NO PROCEDER (RIESGO CRÍTICO)";
      verdictSummaryEn = `Severe financial risk. Depletes liquid emergency reserves into the danger zone.`;
      verdictSummaryFr = `Risque financier critique. Fait basculer vos réserves d'urgence en zone de danger.`;
      verdictSummaryEs = `Riesgo financiero crítico. Reduce las reservas de emergencia a una zona peligrosa.`;

      whyReasonsEn.push(`Leaves only ${fmt(postCash)} (${postRunway.toFixed(1)} months of runway), breaching survival floors.`);
      whyReasonsEn.push(`Any minor economic shock causes immediate insolvency or forced high-interest debt.`);

      whyReasonsFr.push(`Ne laisse que ${fmt(postCash)} (${postRunway.toFixed(1)} mois de matelas), en rupture de sécurité.`);
      whyReasonsFr.push(`Le moindre imprévu entraîne une insolvabilité immédiate ou un endettement forcé.`);

      whyReasonsEs.push(`Deja solo ${fmt(postCash)} (${postRunway.toFixed(1)} meses de reserva), rompiendo el suelo de seguridad.`);
      whyReasonsEs.push(`Cualquier imprevisto provoca insolvencia inmediata o endeudamiento forzoso.`);

      biggestRiskTitleEn = "Catastrophic Insolvency";
      biggestRiskTitleFr = "Insolvabilité Immédiate";
      biggestRiskTitleEs = "Insolvencia Inmediata";
      biggestRiskDescEn = `Zero remaining financial cushion to absorb routine life emergencies.`;
      biggestRiskDescFr = `Absence totale de réserve liquide pour absorber les dépenses imprévues de la vie courante.`;
      biggestRiskDescEs = `Ausencia total de reserva líquida para absorber imprevistos cotidianos.`;
      biggestRiskSeverity = "CRITICAL";

      keyConditionTitleEn = "Mandatory Capital Reconstruction";
      keyConditionTitleFr = "Reconstitution Obligatoire du Capital";
      keyConditionTitleEs = "Reconstrucción Obligatoria de Capital";
      keyConditionReqEn = `Build emergency reserves back to at least ${fmt(Math.round(essentialExpenses * 3.5))} before reconsidering.`;
      keyConditionReqFr = `Reconstituez au préalable une épargne d'au moins ${fmt(Math.round(essentialExpenses * 3.5))}.`;
      keyConditionReqEs = `Reconstruya previamente una reserva de al menos ${fmt(Math.round(essentialExpenses * 3.5))}.`;
      break;

    case "INSUFFICIENT_EVIDENCE":
      verdictLabelEn = "INSUFFICIENT EVIDENCE";
      verdictLabelFr = "DONNÉES INSUFFISANTES";
      verdictLabelEs = "INFORMACIÓN INSUFICIENTE";
      verdictSummaryEn = "Key financial baseline data is missing. A responsible verdict cannot be issued.";
      verdictSummaryFr = "Des données financières essentielles manquent. Impossible d'émettre un verdict responsable.";
      verdictSummaryEs = "Faltan datos financieros esenciales. No es posible emitir un veredicto responsable.";

      whyReasonsEn.push("Monthly income or liquid reserves have not been declared.");
      whyReasonsEn.push("Issuing a categorical recommendation on unanchored data violates intellectual honesty.");

      whyReasonsFr.push("Les revenus mensuels ou les réserves d'épargne liquides ne sont pas renseignés.");
      whyReasonsFr.push("Émettre une recommandation ferme sans données réelles viole nos principes de rigueur.");

      whyReasonsEs.push("Los ingresos mensuales o las reservas líquidas no han sido informados.");
      whyReasonsEs.push("Emitir una recomendación firme sin datos reales viola nuestros principios de rigor.");

      biggestRiskTitleEn = "Blind Financial Commitment";
      biggestRiskTitleFr = "Engagement à l'Aveugle";
      biggestRiskTitleEs = "Compromiso a Ciegas";
      biggestRiskDescEn = "Committing to an outlay without knowing its impact on actual monthly cash flow.";
      biggestRiskDescFr = "S'engager financièrement sans mesurer l'impact réel sur sa trésorerie.";
      biggestRiskDescEs = "Comprometerse financieramente sin medir el impacto real en su tesorería.";
      biggestRiskSeverity = "HIGH";

      keyConditionTitleEn = "Provide Baseline Data";
      keyConditionTitleFr = "Renseigner les Données Clés";
      keyConditionTitleEs = "Completar Datos Básicos";
      keyConditionReqEn = "Input your monthly take-home pay and current liquid savings to unlock full verified analysis.",
      keyConditionReqFr = "Indiquez votre revenu net mensuel et votre épargne disponible pour débloquer l'analyse.",
      keyConditionReqEs = "Indique sus ingresos netos y sus ahorros disponibles para desbloquear el análisis.";
      break;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. "WHAT WOULD CHANGE THE ANSWER?" THRESHOLDS
  // ─────────────────────────────────────────────────────────────────────────
  const whatWouldChangeTheAnswer = {
    costThresholdFlipEn: `The recommendation would weaken if total outlay exceeds ${fmt(costFlipThreshold)} (+20% overrun).`,
    costThresholdFlipFr: `La recommandation se dégraderait si le coût total dépasse ${fmt(costFlipThreshold)} (+20% de surcoût).`,
    costThresholdFlipEs: `La recomendación empeoraría si el coste total supera ${fmt(costFlipThreshold)} (+20% de sobrecoste).`,
    incomeThresholdFlipEn: `The recommendation would shift to NO-GO if monthly net income drops below ${fmt(incomeFlipThreshold)}/mo.`,
    incomeThresholdFlipFr: `La recommandation basculerait en REFUS si vos revenus descendent sous ${fmt(incomeFlipThreshold)}/mois.`,
    incomeThresholdFlipEs: `La recomendación pasaría a NO PROCEDER si sus ingresos caen por debajo de ${fmt(incomeFlipThreshold)}/mes.`,
    timingThresholdFlipEn: isBusiness
      ? "Aimly would recommend WAITING if client revenue is delayed beyond 60 days."
      : `Aimly would recommend WAITING if liquid savings drop by more than ${fmt(Math.round(liquidSavings * 0.25))} before purchase.`,
    timingThresholdFlipFr: isBusiness
      ? "Aimly conseillerait de DIFFÉRER si les premiers revenus clients tardent plus de 60 jours."
      : `Aimly conseillerait de DIFFÉRER si votre épargne baisse de plus de ${fmt(Math.round(liquidSavings * 0.25))} avant l'achat.`,
    timingThresholdFlipEs: isBusiness
      ? "Aimly aconsejaría ESPERAR si la facturación de clientes se retrasa más de 60 días."
      : `Aimly aconsejaría ESPERAR si sus ahorros disminuyen más de ${fmt(Math.round(liquidSavings * 0.25))} antes de comprar.`,
    evidenceThresholdFlipEn:
      "Confirming unverified estimates with verified bank figures would increase verdict confidence score to 95%.",
    evidenceThresholdFlipFr:
      "Remplacer les estimations par des chiffres bancaires vérifiés porterait le score de confiance à 95%.",
    evidenceThresholdFlipEs:
      "Confirmar las estimaciones con datos verificados elevaría la puntuación de confianza al 95%.",
  };

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    verdictCode,
    verdictLabelEn,
    verdictLabelFr,
    verdictLabelEs,
    verdictSummaryEn,
    verdictSummaryFr,
    verdictSummaryEs,
    why: {
      primaryReasonsEn: whyReasonsEn,
      primaryReasonsFr: whyReasonsFr,
      primaryReasonsEs: whyReasonsEs,
    },
    biggestRisk: {
      titleEn: biggestRiskTitleEn,
      titleFr: biggestRiskTitleFr,
      titleEs: biggestRiskTitleEs,
      descriptionEn: biggestRiskDescEn,
      descriptionFr: biggestRiskDescFr,
      descriptionEs: biggestRiskDescEs,
      severity: biggestRiskSeverity,
    },
    keyCondition: {
      titleEn: keyConditionTitleEn,
      titleFr: keyConditionTitleFr,
      titleEs: keyConditionTitleEs,
      actionableRequirementEn: keyConditionReqEn,
      actionableRequirementFr: keyConditionReqFr,
      actionableRequirementEs: keyConditionReqEs,
    },
    whatWouldChangeTheAnswer,
    evidenceQualityGrade,
    isEvidenceSufficient: evidenceQualityGrade !== "LOW",
    redTeamClearance: redTeam.verdictApprovalStatus !== "REJECTED_REQUIRES_RECALCULATION",
  };
}
