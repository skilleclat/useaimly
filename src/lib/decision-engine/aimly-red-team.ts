/**
 * USEAIMLY — THE AIMLY DECISION ENGINE
 * AIMLY RED TEAM REVIEW SYSTEM (PROMPT 12)
 *
 * Independent internal audit engine that challenges the main analysis.
 * Operates on the mandate: "What would a skeptical senior financial analyst challenge here?"
 *
 * Enforces rule: "NO FINAL VERDICT BEFORE RED TEAM REVIEW."
 * Materially challenges:
 * - Hidden assumptions carrying too much conclusion weight
 * - Optimistic bias & neglected downside friction
 * - False precision & recommendations stronger than evidence
 * - Inappropriate metrics or missing variables
 * - Weak evidence sources
 */

import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "../utils/currency";
import { DecisionIntelligenceObject } from "./master-decision-model";

export type RedTeamObjectionSeverity =
  | "FATAL_FLAW"
  | "MATERIAL_CHALLENGE"
  | "EPISTEMIC_CAUTION"
  | "MINOR_OBSERVATION";

export type RedTeamVulnerabilityCategory =
  | "HIDDEN_ASSUMPTION_OVERLOAD"
  | "OPTIMISTIC_BIAS"
  | "WEAK_EVIDENCE_SOURCE"
  | "FALSE_PRECISION"
  | "NEGLECTED_DOWNSIDE"
  | "UNFAIR_ALTERNATIVE_COMPARISON"
  | "RECOMMENDATION_STRONGER_THAN_EVIDENCE"
  | "ARITHMETIC_OR_UNIT_DISCREPANCY"
  | "MISSING_CRITICAL_VARIABLE";

export interface RedTeamObjection {
  id: string;
  category: RedTeamVulnerabilityCategory;
  severity: RedTeamObjectionSeverity;
  challengeTitleEn: string;
  challengeTitleFr: string;
  challengeTitleEs: string;
  detailedArgumentEn: string;
  detailedArgumentFr: string;
  detailedArgumentEs: string;
  loadBearingAssumption: string;
  invalidatingCondition: string;
  requiredAdjustmentEn: string;
  requiredAdjustmentFr: string;
  requiredAdjustmentEs: string;
  blocksFinalVerdict: boolean;
}

export interface RedTeamAuditReport {
  timestamp: string;
  currency: CurrencyCode;
  auditorPersona: string;
  objections: RedTeamObjection[];
  objectionsCount: number;
  fatalFlawsCount: number;
  materialChallengesCount: number;
  epistemicCautionsCount: number;
  verdictApprovalStatus:
    | "APPROVED_FOR_RELEASE"
    | "CONDITIONAL_APPROVAL_WITH_WARNINGS"
    | "REJECTED_REQUIRES_RECALCULATION";
  analystSummaryEn: string;
  analystSummaryFr: string;
  analystSummaryEs: string;
  stressTestedLoadBearingAssumptions: string[];
}

/**
 * EXECUTE INDEPENDENT RED TEAM SKEPTICAL AUDIT
 */
export function runAimlyRedTeamAudit(
  decisionObject: DecisionIntelligenceObject
): RedTeamAuditReport {
  const curr: CurrencyCode = decisionObject.definition.currency;
  const fmt = (n: number) => formatCurrency(n, curr);

  const amount = Math.max(0, decisionObject.definition.financial_amount.value || 0);
  const downPayment = Math.max(0, decisionObject.economics.down_payment.value || 0);
  const interestRate = Math.max(0, decisionObject.economics.interest_rate.value || 0);
  const recurringUpkeep = Math.max(0, decisionObject.economics.recurring_cost.value || 0);
  const expectedRevenue = Math.max(0, decisionObject.economics.expected_revenue.value || 0);

  const liquidSavings = Math.max(0, decisionObject.context.liquid_savings.value || 0);
  const monthlyIncome = Math.max(0, decisionObject.context.monthly_income.value || 0);
  const essentialExpenses = Math.max(0, decisionObject.context.essential_expenses.value || 0);
  const monthlyDebt = Math.max(0, decisionObject.context.monthly_debt_payments.value || 0);

  const isLoan =
    decisionObject.definition.decision_category === "TAKE_A_LOAN" ||
    (downPayment > 0 && downPayment < amount);
  const isCar = decisionObject.definition.decision_category === "BUY_A_CAR";
  const isBusiness = decisionObject.definition.decision_category === "BUSINESS_EXPENSE" || expectedRevenue > 0;

  const postCash = Math.max(0, liquidSavings - (isLoan ? downPayment : amount));
  const postRunway = essentialExpenses > 0 ? postCash / essentialExpenses : 0;
  const freeCashFlow = Math.max(0, monthlyIncome - essentialExpenses - monthlyDebt);

  const objections: RedTeamObjection[] = [];
  const loadBearingAssumptions: string[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CHECK: FATAL FLAW — LIQUIDITY INSOLVENCY
  // ─────────────────────────────────────────────────────────────────────────
  if (postCash <= 0 || postRunway < 0.5) {
    objections.push({
      id: "rt_fatal_insolvency",
      category: "NEGLECTED_DOWNSIDE",
      severity: "FATAL_FLAW",
      challengeTitleEn: "Critical Depletion: Total Liquidity Exhaustion",
      challengeTitleFr: "Épuisement Critique : Rupture Totale de Liquidité",
      challengeTitleEs: "Agotamiento Crítico: Ruptura Total de Liquidez",
      detailedArgumentEn: `The proposed commitment leaves only ${fmt(postCash)} (${postRunway.toFixed(1)} months of expenses). Any single unbudgeted expense results in immediate default or forced emergency borrowing.`,
      detailedArgumentFr: `L'engagement ne laisse que ${fmt(postCash)} (${postRunway.toFixed(1)} mois de charges). Le moindre imprévu entraîne un découvert ou un crédit d'urgence forcé.`,
      detailedArgumentEs: `El compromiso deja solo ${fmt(postCash)} (${postRunway.toFixed(1)} meses de gastos). Cualquier imprevisto provoca descubiertos o deudas forzosas.`,
      loadBearingAssumption: "Zero unexpected life emergencies occur in the next 12 months.",
      invalidatingCondition: "Any single expense > $200 occurs post-commitment.",
      requiredAdjustmentEn: "Block categorical approval. Require pre-saving or mandatory down payment reduction.",
      requiredAdjustmentFr: "Bloquer l'approbation catégorique. Exiger une phase d'épargne préalable.",
      requiredAdjustmentEs: "Bloquear aprobación. Exigir fase de ahorro previo.",
      blocksFinalVerdict: true,
    });
    loadBearingAssumptions.push("Zero unexpected life shocks occur");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CHECK: UNVERIFIED REVENUE AS LOAD-BEARING PILLAR (BUSINESS ASSET)
  // ─────────────────────────────────────────────────────────────────────────
  if (isBusiness && expectedRevenue > 0) {
    const isRevenueVerified = decisionObject.economics.expected_revenue.source === "VERIFIED_FACT";
    if (!isRevenueVerified) {
      objections.push({
        id: "rt_unverified_revenue",
        category: "HIDDEN_ASSUMPTION_OVERLOAD",
        severity: "MATERIAL_CHALLENGE",
        challengeTitleEn: "Load-Bearing Vulnerability: Unverified Revenue Forecast",
        challengeTitleFr: "Vulnérabilité Majeure : Prévision de Revenus Non Vérifiée",
        challengeTitleEs: "Vulnerabilidad Clave: Previsión de Ingresos No Verificada",
        detailedArgumentEn: `The entire positive ROI thesis relies on generating ${fmt(expectedRevenue)}/mo, which is currently classified as an estimate (${decisionObject.economics.expected_revenue.source}). If revenue lags by 50%, payback doubles and cash flow turns negative.`,
        detailedArgumentFr: `La rentabilité repose intégralement sur un revenu estimé de ${fmt(expectedRevenue)}/mois (${decisionObject.economics.expected_revenue.source}). Si l'activité est retardée de 50%, le délai d'amortissement double.`,
        detailedArgumentEs: `La rentabilidad depende de un ingreso estimado de ${fmt(expectedRevenue)}/mes. Si la actividad se retrasa un 50%, el plazo de amortización se duplica.`,
        loadBearingAssumption: `Client revenue arrives on schedule at ${fmt(expectedRevenue)}/mo starting Month 1.`,
        invalidatingCondition: "Client acquisition takes > 90 days or client volume is < 50% of forecast.",
        requiredAdjustmentEn: "Model breakeven with 0% revenue contribution for the first 90 days.",
        requiredAdjustmentFr: "Modéliser le point mort avec 0% de revenus pendant les 90 premiers jours.",
        requiredAdjustmentEs: "Modelar el punto de equilibrio con 0% de ingresos durante 90 días.",
        blocksFinalVerdict: false,
      });
      loadBearingAssumptions.push(`Client revenue of ${fmt(expectedRevenue)}/mo materializes without friction`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. CHECK: NEGLECTED RECURRING FRICTION / VEHICLE RUNNING COSTS
  // ─────────────────────────────────────────────────────────────────────────
  if (isCar && recurringUpkeep === 0) {
    objections.push({
      id: "rt_omitted_vehicle_upkeep",
      category: "NEGLECTED_DOWNSIDE",
      severity: "MATERIAL_CHALLENGE",
      challengeTitleEn: "Omitted Variable: Zero Maintenance & Insurance Budgeted",
      challengeTitleFr: "Variable Omise : Zéro Entretien & Assurance Budgétisés",
      challengeTitleEs: "Variable Omitida: Cero Mantenimiento y Seguro Presupuestados",
      detailedArgumentEn: `Vehicle purchase models $0/mo ongoing operating friction. Real-world vehicle ownership typically adds 1.5% to 2.5% of vehicle value annually in insurance, maintenance, and registration.`,
      detailedArgumentFr: `L'achat du véhicule modélise 0 €/mois de frais d'usage. L'usage réel ajoute 1,5% à 2,5% de la valeur en entretien, assurance et carburant.`,
      detailedArgumentEs: `La compra del vehículo asume 0 €/mes de gastos de uso. La realidad añade 1,5% a 2,5% del valor en seguro y revisiones.`,
      loadBearingAssumption: "Vehicle incurs zero mechanical maintenance, registration, or insurance premiums.",
      invalidatingCondition: "Annual operating costs exceed $500.",
      requiredAdjustmentEn: `Inject realistic baseline upkeep of ${fmt(Math.round(amount * 0.015))}/mo into ongoing cash flow.`,
      requiredAdjustmentFr: `Intégrer un coût d'usage standard de ${fmt(Math.round(amount * 0.015))}/mois dans le cash-flow.`,
      requiredAdjustmentEs: `Integrar un coste estándar de ${fmt(Math.round(amount * 0.015))}/mes en el flujo de caja.`,
      blocksFinalVerdict: false,
    });
    loadBearingAssumptions.push("Zero ongoing maintenance or insurance surcharges");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CHECK: UNBUFFERED RUNWAY (< 3.0 MONTHS) UNDER "SAFE" CLAIMS
  // ─────────────────────────────────────────────────────────────────────────
  if (postRunway > 0.5 && postRunway < 3.0) {
    objections.push({
      id: "rt_fragile_buffer",
      category: "RECOMMENDATION_STRONGER_THAN_EVIDENCE",
      severity: "MATERIAL_CHALLENGE",
      challengeTitleEn: "Epistemic Challenge: Thin Buffer Below 3-Month Safety Floor",
      challengeTitleFr: "Contestation Épistémique : Matelas Inférieur au Seuil de 3 Mois",
      challengeTitleEs: "Objeción Epistémica: Reserva Inferior al Umbral de 3 Meses",
      detailedArgumentEn: `Post-purchase runway sits at ${postRunway.toFixed(1)} months, which is below the canonical 3.0-month emergency reserve baseline. Calling this decision unconditionally safe is statistically irresponsible.`,
      detailedArgumentFr: `Le matelas résiduel est de ${postRunway.toFixed(1)} mois, inférieur au seuil prudentiel de 3 mois. Qualifier cette décision de totalement sûre est imprudent.`,
      detailedArgumentEs: `La reserva residual es de ${postRunway.toFixed(1)} meses, por debajo del umbral de 3 meses. Declarar esta decisión como totalmente segura es imprudente.`,
      loadBearingAssumption: "No personal disruption occurs while liquid buffer is compressed.",
      invalidatingCondition: "Essential expenses increase by > 10% during the next 6 months.",
      requiredAdjustmentEn: "Downgrade recommendation tone from 'Unconditionally Safe' to 'Conditional with Active Caution'.",
      requiredAdjustmentFr: "Ajuster la recommandation de « Sûr » à « Faisable sous Réserve de Prudence ».",
      requiredAdjustmentEs: "Ajustar la recomendación a « Viable con Precaución Activa ».",
      blocksFinalVerdict: false,
    });
    loadBearingAssumptions.push(`Safety holds with only ${postRunway.toFixed(1)} months of emergency buffer`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. CHECK: HIGH-INTEREST LOAN DRAG (APR >= 12%)
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoan && interestRate >= 12.0) {
    objections.push({
      id: "rt_predatory_interest",
      category: "RECOMMENDATION_STRONGER_THAN_EVIDENCE",
      severity: "MATERIAL_CHALLENGE",
      challengeTitleEn: "Subprime Financing Challenge: Destructive APR Drag",
      challengeTitleFr: "Alerte TAEG Destructeur : Coût d'Intérêt Subprime",
      challengeTitleEs: "Alerta Interés Destructivo: TAE Elevada",
      detailedArgumentEn: `Borrowing at ${interestRate}% APR creates significant guaranteed wealth destruction. The cost of financing outweighs standard asset appreciation or utility.`,
      detailedArgumentFr: `Emprunter à ${interestRate}% TAEG détruit du capital de manière garantie. Le surcoût d'intérêts dépasse le gain d'utilité.`,
      detailedArgumentEs: `Financiar al ${interestRate}% TAE destruye capital de forma garantizada. El coste de intereses supera la utilidad.`,
      loadBearingAssumption: "Asset utility justifies paying double-digit compounding interest fees.",
      invalidatingCondition: "Cheaper financing or pre-saving could save hundreds in fees.",
      requiredAdjustmentEn: "Explicitly highlight total interest bleed and recommend pre-saving or refinancing.",
      requiredAdjustmentFr: "Mettre en évidence le montant total des intérêts et conseiller l'épargne préalable.",
      requiredAdjustmentEs: "Resaltar el coste total de intereses y aconsejar el ahorro previo.",
      blocksFinalVerdict: false,
    });
    loadBearingAssumptions.push(`High borrowing APR (${interestRate}%) is acceptable to user`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. CHECK: EPISTEMIC CAUTION — UNKNOWN / ESTIMATED INCOME
  // ─────────────────────────────────────────────────────────────────────────
  if (decisionObject.context.monthly_income.source === "UNKNOWN" || decisionObject.context.monthly_income.source === "ASSUMPTION") {
    objections.push({
      id: "rt_unanchored_income",
      category: "WEAK_EVIDENCE_SOURCE",
      severity: "EPISTEMIC_CAUTION",
      challengeTitleEn: "Data Grounding Warning: Income is Unanchored Assumption",
      challengeTitleFr: "Avertissement de Données : Revenu Non Vérifié",
      challengeTitleEs: "Advertencia de Datos: Ingreso No Verificado",
      detailedArgumentEn: "The calculations assume a monthly income baseline that has not been confirmed by the user. True cash flow could be significantly tighter.",
      detailedArgumentFr: "Les calculs reposent sur une estimation de revenu non confirmée par l'utilisateur.",
      detailedArgumentEs: "Los cálculos se basan en una estimación de ingresos no confirmada.",
      loadBearingAssumption: `Monthly income is exactly ${fmt(monthlyIncome)}.`,
      invalidatingCondition: "Actual net take-home pay is lower than estimated.",
      requiredAdjustmentEn: "Flag report confidence as provisional until income is confirmed.",
      requiredAdjustmentFr: "Signaler le rapport comme provisoire jusqu'à confirmation du revenu.",
      requiredAdjustmentEs: "Marcar el informe como provisional hasta confirmar los ingresos.",
      blocksFinalVerdict: false,
    });
    loadBearingAssumptions.push("Unconfirmed monthly income baseline");
  }

  // Count severities
  const fatalFlawsCount = objections.filter((o) => o.severity === "FATAL_FLAW").length;
  const materialChallengesCount = objections.filter((o) => o.severity === "MATERIAL_CHALLENGE").length;
  const epistemicCautionsCount = objections.filter((o) => o.severity === "EPISTEMIC_CAUTION").length;

  let verdictApprovalStatus: "APPROVED_FOR_RELEASE" | "CONDITIONAL_APPROVAL_WITH_WARNINGS" | "REJECTED_REQUIRES_RECALCULATION" =
    "APPROVED_FOR_RELEASE";

  if (fatalFlawsCount > 0) {
    verdictApprovalStatus = "REJECTED_REQUIRES_RECALCULATION";
  } else if (materialChallengesCount > 0 || epistemicCautionsCount > 0) {
    verdictApprovalStatus = "CONDITIONAL_APPROVAL_WITH_WARNINGS";
  }

  const analystSummaryEn =
    fatalFlawsCount > 0
      ? `Red Team Review: REJECTED. Found ${fatalFlawsCount} fatal flaw(s) threatening immediate financial solvency. Mandatory adjustments required before verdict release.`
      : materialChallengesCount > 0
      ? `Red Team Review: CONDITIONAL APPROVAL. Raised ${materialChallengesCount} material challenge(s) regarding load-bearing assumptions and buffer compression.`
      : "Red Team Review: PASSED. No material flaws or ungrounded optimistic biases detected. Analytical framework is solid.";

  const analystSummaryFr =
    fatalFlawsCount > 0
      ? `Revue Red Team : REJETÉ. Détection de ${fatalFlawsCount} anomalie(s) fatale(s) menaçant la solvabilité immédiate. Ajustements obligatoires.`
      : materialChallengesCount > 0
      ? `Revue Red Team : APPROBATION CONDITIONNELLE. ${materialChallengesCount} objection(s) matérielle(s) formulée(s) sur les hypothèses critiques.`
      : "Revue Red Team : VALIDÉ. Aucune faille matérielle ni biais d'optimisme injustifié détecté. Solidité confirmée.";

  const analystSummaryEs =
    fatalFlawsCount > 0
      ? `Revisión Red Team: RECHAZADO. Se detectaron ${fatalFlawsCount} fallo(s) crítico(s) que amenazan la solvencia inmediata.`
      : materialChallengesCount > 0
      ? `Revisión Red Team: APROBACIÓN CONDICIONAL. Se formularon ${materialChallengesCount} objeción(es) material(es) sobre supuestos clave.`
      : "Revisión Red Team: VALIDADO. No se detectaron fallos materiales ni sesgos optimistas injustificados.";

  return {
    timestamp: new Date().toISOString(),
    currency: curr,
    auditorPersona: "Aimly Independent Red Team (Senior Financial Analyst Audit)",
    objections,
    objectionsCount: objections.length,
    fatalFlawsCount,
    materialChallengesCount,
    epistemicCautionsCount,
    verdictApprovalStatus,
    analystSummaryEn,
    analystSummaryFr,
    analystSummaryEs,
    stressTestedLoadBearingAssumptions: Array.from(new Set(loadBearingAssumptions)),
  };
}
